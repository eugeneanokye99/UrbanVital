# patients/urls.py
from django.urls import path
from .views import (
    PatientListView,
    PatientCreateView,
    PatientDetailView,
    PatientStatsView
)

urlpatterns = [
    # GET all patients (with search/filter)
    path("", PatientListView.as_view(), name="patients-list"),
    
    # POST create new patient
    path("create/", PatientCreateView.as_view(), name="patient-create"),
    
    # GET/PUT/PATCH/DELETE single patient
    path("<int:id>/", PatientDetailView.as_view(), name="patient-detail"),
    
    # GET patient statistics
    path("stats/", PatientStatsView.as_view(), name="patient-stats"),
]