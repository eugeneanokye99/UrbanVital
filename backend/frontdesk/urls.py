# dashboard/urls.py (or add to main urls)
from django.urls import path
from .views import dashboard_summary, admin_comprehensive_stats

urlpatterns = [
    path('summary/', dashboard_summary, name='dashboard-summary'),
    path('admin-stats/', admin_comprehensive_stats, name='admin-comprehensive-stats'),
]