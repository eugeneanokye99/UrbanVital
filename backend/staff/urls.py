from django.urls import path
from .views import (
    RegisterStaffUserView, 
    GetStaffByEmailView, 
    GetAllStaffView, 
    GetStaffStatsView,
    StaffDetailView,
    UpdateStaffStatusView,
    ResetStaffPasswordView
)

urlpatterns = [
    path('register/', RegisterStaffUserView.as_view(), name='register_staff_user'),
    path('by-email/', GetStaffByEmailView.as_view(), name='get_staff_by_email'),
    path('all/', GetAllStaffView.as_view(), name='all-staff'),
    path('stats/', GetStaffStatsView.as_view(), name='staff-stats'),
    
    # New endpoints for staff management
    path('<int:pk>/', StaffDetailView.as_view(), name='staff-detail'),
    path('<int:pk>/status/', UpdateStaffStatusView.as_view(), name='staff-status-update'),
    path('<int:pk>/reset-password/', ResetStaffPasswordView.as_view(), name='staff-password-reset'),
]
