from rest_framework import serializers
from .models import Inventory
from datetime import timedelta, date

class InventorySerializer(serializers.ModelSerializer):
    stock_status = serializers.CharField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'item_id', 'name', 'department', 'current_stock', 
            'minimum_stock', 'unit_of_measure', 'selling_price', 
            'expiry_date', 'is_active', 'stock_status', 'total_value',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'item_id', 'stock_status', 'total_value', 
                           'created_by', 'created_at', 'updated_at']