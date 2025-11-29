from django.urls import path
from .views import RegisterStaffUserView, GetStaffByEmailView

urlpatterns = [
    path('register/', RegisterStaffUserView.as_view(), name='register_staff_user'),
    path('by-email/', GetStaffByEmailView.as_view(), name='get_staff_by_email'),
]
