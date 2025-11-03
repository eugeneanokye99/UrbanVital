from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from .models import StaffProfile
from .serializers import StaffProfileSerializer

class RegisterStaffUserView(generics.CreateAPIView):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAdminUser]
