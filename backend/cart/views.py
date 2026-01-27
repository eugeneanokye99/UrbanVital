from datetime import timezone
from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Cart, CartItem
from .serializers import (
    CartSerializer, 
    AddItemSerializer, 
    CheckoutSerializer,
    CartItemSerializer
)
from inventory.models import Inventory

class CartView(views.APIView):
    """Cart management view"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get active cart or create new one"""
        cart = Cart.objects.filter(
            created_by=request.user,
            is_active=True,
            is_checked_out=False
        ).first()
        
        if not cart:
            cart = Cart.objects.create(created_by=request.user)
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new cart"""
        cart = Cart.objects.create(
            created_by=request.user,
            patient_id=request.data.get('patient_id'),
            patient_name=request.data.get('patient_name', '')
        )
        from notifications.audit import log_action
        log_action(request.user, "create", f"Created cart: {cart.cart_id}", {"cart_id": cart.cart_id})
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CartDetailView(views.APIView):
    """Cart detail view"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, cart_id):
        """Get cart details"""
        cart = get_object_or_404(Cart, cart_id=cart_id, created_by=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddItemView(views.APIView):
    """Add item to cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, cart_id):
        cart = get_object_or_404(Cart, cart_id=cart_id, created_by=request.user)
        
        serializer = AddItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        inventory_item = data['inventory_item']
        quantity = data['quantity']
        
        # Check if item already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            inventory_item=inventory_item,
            defaults={
                'quantity': quantity,
                'unit_price': inventory_item.selling_price
            }
        )
        
        if not created:
            # Update existing item
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateItemView(views.APIView):
    """Update cart item quantity"""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, cart_id, item_id):
        cart = get_object_or_404(Cart, cart_id=cart_id, created_by=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        
        quantity = request.data.get('quantity')
        if quantity is None:
            return Response({'error': 'Quantity is required'}, status=400)
        
        if quantity < 1:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        return Response(CartItemSerializer(cart_item).data)


class RemoveItemView(views.APIView):
    """Remove item from cart"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, cart_id, item_id):
        cart = get_object_or_404(Cart, cart_id=cart_id, created_by=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        from notifications.audit import log_action
        log_action(request.user, "delete", f"Removed item {cart_item.inventory_item.name} from cart {cart.cart_id}", {"cart_id": cart.cart_id, "item_id": cart_item.inventory_item.id})
        cart_item.delete()
        return Response({'message': 'Item removed'})


class CheckoutView(views.APIView):
    """Checkout cart"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, cart_id):
        cart = get_object_or_404(Cart, cart_id=cart_id, created_by=request.user)
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        # Update cart info
        if data.get('patient_id'):
            cart.patient_id = data['patient_id']
        if data.get('patient_name'):
            cart.patient_name = data['patient_name']
        # Update inventory and mark as checked out
        with transaction.atomic():
            for item in cart.items.all():
                item.update_inventory()
            cart.is_checked_out = True
            cart.is_active = False
            cart.checked_out_at = timezone.now()
            cart.save()
        from notifications.audit import log_action
        log_action(request.user, "update", f"Checked out cart: {cart.cart_id}", {"cart_id": cart.cart_id})
        serializer = CartSerializer(cart)
        return Response({
            'message': 'Checkout successful',
            'cart': serializer.data,
        })