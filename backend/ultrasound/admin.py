# ultrasound/admin.py
from django.contrib import admin
from .models import UltrasoundOrder, UltrasoundScan, UltrasoundImage, UltrasoundEquipment


@admin.register(UltrasoundOrder)
class UltrasoundOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'scan_type', 'urgency', 'status', 'ordered_by', 'ordered_at']
    list_filter = ['status', 'urgency', 'scan_type', 'ordered_at']
    search_fields = ['patient__name', 'patient__first_name', 'patient__last_name', 'patient__mrn', 'scan_type']
    readonly_fields = ['ordered_at', 'updated_at']
    date_hierarchy = 'ordered_at'
    
    fieldsets = (
        ('Patient Information', {
            'fields': ('patient', 'visit')
        }),
        ('Order Details', {
            'fields': ('scan_type', 'urgency', 'clinical_indication', 'special_instructions')
        }),
        ('Status', {
            'fields': ('status', 'scheduled_date')
        }),
        ('Metadata', {
            'fields': ('ordered_by', 'ordered_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UltrasoundScan)
class UltrasoundScanAdmin(admin.ModelAdmin):
    list_display = ['scan_number', 'patient', 'scan_type', 'status', 'performed_by', 'created_at']
    list_filter = ['status', 'scan_type', 'created_at', 'verified_at']
    search_fields = ['scan_number', 'patient__name', 'patient__first_name', 'patient__last_name', 'patient__mrn']
    readonly_fields = ['scan_number', 'created_at', 'updated_at', 'verified_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Scan Information', {
            'fields': ('scan_number', 'order', 'patient', 'scan_type', 'machine_used')
        }),
        ('Clinical Details', {
            'fields': ('clinical_indication', 'lmp', 'gestational_age')
        }),
        ('Report', {
            'fields': ('technique', 'findings', 'measurements', 'impression', 'recommendations')
        }),
        ('Status & Verification', {
            'fields': ('status', 'performed_by', 'verified_by', 'verified_at')
        }),
        ('Timestamps', {
            'fields': ('scan_started_at', 'scan_completed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UltrasoundImage)
class UltrasoundImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'scan', 'image_type', 'uploaded_at']
    list_filter = ['uploaded_at', 'image_type']
    search_fields = ['scan__scan_number', 'description']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'


@admin.register(UltrasoundEquipment)
class UltrasoundEquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'model', 'status', 'location', 'last_maintenance_date']
    list_filter = ['status', 'manufacturer']
    search_fields = ['name', 'model', 'serial_number']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Equipment Details', {
            'fields': ('name', 'model', 'serial_number', 'manufacturer', 'status', 'location')
        }),
        ('Maintenance', {
            'fields': ('purchase_date', 'last_maintenance_date', 'next_maintenance_date')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
