from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Inventory, InventoryAdjustment
from .serializers import InventorySerializer, InventoryAdjustmentSerializer
from django.db.models import Q, Sum, Count, F  # Make sure F is imported
from datetime import timedelta, date

class InventoryListCreateView(generics.ListCreateAPIView):
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Inventory.objects.all()
        user = self.request.user
        # Only admins see locked items
        if not (user.is_superuser or user.groups.filter(name__iexact='admin').exists()):
            qs = qs.filter(is_locked=False)
        return qs

    def perform_create(self, serializer):
        obj = serializer.save(created_by=self.request.user)
        # Audit log
        from notifications.audit import log_action
        log_action(self.request.user, "create", f"Created inventory item: {obj.name}", {"item_id": obj.item_id})

class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
        def perform_update(self, serializer):
            obj = serializer.save()
            from notifications.audit import log_action
            log_action(self.request.user, "update", f"Updated inventory item: {obj.name}", {"item_id": obj.item_id})

        def perform_destroy(self, instance):
            from notifications.audit import log_action
            log_action(self.request.user, "delete", f"Deleted inventory item: {instance.name}", {"item_id": instance.item_id})
            instance.delete()
            
        serializer_class = InventorySerializer
        permission_classes = [IsAuthenticated]

        def get_queryset(self):
            qs = Inventory.objects.all()
            user = self.request.user
            if not (user.is_superuser or user.groups.filter(name__iexact='admin').exists()):
                qs = qs.filter(is_locked=False)
            return qs

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pharmacy_items(request):
    qs = Inventory.objects.filter(department='PHARMACY')
    user = request.user
    if not (user.is_superuser or user.groups.filter(name__iexact='admin').exists()):
        qs = qs.filter(is_locked=False)
    serializer = InventorySerializer(qs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lab_items(request):
    qs = Inventory.objects.filter(department='LAB')
    user = request.user
    if not (user.is_superuser or user.groups.filter(name__iexact='admin').exists()):
        qs = qs.filter(is_locked=False)
    serializer = InventorySerializer(qs, many=True)
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_stats(request):
    queryset = Inventory.objects.all()
    
    total_items = queryset.count()
    
    # Fixed: Use F() expressions for multiplication
    total_value_result = queryset.aggregate(
        total=Sum(F('current_stock') * F('selling_price'))
    )
    total_value = total_value_result['total'] or 0
    
    low_stock = queryset.filter(
        current_stock__lte=F('minimum_stock'),
        current_stock__gt=0
    ).count()
    
    out_of_stock = queryset.filter(current_stock=0).count()
    
    # Expiring soon calculation
    thirty_days = date.today() + timedelta(days=30)
    expiring_soon = queryset.filter(
        expiry_date__lte=thirty_days,
        expiry_date__gte=date.today()
    ).count()
    
    # By department
    by_department = queryset.values(
        'department'
    ).annotate(
        count=Count('id'),
        value=Sum(F('current_stock') * F('selling_price'))
    )
    
    return Response({
        'total_items': total_items,
        'total_value': float(total_value),
        'low_stock': low_stock,
        'out_of_stock': out_of_stock,
        'expiring_soon': expiring_soon,
        'by_department': list(by_department)
    })

# Inventory Adjustments/Returns Views
class InventoryAdjustmentListCreateView(generics.ListCreateAPIView):
    serializer_class = InventoryAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        qs = InventoryAdjustment.objects.all().select_related('inventory_item', 'created_by', 'approved_by')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        # Filter by type
        type_filter = self.request.query_params.get('type', None)
        if type_filter:
            qs = qs.filter(adjustment_type=type_filter)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            qs = qs.filter(
                Q(adjustment_id__icontains=search) |
                Q(inventory_item__name__icontains=search)
            )
        
        return qs.order_by('-created_at')
    
    def perform_create(self, serializer):
        obj = serializer.save(created_by=self.request.user)
        from notifications.audit import log_action
        log_action(self.request.user, "create", f"Created inventory adjustment: {obj.adjustment_id}", {"adjustment_id": obj.adjustment_id})

class InventoryAdjustmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryAdjustment.objects.all()
    serializer_class = InventoryAdjustmentSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self, serializer):
        obj = serializer.save()
        from notifications.audit import log_action
        log_action(self.request.user, "update", f"Updated inventory adjustment: {obj.adjustment_id}", {"adjustment_id": obj.adjustment_id})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_adjustment(request, pk):
    """Approve an inventory adjustment and update stock"""
    try:
        adjustment = InventoryAdjustment.objects.get(pk=pk)
    except InventoryAdjustment.DoesNotExist:
        return Response({'error': 'Adjustment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if adjustment.status != 'Pending':
        return Response({'error': 'Only pending adjustments can be approved'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Update adjustment status
    adjustment.status = 'Approved'
    adjustment.approved_by = request.user
    adjustment.save()
    
    # Update inventory stock (reduce for returns/damages)
    if adjustment.adjustment_type in ['Damaged', 'Expired', 'Loss']:
        item = adjustment.inventory_item
        item.current_stock = max(0, item.current_stock - adjustment.quantity)
        item.save()
    elif adjustment.adjustment_type == 'Customer Return':
        # Restock
        item = adjustment.inventory_item
        item.current_stock += adjustment.quantity
        item.save()
    
    from notifications.audit import log_action
    log_action(request.user, "approve", f"Approved adjustment: {adjustment.adjustment_id}", {"adjustment_id": adjustment.adjustment_id})
    
    return Response(InventoryAdjustmentSerializer(adjustment).data)