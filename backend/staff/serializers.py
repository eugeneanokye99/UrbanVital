from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffProfile

class StaffProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email', required=False)
    password = serializers.CharField(write_only=True, source='user.password')

    class Meta:
        model = StaffProfile
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = user_data.pop('password')
        user = User.objects.create(**user_data)
        user.set_password(password)
        user.save()

        staff = StaffProfile.objects.create(user=user, **validated_data)
        return staff
