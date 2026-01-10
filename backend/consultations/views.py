from rest_framework import generics, permissions, status
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Consultation
from .serializers import ConsultationSerializer, ConsultationDetailSerializer
from visits.models import Visit

class ConsultationListCreateView(generics.ListCreateAPIView):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        visit_id = self.request.data.get('visit')
        try:
            visit = Visit.objects.get(id=visit_id)
            # Update visit status when consultation is recorded
            visit.status = 'Ready for Discharge' # Or 'Awaiting Lab'/'Awaiting Pharmacy' depending on plan
            # For now, let's keep it simple. The frontend can update status separately if needed.
            visit.save()
        except Visit.DoesNotExist:
            pass
            
        serializer.save(doctor=self.request.user)

class ConsultationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

class ConsultationByVisitView(generics.RetrieveAPIView):
    serializer_class = ConsultationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        visit_id = self.kwargs.get('visit_id')
        return generics.get_object_or_404(Consultation, visit_id=visit_id)

class PatientConsultationHistoryView(generics.ListAPIView):
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return Consultation.objects.filter(patient_id=patient_id)

class ClinicianDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        today = timezone.now().date()
        
        # Patients seen by this doctor today
        patients_today = Consultation.objects.filter(
            doctor=request.user,
            created_at__date=today
        ).count()
        
        # Patients waiting (vitals taken or checked in, not yet seen or in consultation)
        # Note: This might need adjustment based on how 'waiting' is defined
        waiting_count = Visit.objects.filter(
            status__in=['Checked In', 'Vitals Taken']
        ).count()
        
        # Lab results ready
        from lab.models import LabOrder
        lab_results_ready = LabOrder.objects.filter(
            status='Completed',
            # You might want to filter only for patients of this doctor
            # but usually clinicians want to see all ready labs for their patients
            # For now, let's just count all completed lab orders today
            completed_at__date=today
        ).count()
        
        # Today's schedule (Active visits assigned to this doctor or unassigned)
        from visits.serializers import VisitSerializer
        todays_visits = Visit.objects.filter(
            check_in_time__date=today
        ).exclude(status__in=['Completed', 'Cancelled'])
        
        # If the user is a doctor, they might want to see visits assigned to them
        # if assigned_doctor is used.
        
        return Response({
            'patients_today': patients_today,
            'waiting_count': waiting_count,
            'lab_results_ready': lab_results_ready,
            'schedule': VisitSerializer(todays_visits, many=True).data
        })
