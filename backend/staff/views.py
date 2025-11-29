from rest_framework import generics
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.contrib.auth.models import User
from .models import StaffProfile
from .serializers import StaffProfileSerializer

class RegisterStaffUserView(generics.CreateAPIView):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class GetStaffByEmailView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StaffProfileSerializer

    def get(self, request):
        email = request.GET.get('email')

        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise NotFound("No user found with that email.")

        try:
            staff = StaffProfile.objects.get(user=user)
        except StaffProfile.DoesNotExist:
            raise NotFound("This user is not a registered staff member.")

        serializer = self.get_serializer(staff)
        return Response(serializer.data)
