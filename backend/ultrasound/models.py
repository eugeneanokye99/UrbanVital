# ultrasound/models.py
from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient
from visits.models import Visit
from django.utils import timezone
import random


def generate_scan_number():
    """Generate unique scan number: USG-YYYYMM-XXXX"""
    year_month = timezone.now().strftime("%Y%m")
    for _ in range(10000):
        suffix = f"{random.randint(0, 9999):04d}"
        scan_no = f"USG-{year_month}-{suffix}"
        if not UltrasoundScan.objects.filter(scan_number=scan_no).exists():
            return scan_no
    return f"USG-{year_month}-{random.randint(10000, 99999)}"


class UltrasoundOrder(models.Model):
    """Orders for ultrasound scans placed by clinicians"""
    
    URGENCY_CHOICES = [
        ('Normal', 'Normal'),
        ('Urgent', 'Urgent'),
        ('Emergency', 'Emergency'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    SCAN_TYPE_CHOICES = [
        ('Obstetric (1st Trimester)', 'Obstetric (1st Trimester)'),
        ('Obstetric (2nd Trimester)', 'Obstetric (2nd Trimester)'),
        ('Obstetric (3rd Trimester)', 'Obstetric (3rd Trimester)'),
        ('Abdominal', 'Abdominal'),
        ('Pelvic', 'Pelvic'),
        ('Thyroid', 'Thyroid'),
        ('Breast', 'Breast'),
        ('Renal/KUB', 'Renal/KUB'),
        ('Prostate', 'Prostate'),
        ('Scrotal', 'Scrotal'),
        ('Musculoskeletal', 'Musculoskeletal'),
        ('Doppler Study', 'Doppler Study'),
        ('Other', 'Other'),
    ]
    
    # Foreign Keys
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ultrasound_orders')
    visit = models.ForeignKey(Visit, on_delete=models.SET_NULL, null=True, blank=True, related_name='ultrasound_orders')
    ordered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ordered_ultrasounds')
    
    # Order Details
    scan_type = models.CharField(max_length=100, choices=SCAN_TYPE_CHOICES)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='Normal')
    clinical_indication = models.TextField(help_text="Clinical indication/reason for scan")
    special_instructions = models.TextField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    scheduled_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    ordered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.scan_type} - {self.patient.name} ({self.status})"
    
    class Meta:
        ordering = ['-ordered_at']
        indexes = [
            models.Index(fields=['status', 'urgency']),
            models.Index(fields=['patient', 'ordered_at']),
        ]


class UltrasoundScan(models.Model):
    """Actual ultrasound scan performed and report"""
    
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Verified', 'Verified'),
        ('Cancelled', 'Cancelled'),
    ]
    
    # Foreign Keys
    order = models.OneToOneField(UltrasoundOrder, on_delete=models.CASCADE, related_name='scan')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='ultrasound_scans')
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performed_ultrasounds')
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_ultrasounds')
    
    # Scan Details
    scan_number = models.CharField(max_length=50, unique=True, default=generate_scan_number, editable=False)
    scan_type = models.CharField(max_length=100)
    machine_used = models.CharField(max_length=100, blank=True, null=True)
    
    # Clinical Details
    clinical_indication = models.TextField()
    lmp = models.DateField(null=True, blank=True, help_text="Last Menstrual Period (for obstetric scans)")
    gestational_age = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., '12 weeks 3 days'")
    
    # Findings and Report
    technique = models.TextField(blank=True, null=True, help_text="Scan technique description")
    findings = models.TextField(help_text="Detailed ultrasound findings")
    measurements = models.JSONField(null=True, blank=True, help_text="Structured measurements data")
    impression = models.TextField(help_text="Conclusion/Impression")
    recommendations = models.TextField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    # Timestamps
    scan_started_at = models.DateTimeField(null=True, blank=True)
    scan_completed_at = models.DateTimeField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.scan_number} - {self.scan_type}"
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['scan_number']),
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['status']),
        ]


class UltrasoundImage(models.Model):
    """Images/attachments for ultrasound scans"""
    
    scan = models.ForeignKey(UltrasoundScan, on_delete=models.CASCADE, related_name='images')
    # image = models.ImageField(upload_to='ultrasound_images/%Y/%m/', null=True, blank=True)  # Requires Pillow
    image_path = models.CharField(max_length=500, blank=True, null=True, help_text="Path to uploaded image file")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="External image URL if not uploaded")
    image_type = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., Sagittal, Transverse, etc.")
    description = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.scan.scan_number}"
    
    class Meta:
        ordering = ['uploaded_at']


class UltrasoundEquipment(models.Model):
    """Equipment/machines available in ultrasound unit"""
    
    STATUS_CHOICES = [
        ('Operational', 'Operational'),
        ('Maintenance', 'Under Maintenance'),
        ('Offline', 'Offline'),
        ('Decommissioned', 'Decommissioned'),
    ]
    
    name = models.CharField(max_length=200)
    model = models.CharField(max_length=200, blank=True, null=True)
    serial_number = models.CharField(max_length=200, blank=True, null=True)
    manufacturer = models.CharField(max_length=200, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Operational')
    location = models.CharField(max_length=200, blank=True, null=True)
    
    purchase_date = models.DateField(null=True, blank=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Ultrasound Equipment'
