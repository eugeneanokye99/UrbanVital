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
            staff = StaffProfile.objects.get(email=email)  # Directly query StaffProfile by email
        except StaffProfile.DoesNotExist:
            raise NotFound("No staff member found with that email.")

        serializer = self.get_serializer(staff)
        return Response(serializer.data)


class GetAllStaffView(generics.ListAPIView):
    """
    API endpoint to get all staff members
    """
    permission_classes = [IsAuthenticated]
    serializer_class = StaffProfileSerializer
    
    def get_queryset(self):
        # Get all staff profiles
        queryset = StaffProfile.objects.all()
        
        # Apply search filter if provided
        search_query = self.request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                username__icontains=search_query
            ) | queryset.filter(
                email__icontains=search_query
            ) | queryset.filter(
                phone__icontains=search_query
            )
        
        # Apply role filter if provided
        role_filter = self.request.query_params.get('role', None)
        if role_filter and role_filter != "All":
            queryset = queryset.filter(role=role_filter)
        
        return queryset.order_by('username')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Count active staff (you might need to define what "active" means)
        # For now, let's assume all are active unless you have a status field
        active_count = queryset.count()  # Adjust if you have status field
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'staff': serializer.data,
            'total_count': queryset.count(),
            'active_count': active_count,
        })


class GetStaffStatsView(generics.GenericAPIView):
    """
    API endpoint to get staff statistics
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_staff = StaffProfile.objects.count()
        
        # Count by role (adjust based on your actual roles)
        role_counts = {}
        for role in StaffProfile.objects.values_list('role', flat=True).distinct():
            role_counts[role] = StaffProfile.objects.filter(role=role).count()
        
        return Response({
            'total_staff': total_staff,
            'role_counts': role_counts,
            # Add more stats as needed
        })