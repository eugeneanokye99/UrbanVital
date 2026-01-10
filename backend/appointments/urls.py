from django.urls import path
from .views import (
    AppointmentListCreateView, 
    AppointmentDetailView, 
    PatientAppointmentHistoryView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list'),
    path('<int:id>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('patient/<int:patient_id>/history/', PatientAppointmentHistoryView.as_view(), name='patient-appointment-history'),
]
