from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.conf import settings
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    Notification.objects.create(
        user=user,
        action="login",
        message=f"{user} logged in."
    )

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    Notification.objects.create(
        user=user,
        action="logout",
        message=f"{user} logged out."
    )
