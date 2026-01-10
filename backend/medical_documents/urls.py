from django.urls import path
from .views import MedicalDocumentListCreateView, MedicalDocumentDetailView

urlpatterns = [
    path('', MedicalDocumentListCreateView.as_view(), name='medical-document-list'),
    path('<int:id>/', MedicalDocumentDetailView.as_view(), name='medical-document-detail'),
]
