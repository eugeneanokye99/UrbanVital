from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryListCreateView.as_view(), name='inventory-list'),
    path('<int:pk>/', views.InventoryDetailView.as_view(), name='inventory-detail'),
    path('pharmacy/', views.pharmacy_items, name='pharmacy-items'),
    path('lab/', views.lab_items, name='lab-items'),
    path('stats/', views.inventory_stats, name='inventory-stats'),
]