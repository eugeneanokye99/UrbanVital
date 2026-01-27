from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User  # using Django's default User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from notifications.audit import log_action

# --- Login View (Token generation) ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = getattr(serializer, 'user', None)
        username = user.username if user else 'Unknown'
        # Try to get role from staff profile if it exists
        role = None
        if user:
            staff_profile = getattr(user, 'staff_profile', None)
            if staff_profile:
                role = getattr(staff_profile, 'role', None)
        log_action(user, "login", f"User {username} ({role}) logged in.")
        return Response(serializer.validated_data, status=200)

# --- Fetch Current User Info ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "date_joined": user.date_joined,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    user = request.user if request.user.is_authenticated else None
    username = user.username if user else 'Unknown'
    log_action(user, "logout", f"User {username} logged out.")
    return Response({"detail": "Logout logged."})