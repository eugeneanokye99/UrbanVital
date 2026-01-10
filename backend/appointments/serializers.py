from rest_framework import serializers
from .models import Appointment
from patients.serializers import PatientSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.name')
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

class AppointmentDetailSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')
