# billing/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Sum
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceItem, Invoice, InvoiceItem, Payment, Receipt
from .serializers import (
    ServiceItemSerializer, InvoiceSerializer, InvoiceListSerializer,
    InvoiceItemSerializer, PaymentSerializer, ReceiptSerializer
)
from decimal import Decimal  

class ServiceItemListView(generics.ListCreateAPIView):
    """GET: List all service items, POST: Create new service item"""
    queryset = ServiceItem.objects.filter(is_active=True)
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['code', 'name', 'description']
    filterset_fields = ['category', 'is_active']

    def perform_create(self, serializer):
        obj = serializer.save()
        from notifications.audit import log_action
        log_action(self.request.user, "create", f"Created service item: {obj.name}", {"service_item_id": obj.id})

class InvoiceListView(generics.ListCreateAPIView):
    """GET: List invoices, POST: Create new invoice"""
    serializer_class = InvoiceListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        'invoice_number', 'patient__name', 'patient__first_name',
        'patient__last_name', 'patient__mrn'
    ]
    filterset_fields = ['status', 'payment_method']
    
    def get_queryset(self):
        queryset = Invoice.objects.all().select_related('patient')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(invoice_date__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(invoice_date__date__lte=date_to)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-invoice_date')
    
    def perform_create(self, serializer):
        obj = serializer.save(created_by=self.request.user)
        from notifications.audit import log_action
        log_action(self.request.user, "create", f"Created invoice: {obj.invoice_number}", {"invoice_id": obj.id})

class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
        def perform_update(self, serializer):
            obj = serializer.save()
            from notifications.audit import log_action
            log_action(self.request.user, "update", f"Updated invoice: {obj.invoice_number}", {"invoice_id": obj.id})

        def perform_destroy(self, instance):
            from notifications.audit import log_action
            log_action(self.request.user, "delete", f"Deleted invoice: {instance.invoice_number}", {"invoice_id": instance.id})
            instance.delete()
        """GET/PUT/PATCH/DELETE: Single invoice operations"""
        queryset = Invoice.objects.all()
        serializer_class = InvoiceSerializer
        permission_classes = [permissions.IsAuthenticated]
        lookup_field = "id"

class PendingInvoicesView(generics.ListAPIView):
    """GET: Invoices pending payment"""
    serializer_class = InvoiceListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Invoice.objects.filter(
            status__in=['Pending', 'Partially Paid']
        ).select_related('patient').order_by('invoice_date')

class AddInvoiceItemView(APIView):
    """POST: Add item to invoice"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Invoice not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Add invoice to data
        request_data = request.data.copy()
        request_data['invoice'] = invoice.id
        
        serializer = InvoiceItemSerializer(data=request_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProcessPaymentView(APIView):
    """POST: Process payment for invoice"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response(
                {'error': 'Invoice not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        amount = request.data.get('amount')
        payment_method = request.data.get('payment_method')
        reference = request.data.get('reference', '')
        transaction_id = request.data.get('transaction_id', '')
        notes = request.data.get('notes', '')
        
        if not amount or not payment_method:
            return Response(
                {'error': 'Amount and payment method are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Convert to Decimal properly
            amount_decimal = Decimal(str(amount))  # Convert string to Decimal
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if amount is positive
        if amount_decimal <= 0:
            return Response(
                {'error': 'Amount must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if payment would exceed invoice total
        if amount_decimal > invoice.balance:
            return Response(
                {'error': f'Payment amount ({amount_decimal}) exceeds balance ({invoice.balance})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment
        payment = Payment.objects.create(
            invoice=invoice,
            amount=amount_decimal,  # Use Decimal
            payment_method=payment_method,
            reference=reference,
            transaction_id=transaction_id,
            notes=notes,
            received_by=request.user
        )
        
        # Refresh invoice from database to get updated amount_paid
        invoice.refresh_from_db()
        
        # Deduct inventory for pharmacy items when payment is completed
        if invoice.balance <= 0:  # Payment completed
            from inventory.models import Inventory
            from notifications.audit import log_action
            
            for item in invoice.items.all():
                # Check if this is a pharmacy item by description matching inventory
                try:
                    inventory_item = Inventory.objects.get(
                        name=item.description,
                        department='PHARMACY'
                    )
                    # Deduct quantity from inventory
                    if inventory_item.current_stock >= item.quantity:
                        inventory_item.current_stock -= int(item.quantity)
                        inventory_item.save()
                        
                        # Log inventory deduction
                        log_action(
                            request.user, 
                            "inventory_deduction", 
                            f"Deducted {item.quantity} {item.description} from inventory (Sale: {invoice.invoice_number})",
                            {
                                "item_id": inventory_item.item_id,
                                "quantity_deducted": int(item.quantity),
                                "remaining_stock": inventory_item.current_stock,
                                "invoice_number": invoice.invoice_number
                            }
                        )
                except Inventory.DoesNotExist:
                    # Item not found in inventory, skip deduction
                    pass
            
            # Log sale completion
            customer_info = invoice.patient.name if invoice.patient else invoice.notes
            log_action(
                request.user,
                "pharmacy_sale",
                f"Completed pharmacy sale {invoice.invoice_number} for {customer_info} - Amount: ₵{invoice.total_amount}",
                {
                    "invoice_id": invoice.id,
                    "invoice_number": invoice.invoice_number,
                    "amount": float(invoice.total_amount),
                    "payment_method": payment_method,
                    "customer": customer_info
                }
            )
            
            receipt = Receipt.objects.create(
                invoice=invoice,
                amount=invoice.total_amount,
                payment_method=payment_method,
                cashier=request.user
            )
            
            return Response({
                'message': 'Payment processed successfully - Invoice fully paid',
                'payment': PaymentSerializer(payment).data,
                'receipt': ReceiptSerializer(receipt).data,
                'invoice': InvoiceSerializer(invoice).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Payment processed successfully',
            'payment': PaymentSerializer(payment).data,
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)
    
class BillingStatsView(APIView):
    """GET: Billing statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Today's stats
        today_invoices = Invoice.objects.filter(invoice_date__date=today)
        today_payments = Payment.objects.filter(payment_date__date=today)
        
        # Monthly stats
        month_start = today.replace(day=1)
        month_invoices = Invoice.objects.filter(invoice_date__date__gte=month_start)
        month_payments = Payment.objects.filter(payment_date__date__gte=month_start)
        
        stats = {
            'today': {
                'total_invoices': today_invoices.count(),
                'total_revenue': today_payments.aggregate(Sum('amount'))['amount__sum'] or 0,
                'pending_invoices': today_invoices.filter(status__in=['Pending', 'Partially Paid']).count(),
            },
            'month': {
                'total_invoices': month_invoices.count(),
                'total_revenue': month_payments.aggregate(Sum('amount'))['amount__sum'] or 0,
                'pending_invoices': month_invoices.filter(status__in=['Pending', 'Partially Paid']).count(),
            },
            'by_status': {
                'Pending': Invoice.objects.filter(status='Pending').count(),
                'Partially Paid': Invoice.objects.filter(status='Partially Paid').count(),
                'Paid': Invoice.objects.filter(status='Paid').count(),
                'Cancelled': Invoice.objects.filter(status='Cancelled').count(),
            },
            'by_payment_method': {},
        }
        
        # Count by payment method
        for method_code, method_name in Invoice.PAYMENT_METHOD_CHOICES:
            count = Invoice.objects.filter(payment_method=method_code).count()
            stats['by_payment_method'][method_name] = count
        
        return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def financial_transactions_view(request):
    """
    GET: Retrieve all financial transactions with filtering
    Returns unified view of payments and invoices for Finance dashboard
    """
    # Get filter parameters
    date_range = request.query_params.get('range', 'This Month')
    department = request.query_params.get('department', 'All Departments')
    
    today = timezone.now().date()
    
    # Calculate date range
    if date_range == 'Today':
        start_date = today
        end_date = today
    elif date_range == 'This Week':
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif date_range == 'This Month':
        start_date = today.replace(day=1)
        end_date = today
    elif date_range == 'This Year':
        start_date = today.replace(month=1, day=1)
        end_date = today
    else:
        start_date = today.replace(day=1)
        end_date = today
    
    # Fetch payments within date range
    payments = Payment.objects.filter(
        payment_date__date__gte=start_date,
        payment_date__date__lte=end_date
    ).select_related('invoice__patient', 'received_by')
    
    # Build transactions list
    transactions = []
    for payment in payments:
        # Determine category from invoice items
        category = 'General'
        if payment.invoice.items.exists():
            first_item = payment.invoice.items.first()
            if first_item and first_item.service_item:
                category = first_item.service_item.get_category_display()
        
        # Filter by department if specified
        if department != 'All Departments' and category != department:
            continue
        
        # Determine customer name (patient or walk-in)
        if payment.invoice.patient:
            customer_name = payment.invoice.patient.name
        elif payment.invoice.walkin_id:
            customer_name = f"Walk-in ({payment.invoice.walkin_id})"
        else:
            customer_name = "Walk-in Customer"
        
        transactions.append({
            'id': payment.id,
            'date': payment.payment_date.isoformat(),
            'description': f'Payment for Invoice #{payment.invoice.invoice_number}',
            'category': category,
            'patient': customer_name,
            'amount': float(payment.amount),
            'method': payment.payment_method,
            'cashier': payment.received_by.get_full_name() if payment.received_by else 'Unknown',
            'reference': payment.reference or '',
        })
    
    # Sort by date descending
    transactions.sort(key=lambda x: x['date'], reverse=True)
    
    # Calculate summaries
    revenue = sum(t['amount'] for t in transactions if t['amount'] > 0)
    expenses = 0  # Add expense tracking if needed
    
    # Department breakdown
    dept_breakdown = {}
    for category_code, category_name in ServiceItem.CATEGORY_CHOICES:
        dept_revenue = sum(
            t['amount'] for t in transactions 
            if t['category'] == category_name and t['amount'] > 0
        )
        dept_breakdown[category_name] = dept_revenue
    
    # Daily aggregation for charts
    daily_revenue = {}
    for transaction in transactions:
        date = transaction['date'].split('T')[0]
        if date not in daily_revenue:
            daily_revenue[date] = 0
        if transaction['amount'] > 0:
            daily_revenue[date] += transaction['amount']
    
    line_chart_data = [
        {
            'date': date,
            'Revenue': amount
        }
        for date, amount in sorted(daily_revenue.items())
    ]
    
    return Response({
        'transactions': transactions,
        'summary': {
            'revenue': revenue,
            'expenses': expenses,
            'profit': revenue - expenses,
            'total_transactions': len(transactions),
        },
        'department_breakdown': dept_breakdown,
        'chart_data': line_chart_data,
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pharmacy_sales_history_view(request):
    """
    GET: Retrieve pharmacy sales history
    Returns completed pharmacy transactions for history page
    """
    # Get filter parameters
    date_from = request.query_params.get('date_from', None)
    date_to = request.query_params.get('date_to', None)
    search = request.query_params.get('search', '')
    
    # Fetch paid invoices - include both:
    # 1. Invoices with pharmacy service items (from prescriptions)
    # 2. Invoices created from pharmacy POS (identified by notes containing "Pharmacy" or items matching inventory)
    from inventory.models import Inventory
    
    # Get all paid invoices
    invoices = Invoice.objects.filter(status='Paid')
    
    # Filter to only pharmacy-related invoices
    # Include invoices that either:
    # - Have pharmacy service items, OR
    # - Have notes indicating pharmacy sale, OR
    # - Have items matching pharmacy inventory names
    pharmacy_invoice_ids = set()
    
    for invoice in invoices:
        # Check if has pharmacy service items
        if invoice.items.filter(service_item__category='Pharmacy').exists():
            pharmacy_invoice_ids.add(invoice.id)
            continue
        
        # Check if notes indicate pharmacy sale
        if invoice.notes and ('Pharmacy' in invoice.notes or 'Walk-in' in invoice.notes or 'Registered Patient' in invoice.notes):
            # Verify items match pharmacy inventory
            for item in invoice.items.all():
                if Inventory.objects.filter(name=item.description, department='PHARMACY').exists():
                    pharmacy_invoice_ids.add(invoice.id)
                    break
    
    # Get final queryset
    invoices = Invoice.objects.filter(
        id__in=pharmacy_invoice_ids
    ).distinct().select_related('patient', 'created_by').prefetch_related('items', 'payments')
    
    # Apply date filters
    if date_from:
        invoices = invoices.filter(payment_date__date__gte=date_from)
    if date_to:
        invoices = invoices.filter(payment_date__date__lte=date_to)
    
    # Apply search filter
    if search:
        invoices = invoices.filter(
            Q(invoice_number__icontains=search) |
            Q(patient__first_name__icontains=search) |
            Q(patient__last_name__icontains=search)
        )
    
    # Build sales list
    sales = []
    for invoice in invoices.order_by('-payment_date'):
        # Get pharmacy items only
        pharmacy_items = invoice.items.filter(service_item__category='Pharmacy')
        items_list = ', '.join([item.description for item in pharmacy_items])
        
        # Get payment info
        first_payment = invoice.payments.first()
        
        # Determine customer name (patient or walk-in)
        if invoice.patient:
            customer_name = invoice.patient.name
        elif invoice.walkin_id:
            customer_name = f"Walk-in ({invoice.walkin_id})"
        else:
            customer_name = "Walk-in Customer"
        
        sales.append({
            'id': invoice.invoice_number,
            'invoice_id': invoice.id,
            'date': invoice.payment_date.strftime('%d/%m/%Y') if invoice.payment_date else invoice.invoice_date.strftime('%d/%m/%Y'),
            'time': invoice.payment_date.strftime('%H:%M') if invoice.payment_date else invoice.invoice_date.strftime('%H:%M'),
            'patient': customer_name,
            'items': items_list,
            'amount': float(invoice.total_amount),
            'method': invoice.payment_method or 'Cash',
            'pharmacist': invoice.created_by.get_full_name() if invoice.created_by else 'Unknown',
            'is_walkin': not bool(invoice.patient),  # Flag to indicate walk-in customer
        })
    
    return Response(sales)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def pharmacy_stats_view(request):
    """
    GET: Pharmacy dashboard statistics
    Returns revenue, top products, and other metrics
    """
    from inventory.models import Inventory
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # Get all paid invoices
    all_invoices = Invoice.objects.filter(status='Paid')
    
    # Filter to only pharmacy-related invoices (same logic as sales history)
    pharmacy_invoice_ids = set()
    
    for invoice in all_invoices:
        # Check if has pharmacy service items
        if invoice.items.filter(service_item__category='Pharmacy').exists():
            pharmacy_invoice_ids.add(invoice.id)
            continue
        
        # Check if notes indicate pharmacy sale
        if invoice.notes and ('Pharmacy' in invoice.notes or 'Walk-in' in invoice.notes or 'Registered Patient' in invoice.notes):
            # Verify items match pharmacy inventory
            for item in invoice.items.all():
                if Inventory.objects.filter(name=item.description, department='PHARMACY').exists():
                    pharmacy_invoice_ids.add(invoice.id)
                    break
    
    # Get pharmacy invoices
    pharmacy_invoices = Invoice.objects.filter(id__in=pharmacy_invoice_ids)
    
    # Today's revenue
    today_revenue = pharmacy_invoices.filter(
        payment_date__date=today
    ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    # Week's revenue
    week_revenue = pharmacy_invoices.filter(
        payment_date__date__gte=week_ago
    ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    # Top selling products (from all pharmacy invoice items)
    from django.db.models import Count
    top_products = InvoiceItem.objects.filter(
        invoice__id__in=pharmacy_invoice_ids
    ).values('description').annotate(
        count=Count('id'),
        total_qty=Sum('quantity')
    ).order_by('-total_qty')[:5]
    
    top_drugs = []
    max_count = top_products[0]['total_qty'] if top_products else 1
    for product in top_products:
        top_drugs.append({
            'name': product['description'],
            'count': int(product['total_qty']),
            'percentage': int((product['total_qty'] / max_count) * 100) if max_count > 0 else 0
        })
    
    return Response({
        'today_revenue': float(today_revenue),
        'week_revenue': float(week_revenue),
        'top_drugs': top_drugs,
    })