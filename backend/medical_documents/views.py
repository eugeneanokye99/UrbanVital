from rest_framework import generics, permissions
from .models import MedicalDocument
from .serializers import MedicalDocumentSerializer, MedicalDocumentDetailSerializer

class MedicalDocumentListCreateView(generics.ListCreateAPIView):
    queryset = MedicalDocument.objects.all()
    serializer_class = MedicalDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)
    
    def get_queryset(self):
        queryset = MedicalDocument.objects.all()
        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        return queryset

class MedicalDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MedicalDocument.objects.all()
    serializer_class = MedicalDocumentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
