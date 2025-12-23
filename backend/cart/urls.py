from django.urls import path
from .views import (
    CartView,
    CartDetailView,
    AddItemView,
    UpdateItemView,
    RemoveItemView,
    CheckoutView
)

urlpatterns = [
    path('', CartView.as_view(), name='cart-active'),
    path('create/', CartView.as_view(), name='cart-create'),
    path('<str:cart_id>/', CartDetailView.as_view(), name='cart-detail'),
    path('<str:cart_id>/add-item/', AddItemView.as_view(), name='add-item'),
    path('<str:cart_id>/items/<int:item_id>/', UpdateItemView.as_view(), name='update-item'),
    path('<str:cart_id>/items/<int:item_id>/remove/', RemoveItemView.as_view(), name='remove-item'),
    path('<str:cart_id>/checkout/', CheckoutView.as_view(), name='checkout'),
]