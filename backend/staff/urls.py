from django.urls import path
from .views import RegisterStaffUserView

urlpatterns = [
    path('register/', RegisterStaffUserView.as_view(), name='register_staff_user'),
]
