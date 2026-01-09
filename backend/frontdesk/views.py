from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta
from billing.models import Invoice, Payment, ServiceItem
from patients.models import Patient
from visits.models import Visit
from inventory.models import Inventory

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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_comprehensive_stats(request):
    """Comprehensive statistics for Admin Dashboard"""
    today = timezone.now().date()
    month_start = today.replace(day=1)
    week_ago = today - timedelta(days=7)
    
    # Patient Statistics
    total_patients = Patient.objects.count()
    new_patients_today = Patient.objects.filter(created_at__date=today).count()
    new_patients_week = Patient.objects.filter(created_at__date__gte=week_ago).count()
    new_patients_month = Patient.objects.filter(created_at__date__gte=month_start).count()
    
    # Visit Statistics  
    total_visits_today = Visit.objects.filter(check_in_time__date=today).count()
    active_visits = Visit.objects.filter(
        status__in=['Waiting', 'In Progress', 'Triaged']
    ).count()
    completed_visits_today = Visit.objects.filter(
        check_in_time__date=today,
        status='Completed'
    ).count()
    
    # Revenue Statistics
    total_revenue_today = Payment.objects.filter(
        payment_date__date=today
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_revenue_week = Payment.objects.filter(
        payment_date__date__gte=week_ago
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    total_revenue_month = Payment.objects.filter(
        payment_date__date__gte=month_start
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # Revenue by Department (from invoice items)
    revenue_by_dept = {}
    for category_code, category_name in ServiceItem.CATEGORY_CHOICES:
        dept_revenue = Payment.objects.filter(
            invoice__items__service_item__category=category_code,
            payment_date__date__gte=month_start
        ).aggregate(total=Sum('amount'))['total'] or 0
        revenue_by_dept[category_name] = float(dept_revenue)
    
    # Inventory Statistics
    total_inventory = Inventory.objects.filter(is_active=True).count()
    low_stock_items = Inventory.objects.filter(
        current_stock__lte=models.F('minimum_stock'),
        is_active=True
    ).count()
    out_of_stock = Inventory.objects.filter(
        current_stock=0,
        is_active=True
    ).count()
    
    # Staff Statistics
    total_staff = User.objects.filter(is_active=True).count()
    # Note: Django User model doesn't have 'role' field by default
    # Use is_staff/is_superuser or extend User model if needed
    staff_by_role = []
    
    # Pending Invoices
    pending_invoices = Invoice.objects.filter(
        status__in=['Pending', 'Partially Paid']
    ).count()
    pending_invoice_amount = Invoice.objects.filter(
        status__in=['Pending', 'Partially Paid']
    ).aggregate(
        total=Sum(models.F('total_amount') - models.F('amount_paid'))
    )['total'] or 0
    
    # Weekly trend data (last 7 days)
    weekly_data = []
    for i in range(7):
        day = today - timedelta(days=i)
        day_revenue = Payment.objects.filter(
            payment_date__date=day
        ).aggregate(total=Sum('amount'))['total'] or 0
        day_patients = Patient.objects.filter(
            created_at__date=day
        ).count()
        day_visits = Visit.objects.filter(
            check_in_time__date=day
        ).count()
        
        weekly_data.append({
            'day': day.strftime('%a'),
            'date': day.strftime('%Y-%m-%d'),
            'revenue': float(day_revenue),
            'patients': day_patients,
            'visits': day_visits,
        })
    
    weekly_data.reverse()
    
    # Recent Transactions (last 5 payments)
    recent_payments = Payment.objects.select_related(
        'invoice__patient', 'received_by'
    ).order_by('-payment_date')[:5]
    
    recent_transactions = []
    for payment in recent_payments:
        recent_transactions.append({
            'id': payment.id,
            'patient': payment.invoice.patient.name,
            'amount': float(payment.amount),
            'method': payment.payment_method,
            'date': payment.payment_date,
            'cashier': payment.received_by.get_full_name() if payment.received_by else 'Unknown',
        })
    
    # Recent Alerts (low stock, pending invoices, etc.)
    alerts = []
    if low_stock_items > 0:
        alerts.append({
            'type': 'warning',
            'title': 'Low Stock Alert',
            'message': f'{low_stock_items} items are running low on stock',
            'action': 'View Inventory'
        })
    if out_of_stock > 0:
        alerts.append({
            'type': 'critical',
            'title': 'Out of Stock',
            'message': f'{out_of_stock} items are out of stock',
            'action': 'Restock Now'
        })
    if pending_invoices > 10:
        alerts.append({
            'type': 'info',
            'title': 'Pending Invoices',
            'message': f'{pending_invoices} invoices awaiting payment',
            'action': 'Review Billing'
        })
    
    return Response({
        'patients': {
            'total': total_patients,
            'today': new_patients_today,
            'week': new_patients_week,
            'month': new_patients_month,
            'change_percentage': '+0%',  # Calculate based on previous period
        },
        'visits': {
            'today': total_visits_today,
            'active': active_visits,
            'completed_today': completed_visits_today,
        },
        'revenue': {
            'today': float(total_revenue_today),
            'week': float(total_revenue_week),
            'month': float(total_revenue_month),
            'by_department': revenue_by_dept,
            'change_percentage': '+0%',  # Calculate based on previous period
        },
        'inventory': {
            'total_items': total_inventory,
            'low_stock': low_stock_items,
            'out_of_stock': out_of_stock,
        },
        'staff': {
            'total': total_staff,
            'by_role': {},  # Empty dict until role field is added to User model
        },
        'billing': {
            'pending_invoices': pending_invoices,
            'pending_amount': float(pending_invoice_amount),
        },
        'charts': {
            'weekly_trend': weekly_data,
        },
        'recent_transactions': recent_transactions,
        'alerts': alerts,
    })