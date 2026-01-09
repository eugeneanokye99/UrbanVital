# Generated migration for ultrasound app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import ultrasound.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('patients', '0002_alter_patient_options_and_more'),
        ('visits', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UltrasoundOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scan_type', models.CharField(choices=[('Obstetric (1st Trimester)', 'Obstetric (1st Trimester)'), ('Obstetric (2nd Trimester)', 'Obstetric (2nd Trimester)'), ('Obstetric (3rd Trimester)', 'Obstetric (3rd Trimester)'), ('Abdominal', 'Abdominal'), ('Pelvic', 'Pelvic'), ('Thyroid', 'Thyroid'), ('Breast', 'Breast'), ('Renal/KUB', 'Renal/KUB'), ('Prostate', 'Prostate'), ('Scrotal', 'Scrotal'), ('Musculoskeletal', 'Musculoskeletal'), ('Doppler Study', 'Doppler Study'), ('Other', 'Other')], max_length=100)),
                ('urgency', models.CharField(choices=[('Normal', 'Normal'), ('Urgent', 'Urgent'), ('Emergency', 'Emergency')], default='Normal', max_length=20)),
                ('clinical_indication', models.TextField(help_text='Clinical indication/reason for scan')),
                ('special_instructions', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Pending', 'Pending'), ('Scheduled', 'Scheduled'), ('In Progress', 'In Progress'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')], default='Pending', max_length=20)),
                ('scheduled_date', models.DateTimeField(blank=True, null=True)),
                ('ordered_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ordered_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ordered_ultrasounds', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ultrasound_orders', to='patients.patient')),
                ('visit', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ultrasound_orders', to='visits.visit')),
            ],
            options={
                'ordering': ['-ordered_at'],
                'indexes': [models.Index(fields=['status', 'urgency'], name='ultrasound_u_status_idx'), models.Index(fields=['patient', 'ordered_at'], name='ultrasound_u_patient_idx')],
            },
        ),
        migrations.CreateModel(
            name='UltrasoundEquipment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('model', models.CharField(blank=True, max_length=200, null=True)),
                ('serial_number', models.CharField(blank=True, max_length=200, null=True)),
                ('manufacturer', models.CharField(blank=True, max_length=200, null=True)),
                ('status', models.CharField(choices=[('Operational', 'Operational'), ('Maintenance', 'Under Maintenance'), ('Offline', 'Offline'), ('Decommissioned', 'Decommissioned')], default='Operational', max_length=20)),
                ('location', models.CharField(blank=True, max_length=200, null=True)),
                ('purchase_date', models.DateField(blank=True, null=True)),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('next_maintenance_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Ultrasound Equipment',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='UltrasoundScan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scan_number', models.CharField(default=ultrasound.models.generate_scan_number, editable=False, max_length=50, unique=True)),
                ('scan_type', models.CharField(max_length=100)),
                ('machine_used', models.CharField(blank=True, max_length=100, null=True)),
                ('clinical_indication', models.TextField()),
                ('lmp', models.DateField(blank=True, help_text='Last Menstrual Period (for obstetric scans)', null=True)),
                ('gestational_age', models.CharField(blank=True, help_text="e.g., '12 weeks 3 days'", max_length=50, null=True)),
                ('technique', models.TextField(blank=True, help_text='Scan technique description', null=True)),
                ('findings', models.TextField(help_text='Detailed ultrasound findings')),
                ('measurements', models.JSONField(blank=True, help_text='Structured measurements data', null=True)),
                ('impression', models.TextField(help_text='Conclusion/Impression')),
                ('recommendations', models.TextField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Draft', 'Draft'), ('In Progress', 'In Progress'), ('Completed', 'Completed'), ('Verified', 'Verified'), ('Cancelled', 'Cancelled')], default='Draft', max_length=20)),
                ('scan_started_at', models.DateTimeField(blank=True, null=True)),
                ('scan_completed_at', models.DateTimeField(blank=True, null=True)),
                ('verified_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='scan', to='ultrasound.ultrasoundorder')),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ultrasound_scans', to='patients.patient')),
                ('performed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='performed_ultrasounds', to=settings.AUTH_USER_MODEL)),
                ('verified_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='verified_ultrasounds', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'indexes': [models.Index(fields=['scan_number'], name='ultrasound_u_scan_nu_idx'), models.Index(fields=['patient', 'created_at'], name='ultrasound_u_patient_idx2'), models.Index(fields=['status'], name='ultrasound_u_status_idx2')],
            },
        ),
        migrations.CreateModel(
            name='UltrasoundImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image_path', models.CharField(blank=True, help_text='Path to uploaded image file', max_length=500, null=True)),
                ('image_url', models.URLField(blank=True, help_text='External image URL if not uploaded', max_length=500, null=True)),
                ('image_type', models.CharField(blank=True, help_text='e.g., Sagittal, Transverse, etc.', max_length=100, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('scan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='ultrasound.ultrasoundscan')),
            ],
            options={
                'ordering': ['uploaded_at'],
            },
        ),
    ]
