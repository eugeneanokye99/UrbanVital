from django.db import models
from django.contrib.auth.models import User
from patients.models import Patient


class LabTest(models.Model):
    """Catalog of available lab tests"""
    TEST_CATEGORIES = [
        ('Hematology', 'Hematology'),
        ('Biochemistry', 'Biochemistry'),
        ('Parasitology', 'Parasitology'),
        ('Microbiology', 'Microbiology'),
        ('Immunology', 'Immunology'),
        ('Serology', 'Serology'),
        ('Urinalysis', 'Urinalysis'),
        ('Hormones', 'Hormones'),
        ('Coagulation', 'Coagulation'),
        ('Other', 'Other'),
    ]
    
    SAMPLE_TYPE_CHOICES = [
        ('Blood', 'Blood'),
        ('Urine', 'Urine'),
        ('Stool', 'Stool'),
        ('Sputum', 'Sputum'),
        ('Swab', 'Swab'),
        ('Serum', 'Serum'),
        ('Plasma', 'Plasma'),
        ('Other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=50, choices=TEST_CATEGORIES)
    description = models.TextField(blank=True)
    sample_type = models.CharField(max_length=100, choices=SAMPLE_TYPE_CHOICES)
    turnaround_time = models.CharField(max_length=100, help_text="Expected TAT (e.g., '2-4 hours')")
    normal_range = models.TextField(blank=True, help_text="Reference range for results")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class LabOrder(models.Model):
    """Lab test orders"""
    URGENCY_CHOICES = [
        ('Normal', 'Normal'),
        ('Urgent', 'Urgent'),
        ('Emergency', 'Emergency'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Sample Collected', 'Sample Collected'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='lab_orders')
    ordered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ordered_lab_tests')
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='Normal')
    clinical_indication = models.TextField()
    special_instructions = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    # Sample collection info
    sample_collected_at = models.DateTimeField(null=True, blank=True)
    sample_collected_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, 
        related_name='collected_lab_samples'
    )
    
    # Processing info
    processed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='processed_lab_orders'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'urgency']),
            models.Index(fields=['patient', 'created_at']),
        ]
    
    def __str__(self):
        return f"Lab Order #{self.id} - {self.patient.name}"


class LabOrderTest(models.Model):
    """Individual tests within a lab order"""
    order = models.ForeignKey(LabOrder, on_delete=models.CASCADE, related_name='tests')
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['order', 'test']
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.order} - {self.test.name}"


class LabResult(models.Model):
    """Lab test results"""
    STATUS_CHOICES = [
        ('Preliminary', 'Preliminary'),
        ('Final', 'Final'),
        ('Corrected', 'Corrected'),
        ('Cancelled', 'Cancelled'),
    ]
    
    order = models.OneToOneField(LabOrder, on_delete=models.CASCADE, related_name='result')
    results_data = models.JSONField(help_text="Test results in JSON format")
    interpretation = models.TextField(blank=True)
    abnormal_flags = models.JSONField(default=list, blank=True, help_text="List of abnormal findings")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Preliminary')
    
    performed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='performed_lab_tests'
    )
    verified_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='verified_lab_results'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Lab Result for Order #{self.order.id}"
