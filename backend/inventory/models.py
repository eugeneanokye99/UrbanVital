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
    
    # Pricing (use for both, Lab items can have 0)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Expiry
    expiry_date = models.DateField(null=True, blank=True)
    
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
    
    @property
    def stock_status(self):
        """Calculate stock status"""
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