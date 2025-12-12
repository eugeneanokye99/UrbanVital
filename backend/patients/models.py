# patients/models.py
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
import random

def generate_mrn():
    year = timezone.now().year
    for _ in range(10000):
        suffix = f"{random.randint(0, 9999):04d}"
        mrn = f"UV-{year}-{suffix}"
        if not Patient.objects.filter(mrn=mrn).exists():
            return mrn
    # fallback — extremely unlikely
    return f"UV-{year}-{random.randint(10000, 99999)}"

class Patient(models.Model):
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ("Single", "Single"),
        ("Married", "Married"),
        ("Divorced", "Divorced"),
        ("Widowed", "Widowed"),
    ]
    
    ID_TYPE_CHOICES = [
        ("Ghana Card", "Ghana Card"),
        ("Passport", "Passport"),
        ("Driver's License", "Driver's License"),
        ("Voter ID", "Voter ID"),
    ]
    
    PAYMENT_MODE_CHOICES = [
        ("Cash", "Cash"),
        ("Insurance", "Insurance"),
        ("Card", "Card"),
        ("Mobile Money", "Mobile Money"),
    ]
    
    INSURANCE_PROVIDER_CHOICES = [
        ("NHIS", "NHIS"),
        ("Activa", "Activa"),
        ("Sunu", "Sunu"),
        ("Glico", "Glico"),
        ("Enterprise", "Enterprise"),
        ("Other", "Other"),
    ]

    # Personal Information
    mrn = models.CharField(max_length=32, unique=True, editable=False)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=16, choices=GENDER_CHOICES, blank=True, null=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    
    # Identification
    id_type = models.CharField(max_length=50, choices=ID_TYPE_CHOICES, default="Ghana Card")
    id_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Contact Information
    phone = models.CharField(max_length=40)
    email = models.EmailField(max_length=255, blank=True, null=True)
    address = models.TextField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    
    # Emergency Contact
    emergency_name = models.CharField(max_length=255, blank=True, null=True)
    emergency_phone = models.CharField(max_length=40, blank=True, null=True)
    emergency_relation = models.CharField(max_length=50, blank=True, null=True)
    
    # Insurance/Payment
    payment_mode = models.CharField(max_length=50, choices=PAYMENT_MODE_CHOICES, default="Cash")
    insurance_provider = models.CharField(max_length=100, choices=INSURANCE_PROVIDER_CHOICES, blank=True, null=True)
    insurance_number = models.CharField(max_length=100, blank=True, null=True)
    
    # Medical Information
    medical_flags = models.TextField(blank=True, null=True)  # allergies, chronic conditions
    
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients_created')
    
    def save(self, *args, **kwargs):
        if not self.mrn:
            self.mrn = generate_mrn()
        super().save(*args, **kwargs)
    
    @property
    def name(self):
        """Return full name for compatibility with existing code"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def contact_person(self):
        """Return emergency contact for compatibility"""
        return self.emergency_name
    
    @property
    def flags(self):
        """Return medical flags for compatibility"""
        return self.medical_flags
    
    def __str__(self):
        return f"{self.name} — {self.mrn}"
    
    class Meta:
        ordering = ['-created_at']