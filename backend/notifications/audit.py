from .models import Notification
from django.contrib.auth import get_user_model
User = get_user_model()

def log_action(user, action, message, extra=None):
    Notification.objects.create(
        user=user if user and user.is_authenticated else None,
        action=action,
        message=message,
        extra=extra or {}
    )
