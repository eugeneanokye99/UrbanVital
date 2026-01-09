# ultrasound/serializers.py
from rest_framework import serializers
from .models import UltrasoundOrder, UltrasoundScan, UltrasoundImage, UltrasoundEquipment
from patients.serializers import PatientSerializer


class UltrasoundOrderSerializer(serializers.ModelSerializer):
    """Serializer for ultrasound orders"""
    patient_details = PatientSerializer(source='patient', read_only=True)
    ordered_by_name = serializers.CharField(source='ordered_by.username', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    
    class Meta:
        model = UltrasoundOrder
        fields = [
            'id',
            'patient',
            'patient_details',
            'patient_name',
            'patient_mrn',
            'visit',
            'ordered_by',
            'ordered_by_name',
            'scan_type',
            'urgency',
            'clinical_indication',
            'special_instructions',
            'status',
            'scheduled_date',
            'ordered_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'ordered_by', 'ordered_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set ordered_by to current user
        validated_data['ordered_by'] = self.context['request'].user
        return super().create(validated_data)


class UltrasoundImageSerializer(serializers.ModelSerializer):
    """Serializer for ultrasound images"""
    
    class Meta:
        model = UltrasoundImage
        fields = [
            'id',
            'scan',
            'image_path',
            'image_url',
            'image_type',
            'description',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at']


class UltrasoundScanSerializer(serializers.ModelSerializer):
    """Serializer for ultrasound scans"""
    patient_details = PatientSerializer(source='patient', read_only=True)
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.username', read_only=True, allow_null=True)
    images = UltrasoundImageSerializer(many=True, read_only=True)
    order_details = UltrasoundOrderSerializer(source='order', read_only=True)
    
    class Meta:
        model = UltrasoundScan
        fields = [
            'id',
            'order',
            'order_details',
            'patient',
            'patient_details',
            'patient_name',
            'patient_mrn',
            'performed_by',
            'performed_by_name',
            'verified_by',
            'verified_by_name',
            'scan_number',
            'scan_type',
            'machine_used',
            'clinical_indication',
            'lmp',
            'gestational_age',
            'technique',
            'findings',
            'measurements',
            'impression',
            'recommendations',
            'status',
            'scan_started_at',
            'scan_completed_at',
            'verified_at',
            'created_at',
            'updated_at',
            'images',
        ]
        read_only_fields = [
            'id', 'scan_number', 'performed_by', 'verified_by', 
            'verified_at', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        # Automatically set performed_by to current user
        validated_data['performed_by'] = self.context['request'].user
        return super().create(validated_data)


class UltrasoundScanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing scans"""
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_mrn = serializers.CharField(source='patient.mrn', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = UltrasoundScan
        fields = [
            'id',
            'scan_number',
            'patient_name',
            'patient_mrn',
            'scan_type',
            'performed_by_name',
            'status',
            'created_at',
            'scan_completed_at',
        ]


class UltrasoundEquipmentSerializer(serializers.ModelSerializer):
    """Serializer for ultrasound equipment"""
    
    class Meta:
        model = UltrasoundEquipment
        fields = [
            'id',
            'name',
            'model',
            'serial_number',
            'manufacturer',
            'status',
            'location',
            'purchase_date',
            'last_maintenance_date',
            'next_maintenance_date',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
