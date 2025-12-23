from rest_framework import serializers
from .models import Cart, CartItem
from inventory.models import Inventory

class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    item_id = serializers.IntegerField(source='inventory_item.id')
    item_name = serializers.CharField(source='inventory_item.name')
    stock_available = serializers.IntegerField(source='inventory_item.current_stock')
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'item_id', 'item_name', 'quantity', 'unit_price', 'stock_available', 'subtotal']
        read_only_fields = ['id', 'item_name', 'stock_available', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'cart_id', 'patient_id', 'patient_name', 'items', 'total', 'item_count', 'created_at']
        read_only_fields = ['id', 'cart_id', 'total', 'item_count', 'created_at']


class AddItemSerializer(serializers.Serializer):
    """Serializer for adding items to cart"""
    inventory_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate(self, data):
        item_id = data['inventory_item_id']
        
        try:
            item = Inventory.objects.get(id=item_id)
        except Inventory.DoesNotExist:
            raise serializers.ValidationError("Item not found")
        
        if item.current_stock < data['quantity']:
            raise serializers.ValidationError(f"Only {item.current_stock} available")
        
        data['inventory_item'] = item
        return data


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout"""
    payment_method = serializers.CharField(max_length=20)
    patient_id = serializers.IntegerField(required=False, allow_null=True)
    patient_name = serializers.CharField(required=False, allow_blank=True)