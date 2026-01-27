from rest_framework import serializers
from .models import Inventory
from datetime import timedelta, date

class InventorySerializer(serializers.ModelSerializer):
    stock_status = serializers.CharField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_locked = serializers.BooleanField(required=False)

    class Meta:
        model = Inventory
        fields = [
            'id', 'item_id', 'name', 'department', 'manufacturer', 'manufacturing_date',
            'current_stock', 'minimum_stock', 'unit_of_measure', 'unit_cost', 'selling_price',
            'expiry_date', 'is_active', 'is_locked', 'stock_status', 'total_value',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'item_id', 'stock_status', 'total_value', 
                           'created_by', 'created_at', 'updated_at']

    def validate_expiry_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Expiry date cannot be in the past.")
        return value