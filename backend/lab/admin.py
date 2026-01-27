from django.contrib import admin
from .models import LabTest, LabOrder, LabOrderTest, LabResult


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(LabOrder)
class LabOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'urgency', 'status', 'ordered_by', 'created_at']
    list_filter = ['status', 'urgency', 'created_at']
    search_fields = ['patient__name', 'patient__mrn', 'clinical_indication']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(LabOrderTest)
class LabOrderTestAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'test', 'created_at']
    list_filter = ['created_at']
    search_fields = ['order__patient__name', 'test__name']
    ordering = ['-created_at']


@admin.register(LabResult)
class LabResultAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'status', 'performed_by', 'verified_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__patient__name', 'order__id']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
