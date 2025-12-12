# patients/views.py
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Count
from .models import Patient
from .serializers import PatientSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_dashboard_stats(request):
    """Get patient statistics for dashboard"""
    today = timezone.now().date()
    
    # Total patients
    total_patients = Patient.objects.count()
    
    # Today's new patients
    today_patients = Patient.objects.filter(created_at__date=today).count()
    
    # Patients by gender
    gender_stats = Patient.objects.values('gender').annotate(count=Count('id'))
    
    # Recent patients (last 7 days)
    week_ago = today - timedelta(days=7)
    weekly_patients = Patient.objects.filter(created_at__date__gte=week_ago).count()
    
    # Age distribution
    age_stats = {
        '0-18': Patient.objects.filter(date_of_birth__isnull=False).annotate(
            age=timezone.now().year - models.F('date_of_birth__year')
        ).filter(age__lte=18).count(),
        '19-40': Patient.objects.filter(date_of_birth__isnull=False).annotate(
            age=timezone.now().year - models.F('date_of_birth__year')
        ).filter(age__gt=18, age__lte=40).count(),
        '41-60': Patient.objects.filter(date_of_birth__isnull=False).annotate(
            age=timezone.now().year - models.F('date_of_birth__year')
        ).filter(age__gt=40, age__lte=60).count(),
        '60+': Patient.objects.filter(date_of_birth__isnull=False).annotate(
            age=timezone.now().year - models.F('date_of_birth__year')
        ).filter(age__gt=60).count(),
    }
    
    return Response({
        'total_patients': total_patients,
        'today_patients': today_patients,
        'weekly_patients': weekly_patients,
        'gender_stats': gender_stats,
        'age_stats': age_stats,
    })

class PatientListView(generics.ListAPIView):
    """GET: List all patients (with optional search)"""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Patient.objects.all().order_by("-created_at")
        
        # Add search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(mrn__icontains=search_query) |
                Q(phone__icontains=search_query) |
                Q(id_number__icontains=search_query)
            )
        
        # Add gender filter
        gender = self.request.query_params.get('gender', None)
        if gender:
            queryset = queryset.filter(gender=gender)
        
        # Add flag filter
        flag_filter = self.request.query_params.get('flag', None)
        if flag_filter and flag_filter != 'All':
            queryset = queryset.filter(medical_flags__icontains=flag_filter)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Add total count to response"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        response_data = {
            'count': queryset.count(),
            'results': serializer.data
        }
        return Response(response_data)

class PatientCreateView(generics.CreateAPIView):
    """POST: Create a new patient"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single patient operations"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

class PatientStatsView(APIView):
    """GET: Patient statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        total_patients = Patient.objects.count()
        
        # Count by gender
        gender_stats = {
            'Male': Patient.objects.filter(gender='Male').count(),
            'Female': Patient.objects.filter(gender='Female').count(),
            'Other': Patient.objects.filter(gender='Other').count(),
        }
        
        # Count by payment mode
        payment_stats = {
            mode: Patient.objects.filter(payment_mode=mode).count()
            for mode in dict(Patient.PAYMENT_MODE_CHOICES).keys()
        }
        
        return Response({
            'total_patients': total_patients,
            'gender_stats': gender_stats,
            'payment_stats': payment_stats,
        })