from rest_framework import serializers
from .models import MedicalDocument
from patients.serializers import PatientSerializer

class MedicalDocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.name')
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = MedicalDocument
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at', 'updated_at')

class MedicalDocumentDetailSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = MedicalDocument
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at', 'updated_at')
