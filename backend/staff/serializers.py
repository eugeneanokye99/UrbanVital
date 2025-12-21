from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile

class StaffProfileSerializer(serializers.ModelSerializer):
    # Read fields (for GET requests)
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    
    # Write fields (for POST requests)
    password = serializers.CharField(write_only=True, required=False)
    new_username = serializers.CharField(write_only=True, required=False)
    new_email = serializers.EmailField(write_only=True, required=False)
    
    # Phone can be read and written
    phone = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = StaffProfile
        fields = [
            'id', 
            'username',  # Read from user.username
            'email',     # Read from user.email
            'new_username',  # Write only (for updates)
            'new_email',     # Write only (for updates)
            'password',  # Write only
            'role', 
            'phone',
            'created_by_id'  # Add this if you want to show who created the staff
        ]
        read_only_fields = ['id', 'created_by_id']

    def validate(self, data):
        # For create/update operations, check if username/email already exists
        request = self.context.get('request')
        
        if request and request.method in ['POST', 'PUT', 'PATCH']:
            new_username = data.get('new_username') or data.get('username')
            new_email = data.get('new_email') or data.get('email')
            
            # Check for duplicate username
            if new_username:
                user_qs = User.objects.filter(username=new_username)
                if self.instance and hasattr(self.instance, 'user'):
                    user_qs = user_qs.exclude(id=self.instance.user.id)
                if user_qs.exists():
                    raise serializers.ValidationError({
                        "username": "A user with that username already exists."
                    })
            
            # Check for duplicate email
            if new_email:
                user_qs = User.objects.filter(email=new_email)
                if self.instance and hasattr(self.instance, 'user'):
                    user_qs = user_qs.exclude(id=self.instance.user.id)
                if user_qs.exists():
                    raise serializers.ValidationError({
                        "email": "A user with that email already exists."
                    })
        
        return data

    def create(self, validated_data):
        # Extract user creation data
        password = validated_data.pop('password', None)
        new_username = validated_data.pop('new_username', None)
        new_email = validated_data.pop('new_email', None)
        phone = validated_data.pop('phone', None)
        role = validated_data.get('role')
        
        # Use new_username/email if provided, otherwise fallback to regular fields
        username = new_username or validated_data.get('username', '')
        email = new_email or validated_data.get('email', '')
        
        # Create Django user
        user = User.objects.create(username=username, email=email)
        if password:
            user.set_password(password)
        user.save()

        # Get the admin who created this staff member
        request = self.context.get('request')
        created_by = request.user if request and request.user.is_authenticated else None

        # Create staff profile
        staff = StaffProfile.objects.create(
            user=user,
            username=username,
            email=email,
            phone=phone,
            role=role,
            created_by_id=created_by
        )

        return staff

    def update(self, instance, validated_data):
        # Handle user updates if provided
        user_data = {}
        password = validated_data.pop('password', None)
        new_username = validated_data.pop('new_username', None)
        new_email = validated_data.pop('new_email', None)
        
        if new_username:
            user_data['username'] = new_username
            instance.username = new_username
        
        if new_email:
            user_data['email'] = new_email
            instance.email = new_email
        
        if user_data:
            User.objects.filter(id=instance.user.id).update(**user_data)
        
        if password:
            instance.user.set_password(password)
            instance.user.save()
        
        # Update other fields
        return super().update(instance, validated_data)