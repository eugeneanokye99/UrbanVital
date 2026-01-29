# billing/serializers.py
from rest_framework import serializers
from .models import ServiceItem, Invoice, InvoiceItem, Payment, Receipt
from patients.serializers import PatientSerializer

class ServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceItem
        fields = '__all__'

class InvoiceItemSerializer(serializers.ModelSerializer):
    service_item_name = serializers.CharField(source='service_item.name', read_only=True)
    service_item_code = serializers.CharField(source='service_item.code', read_only=True)
    
    class Meta:
        model = InvoiceItem
        fields = '__all__'
        read_only_fields = ['total_price']
        extra_kwargs = {
            'service_item': {'required': False, 'allow_null': True}  # Make service_item optional
        }
    
    def create(self, validated_data):
        # Calculate total_price if not provided
        if 'total_price' not in validated_data:
            quantity = validated_data.get('quantity', 1)
            unit_price = validated_data.get('unit_price', 0)
            discount = validated_data.get('discount', 0)
            validated_data['total_price'] = (unit_price * quantity) - discount
        
        return super().create(validated_data)

class InvoiceSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Invoice
        fields = '__all__'
        read_only_fields = [
            'invoice_number', 'total_amount', 'amount_paid', 'balance',
            'created_at', 'updated_at', 'payment_date'
        ]
        extra_kwargs = {
            'status': {'required': False},  # Status is auto-calculated
            'patient': {'required': False, 'allow_null': True},  # Patient can be null for walk-in
            'walkin_id': {'required': False, 'allow_null': True}  # Walk-in ID is optional
        }
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        # Don't set status here, let the model's save() handle it
        if 'status' not in validated_data:
            validated_data['status'] = 'Pending'
        return super().create(validated_data)

class PaymentSerializer(serializers.ModelSerializer):
    received_by_name = serializers.CharField(source='received_by.username', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['created_at']
        extra_kwargs = {
            'amount': {'required': True},
            'payment_method': {'required': True}
        }
    
    def create(self, validated_data):
        validated_data['received_by'] = self.context['request'].user
        return super().create(validated_data)

class ReceiptSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.username', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    patient_name = serializers.CharField(source='invoice.patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='invoice.patient.mrn', read_only=True)
    
    class Meta:
        model = Receipt
        fields = '__all__'
        read_only_fields = ['receipt_number', 'printed', 'print_count', 'created_at']
    
    def create(self, validated_data):
        validated_data['cashier'] = self.context['request'].user
        return super().create(validated_data)

# Simplified serializers for list views
class InvoiceListSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    items_count = serializers.IntegerField(source='items.count', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'patient', 'patient_name', 'patient_mrn', 'walkin_id',
            'status', 'total_amount', 'amount_paid', 'balance', 'invoice_date',
            'payment_method', 'items_count', 'items'
        ]
        extra_kwargs = {
            'patient': {'required': False, 'allow_null': True},  # Patient can be null
            'walkin_id': {'required': False, 'allow_null': True}  # Walk-in ID is optional
        }