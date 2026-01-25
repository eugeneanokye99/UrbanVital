"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/staff/', include('staff.urls')),
    path('api/patients/', include('patients.urls')),
    path('api/visits/', include('visits.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/frontdesk/', include('frontdesk.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/ultrasound/', include('ultrasound.urls')),
    path('api/lab/', include('lab.urls')),
    path('api/consultations/', include('consultations.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/medical-documents/', include('medical_documents.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Catch-all route for React frontend
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]