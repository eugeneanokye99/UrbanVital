# billing/views.py
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q, Sum
from django.utils import timezone
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
        serializer.save(created_by=self.request.user)

class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
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
        
        # Create receipt if payment completes the invoice
        if invoice.balance <= 0:  # Use balance instead of calculating
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