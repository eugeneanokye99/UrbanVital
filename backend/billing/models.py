# billing/models.py
from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient
from visits.models import Visit
from django.utils import timezone
from decimal import Decimal
import random

def generate_invoice_number():
    """Generate unique invoice number: INV-YYYYMM-XXXX"""
    year_month = timezone.now().strftime("%Y%m")
    for _ in range(10000):
        suffix = f"{random.randint(0, 9999):04d}"
        invoice_no = f"INV-{year_month}-{suffix}"
        if not Invoice.objects.filter(invoice_number=invoice_no).exists():
            return invoice_no
    return f"INV-{year_month}-{random.randint(10000, 99999)}"

class ServiceItem(models.Model):
    """Catalog of billable services and items"""
    CATEGORY_CHOICES = [
        ('Consultation', 'Consultation'),
        ('Laboratory', 'Laboratory'),
        ('Pharmacy', 'Pharmacy'),
        ('Procedure', 'Procedure'),
        ('Radiology', 'Radiology'),
        ('Therapy', 'Therapy'),
        ('Other', 'Other'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Invoice(models.Model):
    """Main invoice model"""
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Pending', 'Pending Payment'),
        ('Partially Paid', 'Partially Paid'),
        ('Paid', 'Paid'),
        ('Cancelled', 'Cancelled'),
        ('Refunded', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Mobile Money', 'Mobile Money'),
        ('Card', 'Credit/Debit Card'),
        ('Insurance', 'Insurance'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Other', 'Other'),
    ]
    
    # Foreign keys - patient is now optional for walk-in customers
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='invoices', null=True, blank=True)
    visit = models.ForeignKey(Visit, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_invoices')
    
    # Walk-in customer support
    walkin_id = models.CharField(max_length=50, null=True, blank=True, help_text="Walk-in customer ID")
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Payment info
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    insurance_provider = models.CharField(max_length=100, blank=True, null=True)
    insurance_claim_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Dates
    invoice_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField(null=True, blank=True)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = generate_invoice_number()
        
        # Calculate balance
        self.balance = self.total_amount - self.amount_paid
        
        # Update status based on payments
        if self.total_amount > 0 and self.amount_paid >= self.total_amount:
            self.status = 'Paid'
            if not self.payment_date:
                self.payment_date = timezone.now()
        elif self.amount_paid > 0:
            self.status = 'Partially Paid'
        elif self.status not in ['Draft', 'Cancelled']:
            self.status = 'Pending'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        customer = self.patient.name if self.patient else f"Walk-in ({self.walkin_id})"
        return f"{self.invoice_number} - {customer}"
    
    class Meta:
        ordering = ['-invoice_date']
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['status', 'invoice_date']),
            models.Index(fields=['patient', 'invoice_date']),
        ]

class InvoiceItem(models.Model):
    """Line items on an invoice"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    service_item = models.ForeignKey(ServiceItem, on_delete=models.PROTECT, related_name='invoice_items', null=True, blank=True)
    description = models.CharField(max_length=500)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Calculate total price - ensure discount is Decimal
        discount = Decimal(str(self.discount)) if self.discount else Decimal('0.00')
        self.total_price = (self.unit_price * self.quantity) - discount
        
        super().save(*args, **kwargs)
        
        # Update parent invoice total
        self.invoice.total_amount = sum(
            item.total_price for item in self.invoice.items.all()
        )
        self.invoice.save()
    
    def __str__(self):
        return f"{self.service_item.name} - {self.quantity} x {self.unit_price}"

class Payment(models.Model):
    """Payment transactions"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=Invoice.PAYMENT_METHOD_CHOICES)
    reference = models.CharField(max_length=200, blank=True, null=True)
    transaction_id = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='received_payments')
    payment_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Update invoice payment totals
        invoice = self.invoice
        invoice.amount_paid = sum(
            payment.amount for payment in invoice.payments.all()
        )
        invoice.save()
    
    def __str__(self):
        return f"Payment of {self.amount} for {self.invoice.invoice_number}"

class Receipt(models.Model):
    """Receipts for payments"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='receipts')
    receipt_number = models.CharField(max_length=50, unique=True, editable=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=Invoice.PAYMENT_METHOD_CHOICES)
    cashier = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='issued_receipts')
    issued_date = models.DateTimeField(default=timezone.now)
    printed = models.BooleanField(default=False)
    print_count = models.IntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = f"RCP-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Receipt {self.receipt_number} for {self.invoice.invoice_number}"