from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import uuid
from datetime import date, timedelta

def generate_item_id():
    """Generate unique item ID"""
    return uuid.uuid4().hex[:8].upper()

class Inventory(models.Model):
    """Simplified inventory model"""
    
    # Basic Information
    item_id = models.CharField(max_length=50, unique=True, default=generate_item_id)
    name = models.CharField(max_length=200)
    
    # Department only (Pharmacy or Lab)
    DEPARTMENT_CHOICES = [
        ('PHARMACY', 'Pharmacy'),
        ('LAB', 'Laboratory'),
    ]
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    
    # Stock Information
    current_stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    minimum_stock = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    
    UNIT_CHOICES = [
        ('PCS', 'Pieces'),
        ('BOX', 'Boxes'),
        ('BTL', 'Bottles'),
        ('KIT', 'Kits'),
        ('TAB', 'Tablets'),
        ('CAP', 'Capsules'),
        ('ML', 'Milliliters'),
        ('GM', 'Grams'),
        ('TEST', 'Tests'),
    ]
    unit_of_measure = models.CharField(max_length=20, choices=UNIT_CHOICES, default='PCS')
    
    # Manufacturer
    manufacturer = models.CharField(max_length=200, blank=True, null=True)

    # Manufacturing date
    manufacturing_date = models.DateField(null=True, blank=True)

    # Pricing (use for both, Lab items can have 0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Expiry
    expiry_date = models.DateField(null=True, blank=True)

    # Lock: Only visible to admin if locked
    is_locked = models.BooleanField(default=False)

    # Status
    is_active = models.BooleanField(default=True)

    # Audit
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = "Inventories"
    
    def __str__(self):
        return f"{self.name} ({self.department})"

    def clean(self):
        # Block saving drugs with past expiry dates
        if self.expiry_date and self.expiry_date < date.today():
            from django.core.exceptions import ValidationError
            raise ValidationError({"expiry_date": "Expiry date cannot be in the past."})
    
    @property
    def stock_status(self):
        """Calculate stock status"""
        if self.expiry_date and self.expiry_date < date.today():
            return 'EXPIRED'
        if self.current_stock == 0:
            return 'OUT_OF_STOCK'
        elif self.current_stock <= self.minimum_stock:
            return 'LOW_STOCK'
        elif self.expiry_date:
            thirty_days = date.today() + timedelta(days=30)
            if self.expiry_date <= thirty_days:
                return 'EXPIRING_SOON'
        return 'GOOD'
    
    @property
    def total_value(self):
        """Calculate total inventory value"""
        return float(self.current_stock * self.selling_price)

class InventoryAdjustment(models.Model):
    """Track inventory returns, damages, and adjustments"""
    
    TYPE_CHOICES = [
        ('Damaged', 'Damaged / Broken'),
        ('Expired', 'Expired Stock'),
        ('Customer Return', 'Customer Return (Restock)'),
        ('Error', 'Dispensing Error'),
        ('Loss', 'Loss / Theft'),
        ('Adjustment', 'Stock Adjustment'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending Approval'),
        ('Approved', 'Approved'),
        ('Disposed', 'Disposed'),
        ('Rejected', 'Rejected'),
    ]
    
    # Reference
    adjustment_id = models.CharField(max_length=50, unique=True, editable=False)
    
    # Item details
    inventory_item = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='adjustments')
    batch_number = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    
    # Adjustment details
    adjustment_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    reason = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    
    # Audit
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_adjustments')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_adjustments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.adjustment_id:
            # Generate unique ID
            import random
            self.adjustment_id = f"RET-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.adjustment_id} - {self.inventory_item.name}"
    
    class Meta:
        ordering = ['-created_at']