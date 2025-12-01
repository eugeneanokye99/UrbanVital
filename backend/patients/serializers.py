# patients/serializers.py
from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id",
            "mrn",
            "name",
            "phone",
            "address",
            "gender",
            "contact_person",
            "flags",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "mrn", "created_at", "updated_at"]

    def validate_phone(self, value):
        # basic clean/validation — optional: add stricter checks
        if not value:
            raise serializers.ValidationError("Phone is required.")
        return value
