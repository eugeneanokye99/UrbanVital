from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryListCreateView.as_view(), name='inventory-list'),
    path('<int:pk>/', views.InventoryDetailView.as_view(), name='inventory-detail'),
    path('pharmacy/', views.pharmacy_items, name='pharmacy-items'),
    path('lab/', views.lab_items, name='lab-items'),
    path('stats/', views.inventory_stats, name='inventory-stats'),
    
    # Adjustments/Returns
    path('adjustments/', views.InventoryAdjustmentListCreateView.as_view(), name='adjustment-list'),
    path('adjustments/<int:pk>/', views.InventoryAdjustmentDetailView.as_view(), name='adjustment-detail'),
    path('adjustments/<int:pk>/approve/', views.approve_adjustment, name='approve-adjustment'),
]