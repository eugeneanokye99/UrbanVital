from rest_framework import serializers
from .models import Consultation
from visits.serializers import VisitSerializer
from patients.serializers import PatientSerializer

class ConsultationSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at', 'updated_at')

class ConsultationDetailSerializer(serializers.ModelSerializer):
    visit = VisitSerializer(read_only=True)
    patient = PatientSerializer(read_only=True)
    doctor_name = serializers.ReadOnlyField(source='doctor.get_full_name')
    
    class Meta:
        model = Consultation
        fields = '__all__'
        read_only_fields = ('doctor', 'created_at', 'updated_at')
