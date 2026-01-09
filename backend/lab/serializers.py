from rest_framework import serializers
from django.utils import timezone
from .models import LabTest, LabOrder, LabOrderTest, LabResult
from patients.serializers import PatientSerializer


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = [
            'id', 'name', 'code', 'category', 'description',
            'sample_type', 'turnaround_time', 'normal_range',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LabOrderTestSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='test.name', read_only=True)
    test_code = serializers.CharField(source='test.code', read_only=True)
    test_category = serializers.CharField(source='test.category', read_only=True)
    sample_type = serializers.CharField(source='test.sample_type', read_only=True)
    
    class Meta:
        model = LabOrderTest
        fields = ['id', 'test', 'test_name', 'test_code', 'test_category', 'sample_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class LabOrderSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    patient_gender = serializers.CharField(source='patient.gender', read_only=True)
    patient_age = serializers.IntegerField(source='patient.age', read_only=True)
    ordered_by_name = serializers.SerializerMethodField()
    sample_collected_by_name = serializers.SerializerMethodField()
    processed_by_name = serializers.SerializerMethodField()
    tests = LabOrderTestSerializer(many=True, read_only=True)
    test_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True
    )
    has_result = serializers.SerializerMethodField()
    
    class Meta:
        model = LabOrder
        fields = [
            'id', 'patient', 'patient_name', 'patient_mrn', 'patient_gender',
            'patient_age', 'ordered_by', 'ordered_by_name', 'urgency',
            'clinical_indication', 'special_instructions', 'status',
            'sample_collected_at', 'sample_collected_by', 'sample_collected_by_name',
            'processed_by', 'processed_by_name', 'started_at', 'completed_at',
            'tests', 'test_ids', 'has_result', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'ordered_by', 'sample_collected_by', 'processed_by',
            'sample_collected_at', 'started_at', 'completed_at',
            'created_at', 'updated_at'
        ]
    
    def get_ordered_by_name(self, obj):
        if obj.ordered_by:
            return f"{obj.ordered_by.first_name} {obj.ordered_by.last_name}".strip() or obj.ordered_by.username
        return "Unknown"
    
    def get_sample_collected_by_name(self, obj):
        if obj.sample_collected_by:
            return f"{obj.sample_collected_by.first_name} {obj.sample_collected_by.last_name}".strip() or obj.sample_collected_by.username
        return None
    
    def get_processed_by_name(self, obj):
        if obj.processed_by:
            return f"{obj.processed_by.first_name} {obj.processed_by.last_name}".strip() or obj.processed_by.username
        return None
    
    def get_has_result(self, obj):
        return hasattr(obj, 'result')
    
    def create(self, validated_data):
        test_ids = validated_data.pop('test_ids')
        validated_data['ordered_by'] = self.context['request'].user
        
        order = LabOrder.objects.create(**validated_data)
        
        # Create order tests
        for test_id in test_ids:
            LabOrderTest.objects.create(order=order, test_id=test_id)
        
        return order


class LabResultSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    patient_name = serializers.CharField(source='order.patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='order.patient.mrn', read_only=True)
    patient_age = serializers.IntegerField(source='order.patient.age', read_only=True)
    patient_gender = serializers.CharField(source='order.patient.gender', read_only=True)
    performed_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    tests = LabOrderTestSerializer(source='order.tests', many=True, read_only=True)
    urgency = serializers.CharField(source='order.urgency', read_only=True)
    
    class Meta:
        model = LabResult
        fields = [
            'id', 'order', 'order_id', 'patient_name', 'patient_mrn',
            'patient_age', 'patient_gender', 'urgency',
            'results_data', 'interpretation', 'abnormal_flags', 'status',
            'performed_by', 'performed_by_name', 'verified_by', 'verified_by_name',
            'verified_at', 'tests', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'performed_by', 'verified_by', 'verified_at',
            'created_at', 'updated_at'
        ]
    
    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return f"{obj.performed_by.first_name} {obj.performed_by.last_name}".strip() or obj.performed_by.username
        return "Unknown"
    
    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return f"{obj.verified_by.first_name} {obj.verified_by.last_name}".strip() or obj.verified_by.username
        return None
    
    def create(self, validated_data):
        validated_data['performed_by'] = self.context['request'].user
        return super().create(validated_data)
