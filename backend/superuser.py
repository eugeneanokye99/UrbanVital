import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
if not User.objects.filter(username="urbanvital").exists():
    User.objects.create_superuser(
        username="urbanvital",
        email="felanotechnologies@gmail.com",
        password="UrbanVital@2026"
    )
