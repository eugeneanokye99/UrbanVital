from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient
from visits.models import Visit

class Consultation(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='consultation')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consultations_done')
    
    # Clinical Notes
    chief_complaint = models.TextField()
    history_of_present_illness = models.TextField(blank=True, null=True)
    past_medical_history = models.TextField(blank=True, null=True)
    physical_examination = models.TextField(blank=True, null=True)
    
    # Diagnosis
    diagnosis = models.TextField() # Can be structured later with ICD-10
    
    # Plan
    clinical_plan = models.TextField()
    prescription = models.TextField(blank=True, null=True)
    
    # Admission Status
    admit_patient = models.BooleanField(default=False)
    admission_notes = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Consultation for {self.patient.name} on {self.created_at.date()}"

    class Meta:
        ordering = ['-created_at']
