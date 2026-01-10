from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient

class MedicalDocument(models.Model):
    DOCUMENT_TYPES = [
        ('Sick Note', 'Sick Note'),
        ('Referral Letter', 'Referral Letter'),
        ('Prescription', 'Prescription'),
        ('Medical Report', 'Medical Report'),
        ('Custom', 'Custom'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_documents')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents_signed')
    
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=255)
    content = models.JSONField() # Store structured data like condition, days, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.document_type} for {self.patient.name} - {self.created_at.date()}"

    class Meta:
        ordering = ['-created_at']
