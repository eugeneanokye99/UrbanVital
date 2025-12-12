# patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    # Add computed properties for compatibility
    name = serializers.SerializerMethodField(read_only=True)
    contact_person = serializers.SerializerMethodField(read_only=True)
    flags = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            "id",
            "mrn",
            "first_name",
            "last_name",
            "name",  # Computed field
            "date_of_birth",
            "gender",
            "marital_status",
            "occupation",
            "id_type",
            "id_number",
            "phone",
            "email",
            "address",
            "city",
            "emergency_name",
            "emergency_phone",
            "emergency_relation",
            "contact_person",  # Alias for emergency_name
            "payment_mode",
            "insurance_provider",
            "insurance_number",
            "medical_flags",
            "flags",  # Alias for medical_flags
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "mrn", "created_at", "updated_at", "name", "contact_person", "flags"]

    def get_name(self, obj):
        return obj.name
    
    def get_contact_person(self, obj):
        return obj.contact_person
    
    def get_flags(self, obj):
        return obj.flags
    
    def validate_phone(self, value):
        if not value:
            raise serializers.ValidationError("Phone is required.")
        # Remove any non-digit characters for consistency
        import re
        return re.sub(r'\D', '', value)
    
    def create(self, validated_data):
        # Automatically set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)