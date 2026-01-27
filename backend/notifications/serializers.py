from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Notification
        fields = ['id', 'user', 'action', 'message', 'created_at', 'is_read', 'extra']
