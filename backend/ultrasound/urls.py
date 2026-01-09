# ultrasound/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Ultrasound Orders
    path('orders/', views.UltrasoundOrderListView.as_view(), name='ultrasound-order-list'),
    path('orders/<int:id>/', views.UltrasoundOrderDetailView.as_view(), name='ultrasound-order-detail'),
    path('orders/pending/', views.PendingUltrasoundOrdersView.as_view(), name='pending-ultrasound-orders'),
    path('orders/<int:id>/status/', views.UpdateUltrasoundOrderStatusView.as_view(), name='update-ultrasound-order-status'),
    
    # Ultrasound Scans
    path('scans/', views.UltrasoundScanListView.as_view(), name='ultrasound-scan-list'),
    path('scans/<int:id>/', views.UltrasoundScanDetailView.as_view(), name='ultrasound-scan-detail'),
    path('scans/completed/', views.CompletedUltrasoundScansView.as_view(), name='completed-ultrasound-scans'),
    path('scans/<int:id>/verify/', views.VerifyUltrasoundScanView.as_view(), name='verify-ultrasound-scan'),
    path('scans/<int:id>/complete/', views.CompleteScanView.as_view(), name='complete-ultrasound-scan'),
    
    # Ultrasound Images
    path('images/', views.UltrasoundImageListView.as_view(), name='ultrasound-image-list'),
    path('images/<int:id>/', views.UltrasoundImageDetailView.as_view(), name='ultrasound-image-detail'),
    
    # Equipment
    path('equipment/', views.UltrasoundEquipmentListView.as_view(), name='ultrasound-equipment-list'),
    path('equipment/<int:id>/', views.UltrasoundEquipmentDetailView.as_view(), name='ultrasound-equipment-detail'),
    
    # Statistics & Dashboard
    path('stats/', views.ultrasound_stats, name='ultrasound-stats'),
    path('worklist/', views.ultrasound_worklist, name='ultrasound-worklist'),
    path('patient/<int:patient_id>/history/', views.patient_ultrasound_history, name='patient-ultrasound-history'),
]
