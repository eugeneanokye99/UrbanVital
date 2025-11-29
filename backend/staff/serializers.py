from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile

class StaffProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = StaffProfile
        fields = ['id', 'username', 'email', 'password', 'role', 'phone']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        phone = validated_data.pop('phone', None)
        role = validated_data.get('role')

        # create django user
        user = User.objects.create(username=username, email=email)
        user.set_password(password)
        user.save()

        # created by admin
        request = self.context.get('request')
        created_by = request.user if request and request.user.is_authenticated else None

        # create staff profile WITH ONLY username + email + phone + role
        staff = StaffProfile.objects.create(
            user=user,
            username=username,
            email=email,
            phone=phone,
            role=role,
            created_by=created_by
        )

        return staff
