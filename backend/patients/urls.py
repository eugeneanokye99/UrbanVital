# patients/urls.py
from django.urls import path
from .views import PatientListCreateView, PatientDetailView

urlpatterns = [
    path("", PatientListCreateView.as_view(), name="patients-list-create"),
    path("<int:id>/", PatientDetailView.as_view(), name="patient-detail"),
]
