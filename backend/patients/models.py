# patients/models.py
from django.db import models
from django.utils import timezone
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

    mrn = models.CharField(max_length=32, unique=True, editable=False)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=40)
    address = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=16, choices=GENDER_CHOICES, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    flags = models.TextField(blank=True, null=True)  # allergies, chronic conditions
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.mrn:
            self.mrn = generate_mrn()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} — {self.mrn}"
