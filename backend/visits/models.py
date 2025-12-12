# visits/models.py
from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient

class Visit(models.Model):
    SERVICE_CHOICES = [
        ('General Consultation', 'General Consultation'),
        ('Specialist Review', 'Specialist Review'),
        ('Lab Only', 'Lab Only'),
        ('Pharmacy Only', 'Pharmacy Only'),
        ('Vitals Only', 'Vitals Only'),
        ('Emergency', 'Emergency'),
        ('Follow-up', 'Follow-up'),
        ('Procedure', 'Procedure'),
    ]
    
    PRIORITY_CHOICES = [
        ('Normal', 'Normal'),
        ('Urgent', 'Urgent'),
        ('Emergency', 'Emergency'),
    ]
    
    PAYMENT_CHOICES = [
        ('Pay Later', 'Pay Later (After Service)'),
        ('Insurance', 'Insurance'),
        ('Cash', 'Paid Cash'),
        ('Mobile Money', 'Mobile Money'),
        ('Card', 'Credit/Debit Card'),
    ]
    
    STATUS_CHOICES = [
        ('Checked In', 'Checked In'),
        ('Vitals Taken', 'Vitals Taken'),
        ('In Consultation', 'In Consultation'),
        ('Awaiting Lab', 'Awaiting Lab'),
        ('Awaiting Pharmacy', 'Awaiting Pharmacy'),
        ('Ready for Discharge', 'Ready for Discharge'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    # Foreign Keys
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_visits')
    assigned_doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                        related_name='assigned_visits', limit_choices_to={'groups__name': 'Doctor'})
    
    # Visit Details
    service_type = models.CharField(max_length=100, choices=SERVICE_CHOICES, default='General Consultation')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Normal')
    payment_status = models.CharField(max_length=50, choices=PAYMENT_CHOICES, default='Pay Later')
    notes = models.TextField(blank=True, null=True)
    
    # Status Tracking
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Checked In')
    check_in_time = models.DateTimeField(auto_now_add=True)
    seen_by_doctor_time = models.DateTimeField(null=True, blank=True)
    completed_time = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.patient.name} - {self.service_type} ({self.status})"
    
    class Meta:
        ordering = ['-check_in_time']
        indexes = [
            models.Index(fields=['status', 'check_in_time']),
            models.Index(fields=['patient', 'check_in_time']),
        ]

# Optional: Vitals Model for each visit
class VitalSigns(models.Model):
    visit = models.OneToOneField(Visit, on_delete=models.CASCADE, related_name='vitals')
    taken_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    # Vital measurements
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)  # °C
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)  # mmHg
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)  # mmHg
    heart_rate = models.IntegerField(null=True, blank=True)  # bpm
    respiratory_rate = models.IntegerField(null=True, blank=True)  # breaths/min
    oxygen_saturation = models.IntegerField(null=True, blank=True)  # SpO2 %
    weight = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)  # kg
    height = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)  # meters
    bmi = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Additional notes
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # Calculate BMI if weight and height are provided
        if self.weight and self.height and self.height > 0:
            self.bmi = self.weight / (self.height * self.height)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Vitals for {self.visit.patient.name}"