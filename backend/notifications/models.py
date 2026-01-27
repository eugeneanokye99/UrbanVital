from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

action_choices = [
    ("login", "Login"),
    ("logout", "Logout"),
    ("create", "Create"),
    ("update", "Update"),
    ("delete", "Delete"),
    ("api_call", "API Call"),
]

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=action_choices)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    extra = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} {self.action} {self.created_at}"