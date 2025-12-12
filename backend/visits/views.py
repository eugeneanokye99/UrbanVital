# visits/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Avg
from django.utils import timezone
from .models import Visit, VitalSigns
from .serializers import VisitSerializer, VitalSignsSerializer
from datetime import timedelta, datetime

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def visit_dashboard_stats(request):
    """Get visit statistics for dashboard"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # Today's visits
    today_visits = Visit.objects.filter(check_in_time__date=today).count()
    
    # Active visits (not completed or cancelled)
    active_visits = Visit.objects.exclude(
        status__in=['Completed', 'Cancelled']
    ).count()
    
    # Visits by status
    status_stats = {
        status[0]: Visit.objects.filter(status=status[0]).count()
        for status in Visit.STATUS_CHOICES
    }
    
    # Average wait time (simple calculation)
    wait_times = Visit.objects.filter(
        seen_by_doctor_time__isnull=False,
        check_in_time__isnull=False
    ).annotate(
        wait_time=models.ExpressionWrapper(
            models.F('seen_by_doctor_time') - models.F('check_in_time'),
            output_field=models.DurationField()
        )
    ).aggregate(avg_wait=Avg('wait_time'))
    
    avg_wait_minutes = 0
    if wait_times['avg_wait']:
        avg_wait_minutes = wait_times['avg_wait'].total_seconds() / 60
    
    # Weekly visits trend
    weekly_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_visits = Visit.objects.filter(check_in_time__date=day).count()
        weekly_data.append({
            'day': day.strftime('%a'),
            'date': day.strftime('%Y-%m-%d'),
            'visits': day_visits,
        })
    
    weekly_data.reverse()  # Oldest to newest
    
    return Response({
        'today_visits': today_visits,
        'active_visits': active_visits,
        'status_stats': status_stats,
        'avg_wait_minutes': round(avg_wait_minutes, 1),
        'weekly_data': weekly_data,
    })

class VisitListView(generics.ListCreateAPIView):
    """GET: List all visits, POST: Create new visit (check-in)"""
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Visit.objects.all().select_related('patient', 'created_by', 'assigned_doctor')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Search by patient name or MRN
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(patient__name__icontains=search_query) |
                Q(patient__first_name__icontains=search_query) |
                Q(patient__last_name__icontains=search_query) |
                Q(patient__mrn__icontains=search_query)
            )
        
        # Filter by date
        date_filter = self.request.query_params.get('date', None)
        if date_filter:
            queryset = queryset.filter(check_in_time__date=date_filter)
        
        return queryset.order_by('-check_in_time')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class VisitDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single visit operations"""
    queryset = Visit.objects.all()
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

class UpdateVisitStatusView(APIView):
    """PATCH: Update visit status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, id):
        try:
            visit = Visit.objects.get(id=id)
            new_status = request.data.get('status')
            
            if not new_status:
                return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update status and timestamps
            visit.status = new_status
            
            if new_status == 'In Consultation' and not visit.seen_by_doctor_time:
                visit.seen_by_doctor_time = timezone.now()
            elif new_status == 'Completed' and not visit.completed_time:
                visit.completed_time = timezone.now()
            
            visit.save()
            serializer = VisitSerializer(visit)
            return Response(serializer.data)
        except Visit.DoesNotExist:
            return Response({'error': 'Visit not found'}, status=status.HTTP_404_NOT_FOUND)

class ActiveVisitsView(generics.ListAPIView):
    """GET: Active visits (not completed or cancelled)"""
    serializer_class = VisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Visit.objects.exclude(
            status__in=['Completed', 'Cancelled']
        ).select_related('patient', 'assigned_doctor').order_by(
            '-priority', 'check_in_time'
        )

class VisitStatsView(APIView):
    """GET: Visit statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        stats = {
            'total_today': Visit.objects.filter(check_in_time__date=today).count(),
            'active_now': Visit.objects.filter(
                check_in_time__date=today
            ).exclude(status__in=['Completed', 'Cancelled']).count(),
            'by_status': {},
            'by_service': {},
        }
        
        # Count by status
        for status_code, status_name in Visit.STATUS_CHOICES:
            stats['by_status'][status_name] = Visit.objects.filter(
                check_in_time__date=today,
                status=status_code
            ).count()
        
        # Count by service
        for service_code, service_name in Visit.SERVICE_CHOICES:
            stats['by_service'][service_name] = Visit.objects.filter(
                check_in_time__date=today,
                service_type=service_code
            ).count()
        
        return Response(stats)

# Vital Signs Views
class VitalSignsCreateView(generics.CreateAPIView):
    """POST: Record vitals for a visit"""
    queryset = VitalSigns.objects.all()
    serializer_class = VitalSignsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(taken_by=self.request.user)

class VitalSignsDetailView(generics.RetrieveUpdateAPIView):
    """GET/PUT: Vital signs for a visit"""
    queryset = VitalSigns.objects.all()
    serializer_class = VitalSignsSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "visit_id"