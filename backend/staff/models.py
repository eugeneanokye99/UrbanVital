from django.db import models
from django.contrib.auth.models import User

class StaffProfile(models.Model):
    ROLE_CHOICES = [
        ('Clinician', 'Clinician'),
        ('Lab', 'Lab'),
        ('Pharmacy', 'Pharmacy'),
        ('Phlebotomist', 'Phlebotomist'),
        ('Ultrasound', 'Ultrasound'),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='staff_profile'
    )

    # fields you requested
    username = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)

    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=30, blank=True, null=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff_created',
        help_text="Admin who registered this staff user."
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
