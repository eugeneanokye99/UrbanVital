from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import LabTest, LabOrder, LabOrderTest, LabResult
from .serializers import (
    LabTestSerializer,
    LabOrderSerializer,
    LabResultSerializer,
)


# ============ LAB TESTS (CATALOG) ============

class LabTestListView(generics.ListCreateAPIView):
    """GET: List all lab tests, POST: Create new lab test"""
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['name', 'code', 'category']
    filterset_fields = ['category', 'is_active', 'sample_type']
    ordering_fields = ['name', 'category', 'created_at']
    ordering = ['category', 'name']
    
    def get_queryset(self):
        queryset = LabTest.objects.all()
        
        # Only show active tests by default unless specifically requested
        show_inactive = self.request.query_params.get('show_inactive', 'false').lower() == 'true'
        if not show_inactive:
            queryset = queryset.filter(is_active=True)
        
        return queryset


class LabTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single lab test operations"""
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


# ============ LAB ORDERS ============

class LabOrderListView(generics.ListCreateAPIView):
    """GET: List lab orders, POST: Create new lab order"""
    serializer_class = LabOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['patient__name', 'patient__first_name', 'patient__last_name', 'patient__mrn', 'clinical_indication']
    filterset_fields = ['status', 'urgency']
    ordering_fields = ['created_at', 'urgency', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = LabOrder.objects.all().select_related(
            'patient', 'ordered_by', 'sample_collected_by', 'processed_by'
        ).prefetch_related(
            Prefetch('tests', queryset=LabOrderTest.objects.select_related('test'))
        )
        
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
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset


class LabOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single lab order operations"""
    serializer_class = LabOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return LabOrder.objects.all().select_related(
            'patient', 'ordered_by', 'sample_collected_by', 'processed_by'
        ).prefetch_related(
            Prefetch('tests', queryset=LabOrderTest.objects.select_related('test'))
        )


# ============ LAB WORKLIST ============

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lab_worklist_view(request):
    """
    GET: Retrieve lab worklist with pending, sample_collected, and in_progress orders
    Returns empty arrays for each category if no data exists
    """
    # Pending orders (waiting for sample collection)
    pending_orders = LabOrder.objects.filter(
        status='Pending'
    ).select_related(
        'patient', 'ordered_by'
    ).prefetch_related(
        Prefetch('tests', queryset=LabOrderTest.objects.select_related('test'))
    ).order_by('urgency', 'created_at')
    
    # Sample collected (ready for processing)
    sample_collected = LabOrder.objects.filter(
        status='Sample Collected'
    ).select_related(
        'patient', 'ordered_by', 'sample_collected_by'
    ).prefetch_related(
        Prefetch('tests', queryset=LabOrderTest.objects.select_related('test'))
    ).order_by('urgency', 'sample_collected_at')
    
    # In progress (currently being processed)
    in_progress = LabOrder.objects.filter(
        status='In Progress'
    ).select_related(
        'patient', 'ordered_by', 'processed_by'
    ).prefetch_related(
        Prefetch('tests', queryset=LabOrderTest.objects.select_related('test'))
    ).order_by('urgency', 'started_at')
    
    serializer_context = {'request': request}
    
    return Response({
        'pending_orders': LabOrderSerializer(pending_orders, many=True, context=serializer_context).data,
        'sample_collected': LabOrderSerializer(sample_collected, many=True, context=serializer_context).data,
        'in_progress': LabOrderSerializer(in_progress, many=True, context=serializer_context).data,
    })


# ============ LAB ORDER ACTIONS ============

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def collect_sample_view(request, order_id):
    """POST: Mark sample as collected for a lab order"""
    try:
        order = LabOrder.objects.get(id=order_id)
    except LabOrder.DoesNotExist:
        return Response(
            {'detail': 'Lab order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if order.status != 'Pending':
        return Response(
            {'detail': 'Can only collect samples for pending orders'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'Sample Collected'
    order.sample_collected_at = timezone.now()
    order.sample_collected_by = request.user
    order.save()
    
    serializer = LabOrderSerializer(order, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_processing_view(request, order_id):
    """POST: Start processing a lab order"""
    try:
        order = LabOrder.objects.get(id=order_id)
    except LabOrder.DoesNotExist:
        return Response(
            {'detail': 'Lab order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if order.status not in ['Pending', 'Sample Collected']:
        return Response(
            {'detail': 'Can only start processing for pending or sample collected orders'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'In Progress'
    order.started_at = timezone.now()
    order.processed_by = request.user
    
    # Auto-collect sample if not already collected
    if not order.sample_collected_at:
        order.sample_collected_at = timezone.now()
        order.sample_collected_by = request.user
    
    order.save()
    
    serializer = LabOrderSerializer(order, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order_view(request, order_id):
    """POST: Cancel a lab order"""
    try:
        order = LabOrder.objects.get(id=order_id)
    except LabOrder.DoesNotExist:
        return Response(
            {'detail': 'Lab order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if order.status == 'Completed':
        return Response(
            {'detail': 'Cannot cancel completed orders'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    order.status = 'Cancelled'
    order.save()
    
    serializer = LabOrderSerializer(order, context={'request': request})
    return Response(serializer.data)


# ============ LAB RESULTS ============

class LabResultListView(generics.ListCreateAPIView):
    """GET: List lab results, POST: Create new lab result"""
    serializer_class = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ['order__patient__name', 'order__patient__mrn', 'order__id']
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = LabResult.objects.all().select_related(
            'order__patient', 'performed_by', 'verified_by'
        ).prefetch_related(
            Prefetch('order__tests', queryset=LabOrderTest.objects.select_related('test'))
        )
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(order__patient_id=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        result = serializer.save(performed_by=self.request.user)
        
        # Update order status to completed
        order = result.order
        order.status = 'Completed'
        order.completed_at = timezone.now()
        order.save()


class LabResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE: Single lab result operations"""
    serializer_class = LabResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return LabResult.objects.all().select_related(
            'order__patient', 'performed_by', 'verified_by'
        ).prefetch_related(
            Prefetch('order__tests', queryset=LabOrderTest.objects.select_related('test'))
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def result_by_order_view(request, order_id):
    """GET: Retrieve result by order ID"""
    try:
        result = LabResult.objects.select_related(
            'order__patient', 'performed_by', 'verified_by'
        ).prefetch_related(
            Prefetch('order__tests', queryset=LabOrderTest.objects.select_related('test'))
        ).get(order_id=order_id)
        
        serializer = LabResultSerializer(result, context={'request': request})
        return Response(serializer.data)
    except LabResult.DoesNotExist:
        return Response(
            {'detail': 'Result not found for this order'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_result_view(request, result_id):
    """POST: Verify a lab result"""
    try:
        result = LabResult.objects.get(id=result_id)
    except LabResult.DoesNotExist:
        return Response(
            {'detail': 'Lab result not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if result.status == 'Final':
        return Response(
            {'detail': 'Result is already verified'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result.status = 'Final'
    result.verified_by = request.user
    result.verified_at = timezone.now()
    result.save()
    
    serializer = LabResultSerializer(result, context={'request': request})
    return Response(serializer.data)


# ============ LAB STATISTICS ============

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lab_statistics_view(request):
    """GET: Retrieve lab statistics for dashboard"""
    today = timezone.now().date()
    
    # Total orders today
    orders_today = LabOrder.objects.filter(created_at__date=today).count()
    
    # Pending orders
    pending_count = LabOrder.objects.filter(status='Pending').count()
    
    # Sample collected
    sample_collected_count = LabOrder.objects.filter(status='Sample Collected').count()
    
    # In progress
    in_progress_count = LabOrder.objects.filter(status='In Progress').count()
    
    # Completed today
    completed_today = LabOrder.objects.filter(
        status='Completed',
        completed_at__date=today
    ).count()
    
    # Total completed
    total_completed = LabOrder.objects.filter(status='Completed').count()
    
    return Response({
        'orders_today': orders_today,
        'pending_count': pending_count,
        'sample_collected_count': sample_collected_count,
        'in_progress_count': in_progress_count,
        'completed_today': completed_today,
        'total_completed': total_completed,
    })
