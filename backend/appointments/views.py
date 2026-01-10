from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Appointment
from .serializers import AppointmentSerializer, AppointmentDetailSerializer
from django.utils import timezone

class AppointmentListCreateView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'patient', 'doctor', 'appointment_date']
    search_fields = ['patient__name', 'patient__first_name', 'patient__last_name', 'reason']
    ordering_fields = ['appointment_date', 'appointment_time']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = Appointment.objects.all().select_related('patient', 'doctor')
        
        # Filter by "upcoming" or "past"
        time_filter = self.request.query_params.get('time_filter', None)
        today = timezone.now().date()
        
        if time_filter == 'upcoming':
            queryset = queryset.filter(appointment_date__gte=today, status='Scheduled')
        elif time_filter == 'missed':
            queryset = queryset.filter(appointment_date__lt=today, status='Scheduled')
        
        return queryset

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

class PatientAppointmentHistoryView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        return Appointment.objects.filter(patient_id=patient_id).order_by('-appointment_date')
