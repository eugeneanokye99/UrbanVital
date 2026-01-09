"""
Management command to seed Lab inventory items
Usage: python manage.py seed_lab_inventory
"""
from django.core.management.base import BaseCommand
from inventory.models import Inventory
from django.contrib.auth import get_user_model
from datetime import date, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed Lab inventory with common reagents and consumables'

    def handle(self, *args, **kwargs):
        # Get or create admin user for created_by
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.create_superuser(
                username='admin',
                email='admin@urbanvital.com',
                password='admin123'
            )

        lab_items = [
            {
                'name': 'Malaria RDT Kits',
                'department': 'LAB',
                'current_stock': 50,
                'minimum_stock': 10,
                'unit_of_measure': 'KIT',
                'selling_price': 5.00,
                'expiry_date': date.today() + timedelta(days=365),
            },
            {
                'name': 'FBC Reagent (Diluent)',
                'department': 'LAB',
                'current_stock': 5,
                'minimum_stock': 10,
                'unit_of_measure': 'BTL',
                'selling_price': 150.00,
                'expiry_date': date.today() + timedelta(days=400),
            },
            {
                'name': 'Urine Containers (Sterile)',
                'department': 'LAB',
                'current_stock': 500,
                'minimum_stock': 100,
                'unit_of_measure': 'PCS',
                'selling_price': 0.50,
                'expiry_date': None,  # No expiry
            },
            {
                'name': 'Blood Collection Tubes (EDTA)',
                'department': 'LAB',
                'current_stock': 200,
                'minimum_stock': 50,
                'unit_of_measure': 'PCS',
                'selling_price': 1.00,
                'expiry_date': date.today() + timedelta(days=730),
            },
            {
                'name': 'Glucose Test Strips',
                'department': 'LAB',
                'current_stock': 3,
                'minimum_stock': 20,
                'unit_of_measure': 'BOX',
                'selling_price': 25.00,
                'expiry_date': date.today() + timedelta(days=180),
            },
            {
                'name': 'HBsAg Rapid Test Kits',
                'department': 'LAB',
                'current_stock': 30,
                'minimum_stock': 15,
                'unit_of_measure': 'KIT',
                'selling_price': 8.00,
                'expiry_date': date.today() + timedelta(days=300),
            },
            {
                'name': 'HIV Rapid Test Kits',
                'department': 'LAB',
                'current_stock': 0,
                'minimum_stock': 20,
                'unit_of_measure': 'KIT',
                'selling_price': 10.00,
                'expiry_date': date.today() + timedelta(days=250),
            },
            {
                'name': 'Stool Sample Containers',
                'department': 'LAB',
                'current_stock': 150,
                'minimum_stock': 50,
                'unit_of_measure': 'PCS',
                'selling_price': 0.75,
                'expiry_date': None,
            },
            {
                'name': 'Microscope Slides (Plain)',
                'department': 'LAB',
                'current_stock': 300,
                'minimum_stock': 100,
                'unit_of_measure': 'PCS',
                'selling_price': 0.25,
                'expiry_date': None,
            },
            {
                'name': 'Cover Slips',
                'department': 'LAB',
                'current_stock': 400,
                'minimum_stock': 100,
                'unit_of_measure': 'PCS',
                'selling_price': 0.10,
                'expiry_date': None,
            },
            {
                'name': 'Giemsa Stain Solution',
                'department': 'LAB',
                'current_stock': 10,
                'minimum_stock': 5,
                'unit_of_measure': 'BTL',
                'selling_price': 30.00,
                'expiry_date': date.today() + timedelta(days=500),
            },
            {
                'name': 'Alcohol Swabs (70%)',
                'department': 'LAB',
                'current_stock': 1000,
                'minimum_stock': 200,
                'unit_of_measure': 'PCS',
                'selling_price': 0.15,
                'expiry_date': date.today() + timedelta(days=900),
            },
        ]

        created_count = 0
        updated_count = 0

        for item_data in lab_items:
            # Check if item already exists by name
            existing = Inventory.objects.filter(
                name=item_data['name'],
                department='LAB'
            ).first()

            if existing:
                # Update existing item
                for key, value in item_data.items():
                    setattr(existing, key, value)
                existing.save()
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"Updated: {item_data['name']}"))
            else:
                # Create new item
                Inventory.objects.create(
                    **item_data,
                    created_by=admin_user,
                    is_active=True
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {item_data['name']}"))

        self.stdout.write(self.style.SUCCESS(
            f"\n✅ Lab Inventory Seeded: {created_count} created, {updated_count} updated"
        ))
