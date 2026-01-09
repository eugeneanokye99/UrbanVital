# ultrasound/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta, date
from .models import UltrasoundOrder, UltrasoundScan, UltrasoundImage, UltrasoundEquipment
from .serializers import (
    UltrasoundOrderSerializer, 
    UltrasoundScanSerializer,
    UltrasoundScanListSerializer,
    UltrasoundImageSerializer,
    UltrasoundEquipmentSerializer
)


# ============ ULTRASOUND ORDERS ============

class UltrasoundOrderListView(generics.ListCreateAPIView):
    """GET: List ultrasound orders, POST: Create new ultrasound order"""
    serializer_class = UltrasoundOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['patient__name', 'patient__first_name', 'patient__last_name', 'patient__mrn', 'scan_type']
    filterset_fields = ['status', 'urgency', 'scan_type']
    ordering_fields = ['ordered_at', 'urgency', 'status']
    ordering = ['-ordered_at']
    
    def get_queryset(self):
        queryset = UltrasoundOrder.objects.all().select_related('patient', 'ordered_by', 'visit')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by urgency
        urgency_filter = self.request.query_params.get('urgency', None)
        if urgency_filter:
            queryset = queryset.filter(urgency=urgency_filter)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(ordered_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(ordered_at__date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(ordered_by=self.request.user)


class UltrasoundOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single ultrasound order operations"""
    queryset = UltrasoundOrder.objects.all()
    serializer_class = UltrasoundOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class PendingUltrasoundOrdersView(generics.ListAPIView):
    """GET: List pending ultrasound orders (worklist)"""
    serializer_class = UltrasoundOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UltrasoundOrder.objects.filter(
            status__in=['Pending', 'Scheduled']
        ).select_related('patient', 'ordered_by').order_by('urgency', 'ordered_at')


class UpdateUltrasoundOrderStatusView(APIView):
    """POST: Update ultrasound order status"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            order = UltrasoundOrder.objects.get(id=id)
        except UltrasoundOrder.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        new_status = request.data.get('status')
        if new_status not in dict(UltrasoundOrder.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        
        # Set scheduled_date if provided
        if 'scheduled_date' in request.data:
            order.scheduled_date = request.data['scheduled_date']
        
        order.save()
        
        serializer = UltrasoundOrderSerializer(order)
        return Response(serializer.data)


# ============ ULTRASOUND SCANS ============

class UltrasoundScanListView(generics.ListCreateAPIView):
    """GET: List ultrasound scans, POST: Create new scan"""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['scan_number', 'patient__name', 'patient__first_name', 'patient__last_name', 'patient__mrn']
    filterset_fields = ['status', 'scan_type']
    ordering_fields = ['created_at', 'scan_completed_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UltrasoundScanListSerializer
        return UltrasoundScanSerializer
    
    def get_queryset(self):
        queryset = UltrasoundScan.objects.all().select_related('patient', 'performed_by', 'order')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        # Set performed_by to current user
        scan = serializer.save(performed_by=self.request.user)
        
        # If order is provided, update its status
        if scan.order:
            scan.order.status = 'In Progress'
            scan.order.save()


class UltrasoundScanDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single ultrasound scan operations"""
    queryset = UltrasoundScan.objects.all()
    serializer_class = UltrasoundScanSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


class CompletedUltrasoundScansView(generics.ListAPIView):
    """GET: List completed ultrasound scans"""
    serializer_class = UltrasoundScanListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['scan_number', 'patient__name', 'patient__mrn']
    ordering = ['-scan_completed_at']
    
    def get_queryset(self):
        return UltrasoundScan.objects.filter(
            status__in=['Completed', 'Verified']
        ).select_related('patient', 'performed_by')


class VerifyUltrasoundScanView(APIView):
    """POST: Verify an ultrasound scan"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            scan = UltrasoundScan.objects.get(id=id)
        except UltrasoundScan.DoesNotExist:
            return Response(
                {'error': 'Scan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if scan.status != 'Completed':
            return Response(
                {'error': 'Only completed scans can be verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        scan.status = 'Verified'
        scan.verified_by = request.user
        scan.verified_at = timezone.now()
        scan.save()
        
        # Update order status if exists
        if scan.order:
            scan.order.status = 'Completed'
            scan.order.save()
        
        serializer = UltrasoundScanSerializer(scan)
        return Response(serializer.data)


class CompleteScanView(APIView):
    """POST: Mark scan as completed"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        try:
            scan = UltrasoundScan.objects.get(id=id)
        except UltrasoundScan.DoesNotExist:
            return Response(
                {'error': 'Scan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        scan.status = 'Completed'
        if not scan.scan_completed_at:
            scan.scan_completed_at = timezone.now()
        scan.save()
        
        serializer = UltrasoundScanSerializer(scan)
        return Response(serializer.data)


# ============ ULTRASOUND IMAGES ============

class UltrasoundImageListView(generics.ListCreateAPIView):
    """GET: List images for a scan, POST: Upload new image"""
    serializer_class = UltrasoundImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        scan_id = self.request.query_params.get('scan_id', None)
        if scan_id:
            return UltrasoundImage.objects.filter(scan_id=scan_id)
        return UltrasoundImage.objects.all()


class UltrasoundImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single image operations"""
    queryset = UltrasoundImage.objects.all()
    serializer_class = UltrasoundImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


# ============ ULTRASOUND EQUIPMENT ============

class UltrasoundEquipmentListView(generics.ListCreateAPIView):
    """GET: List equipment, POST: Create new equipment"""
    queryset = UltrasoundEquipment.objects.all()
    serializer_class = UltrasoundEquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'model', 'serial_number']
    filterset_fields = ['status']
    ordering = ['name']


class UltrasoundEquipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single equipment operations"""
    queryset = UltrasoundEquipment.objects.all()
    serializer_class = UltrasoundEquipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


# ============ STATISTICS & DASHBOARD ============

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ultrasound_stats(request):
    """Get ultrasound statistics for dashboard"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Today's stats
    today_scans = UltrasoundScan.objects.filter(created_at__date=today).count()
    pending_orders = UltrasoundOrder.objects.filter(status__in=['Pending', 'Scheduled']).count()
    in_progress = UltrasoundScan.objects.filter(status='In Progress').count()
    completed_today = UltrasoundScan.objects.filter(
        scan_completed_at__date=today,
        status__in=['Completed', 'Verified']
    ).count()
    
    # Orders by status
    order_status_stats = {}
    for choice in UltrasoundOrder.STATUS_CHOICES:
        status_value = choice[0]
        count = UltrasoundOrder.objects.filter(status=status_value).count()
        order_status_stats[status_value] = count
    
    # Scans by type (this month)
    scan_type_stats = UltrasoundScan.objects.filter(
        created_at__date__gte=month_ago
    ).values('scan_type').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Weekly trend
    weekly_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_scans = UltrasoundScan.objects.filter(created_at__date=day).count()
        weekly_data.append({
            'day': day.strftime('%a'),
            'date': day.strftime('%Y-%m-%d'),
            'scans': day_scans,
        })
    weekly_data.reverse()
    
    # Equipment status
    equipment_stats = {}
    for choice in UltrasoundEquipment.STATUS_CHOICES:
        status_value = choice[0]
        count = UltrasoundEquipment.objects.filter(status=status_value).count()
        equipment_stats[status_value] = count
    
    # Recent completed scans
    recent_completed = UltrasoundScanListSerializer(
        UltrasoundScan.objects.filter(
            status__in=['Completed', 'Verified']
        ).order_by('-scan_completed_at')[:5],
        many=True
    ).data
    
    return Response({
        'today_scans': today_scans,
        'pending_orders': pending_orders,
        'in_progress': in_progress,
        'completed_today': completed_today,
        'order_status_stats': order_status_stats,
        'scan_type_stats': list(scan_type_stats),
        'weekly_data': weekly_data,
        'equipment_stats': equipment_stats,
        'recent_completed': recent_completed,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def ultrasound_worklist(request):
    """Get worklist view data (pending orders + in-progress scans)"""
    
    # Pending orders
    pending_orders = UltrasoundOrderSerializer(
        UltrasoundOrder.objects.filter(
            status__in=['Pending', 'Scheduled']
        ).select_related('patient', 'ordered_by').order_by('urgency', 'ordered_at'),
        many=True
    ).data
    
    # In progress scans
    in_progress_scans = UltrasoundScanListSerializer(
        UltrasoundScan.objects.filter(
            status='In Progress'
        ).select_related('patient', 'performed_by').order_by('-scan_started_at'),
        many=True
    ).data
    
    return Response({
        'pending_orders': pending_orders,
        'in_progress_scans': in_progress_scans,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def patient_ultrasound_history(request, patient_id):
    """Get all ultrasound scans for a patient"""
    
    scans = UltrasoundScanSerializer(
        UltrasoundScan.objects.filter(
            patient_id=patient_id
        ).select_related('performed_by', 'verified_by', 'order').order_by('-created_at'),
        many=True
    ).data
    
    orders = UltrasoundOrderSerializer(
        UltrasoundOrder.objects.filter(
            patient_id=patient_id
        ).select_related('ordered_by').order_by('-ordered_at'),
        many=True
    ).data
    
    return Response({
        'scans': scans,
        'orders': orders,
    })
