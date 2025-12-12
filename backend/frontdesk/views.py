from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta
from billing.models import Invoice, Payment
from patients.models import Patient
from visits.models import Visit

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    """Get comprehensive dashboard data"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # Patient Stats
    total_patients = Patient.objects.count()
    today_patients = Patient.objects.filter(created_at__date=today).count()
    
    # Visit Stats
    today_visits = Visit.objects.filter(check_in_time__date=today).count()
    active_visits = Visit.objects.exclude(
        status__in=['Completed', 'Cancelled']
    ).count()
    
    # Billing Stats
    today_revenue = Payment.objects.filter(
        payment_date__date=today
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    week_revenue = Payment.objects.filter(
        payment_date__date__gte=week_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    pending_invoices = Invoice.objects.filter(
        status__in=['Pending', 'Partially Paid']
    ).count()
    
    # Recent Activity
    recent_patients = Patient.objects.order_by('-created_at')[:5]
    recent_visits = Visit.objects.select_related('patient').order_by('-check_in_time')[:5]
    
    # Process recent data for frontend
    recent_patients_data = []
    for patient in recent_patients:
        recent_patients_data.append({
            'id': patient.id,
            'name': patient.name,
            'mrn': patient.mrn,
            'created_at': patient.created_at,
            'phone': patient.phone,
        })
    
    recent_visits_data = []
    for visit in recent_visits:
        recent_visits_data.append({
            'id': visit.id,
            'patient_name': visit.patient.name,
            'service_type': visit.service_type,
            'status': visit.status,
            'check_in_time': visit.check_in_time,
            'doctor': visit.assigned_doctor.username if visit.assigned_doctor else '-',
        })
    
    # Weekly revenue data for chart
    weekly_revenue_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_revenue = Payment.objects.filter(
            payment_date__date=day
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        weekly_revenue_data.append({
            'day': day.strftime('%a'),
            'date': day.strftime('%Y-%m-%d'),
            'revenue': float(day_revenue),
        })
    
    weekly_revenue_data.reverse()
    
    return Response({
        'summary': {
            'total_patients': total_patients,
            'today_patients': today_patients,
            'today_visits': today_visits,
            'active_visits': active_visits,
            'today_revenue': float(today_revenue),
            'week_revenue': float(week_revenue),
            'pending_invoices': pending_invoices,
        },
        'recent_activity': {
            'patients': recent_patients_data,
            'visits': recent_visits_data,
        },
        'charts': {
            'weekly_revenue': weekly_revenue_data,
        }
    })