from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import uuid

class Cart(models.Model):
    """Simple cart model for pharmacy"""
    
    cart_id = models.CharField(max_length=50, unique=True, editable=False)
    
    # Simple patient info - can be either patient_id or patient_name
    patient_id = models.IntegerField(null=True, blank=True)
    patient_name = models.CharField(max_length=200, blank=True)
    
    # Staff who created the cart
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_checked_out = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Cart {self.cart_id}"
    
    def save(self, *args, **kwargs):
        if not self.cart_id:
            self.cart_id = f"CART-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    @property
    def total(self):
        """Calculate total from items"""
        return sum(float(item.subtotal) for item in self.items.all())
    
    @property
    def item_count(self):
        return self.items.count()


class CartItem(models.Model):
    """Cart items"""
    
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    inventory_item = models.ForeignKey('inventory.Inventory', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['cart', 'inventory_item']
    
    def __str__(self):
        return f"{self.quantity} x {self.inventory_item.name}"
    
    @property
    def subtotal(self):
        return self.unit_price * self.quantity
    
    def save(self, *args, **kwargs):
        # Set price from inventory if new item
        if not self.pk:
            self.unit_price = self.inventory_item.selling_price
            
            # Check stock
            if self.quantity > self.inventory_item.current_stock:
                raise ValueError(f"Not enough stock. Available: {self.inventory_item.current_stock}")
        
        super().save(*args, **kwargs)
    
    def update_inventory(self):
        """Update inventory after purchase"""
        self.inventory_item.current_stock -= self.quantity
        self.inventory_item.save()