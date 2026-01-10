# visits/serializers.py
from rest_framework import serializers
from .models import Visit, VitalSigns
from patients.serializers import PatientSerializer

class VitalSignsSerializer(serializers.ModelSerializer):
    taken_by_name = serializers.CharField(source='taken_by.username', read_only=True)
    
    class Meta:
        model = VitalSigns
        fields = '__all__'
        read_only_fields = ['id', 'bmi', 'created_at', 'updated_at']

class VisitSerializer(serializers.ModelSerializer):
    patient_details = PatientSerializer(source='patient', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    assigned_doctor_name = serializers.CharField(source='assigned_doctor.username', read_only=True, allow_null=True)
    vitals = VitalSignsSerializer(read_only=True)
    
    class Meta:
        model = Visit
        fields = [
            'id',
            'patient',
            'patient_details',
            'service_type',
            'priority',
            'assigned_doctor',
            'assigned_doctor_name',
            'payment_status',
            'notes',
            'status',
            'vitals',
            'check_in_time',
            'seen_by_doctor_time',
            'completed_time',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at', 
            'check_in_time', 'seen_by_doctor_time', 'completed_time'
        ]
    
    def create(self, validated_data):
        # Automatically set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)