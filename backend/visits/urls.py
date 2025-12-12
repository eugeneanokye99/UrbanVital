# visits/urls.py
from django.urls import path
from .views import (
    VisitListView,
    VisitDetailView,
    UpdateVisitStatusView,
    ActiveVisitsView,
    VisitStatsView,
    VitalSignsCreateView,
    VitalSignsDetailView,
)

urlpatterns = [
    # Visit endpoints
    path("", VisitListView.as_view(), name="visits-list"),
    path("active/", ActiveVisitsView.as_view(), name="active-visits"),
    path("<int:id>/", VisitDetailView.as_view(), name="visit-detail"),
    path("<int:id>/status/", UpdateVisitStatusView.as_view(), name="update-visit-status"),
    path("stats/", VisitStatsView.as_view(), name="visit-stats"),
    
    # Vital signs endpoints
    path("vitals/", VitalSignsCreateView.as_view(), name="create-vitals"),
    path("vitals/<int:visit_id>/", VitalSignsDetailView.as_view(), name="vitals-detail"),
]