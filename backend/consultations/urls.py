from django.urls import path
from .views import (
    ConsultationListCreateView, 
    ConsultationDetailView, 
    ConsultationByVisitView,
    PatientConsultationHistoryView,
    ClinicianDashboardStatsView,
    PrescriptionQueueView
)

urlpatterns = [
    path('', ConsultationListCreateView.as_view(), name='consultation-list'),
    path('<int:id>/', ConsultationDetailView.as_view(), name='consultation-detail'),
    path('visit/<int:visit_id>/', ConsultationByVisitView.as_view(), name='consultation-by-visit'),
    path('patient/<int:patient_id>/history/', PatientConsultationHistoryView.as_view(), name='patient-consultation-history'),
    path('stats/', ClinicianDashboardStatsView.as_view(), name='clinician-stats'),
    path('prescriptions/', PrescriptionQueueView.as_view(), name='prescription-queue'),
]
