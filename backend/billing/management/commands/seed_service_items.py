# billing/management/commands/seed_service_items.py
from django.core.management.base import BaseCommand
from billing.models import ServiceItem

class Command(BaseCommand):
    help = 'Seeds the database with sample service items for billing'

    def handle(self, *args, **kwargs):
        service_items = [
            # Consultations
            {
                'code': 'CONS-001',
                'name': 'General Consultation',
                'description': 'Standard doctor consultation',
                'category': 'Consultation',
                'price': 100.00,
                'cost_price': 50.00
            },
            {
                'code': 'CONS-002',
                'name': 'Specialist Consultation',
                'description': 'Consultation with a specialist',
                'category': 'Consultation',
                'price': 200.00,
                'cost_price': 100.00
            },
            {
                'code': 'CONS-003',
                'name': 'Follow-up Visit',
                'description': 'Follow-up consultation',
                'category': 'Consultation',
                'price': 50.00,
                'cost_price': 25.00
            },
            
            # Laboratory Tests
            {
                'code': 'LAB-001',
                'name': 'Complete Blood Count (CBC)',
                'description': 'Full blood count analysis',
                'category': 'Laboratory',
                'price': 80.00,
                'cost_price': 30.00
            },
            {
                'code': 'LAB-002',
                'name': 'Blood Sugar Test',
                'description': 'Fasting blood sugar',
                'category': 'Laboratory',
                'price': 40.00,
                'cost_price': 15.00
            },
            {
                'code': 'LAB-003',
                'name': 'Malaria Test',
                'description': 'Rapid diagnostic test for malaria',
                'category': 'Laboratory',
                'price': 30.00,
                'cost_price': 10.00
            },
            {
                'code': 'LAB-004',
                'name': 'Lipid Profile',
                'description': 'Cholesterol and triglycerides',
                'category': 'Laboratory',
                'price': 120.00,
                'cost_price': 50.00
            },
            {
                'code': 'LAB-005',
                'name': 'Urine Analysis',
                'description': 'Complete urine examination',
                'category': 'Laboratory',
                'price': 50.00,
                'cost_price': 20.00
            },
            
            # Pharmacy (Common medications)
            {
                'code': 'PHARM-001',
                'name': 'Paracetamol 500mg',
                'description': 'Pain relief and fever reducer (per tablet)',
                'category': 'Pharmacy',
                'price': 0.50,
                'cost_price': 0.20
            },
            {
                'code': 'PHARM-002',
                'name': 'Amoxicillin 500mg',
                'description': 'Antibiotic (per capsule)',
                'category': 'Pharmacy',
                'price': 2.00,
                'cost_price': 1.00
            },
            {
                'code': 'PHARM-003',
                'name': 'Vitamin B Complex',
                'description': 'Multivitamin supplement (per tablet)',
                'category': 'Pharmacy',
                'price': 1.50,
                'cost_price': 0.75
            },
            
            # Procedures
            {
                'code': 'PROC-001',
                'name': 'Wound Dressing',
                'description': 'Simple wound cleaning and dressing',
                'category': 'Procedure',
                'price': 60.00,
                'cost_price': 20.00
            },
            {
                'code': 'PROC-002',
                'name': 'IV Injection',
                'description': 'Intravenous injection administration',
                'category': 'Procedure',
                'price': 40.00,
                'cost_price': 15.00
            },
            {
                'code': 'PROC-003',
                'name': 'Blood Pressure Check',
                'description': 'Vital signs monitoring',
                'category': 'Procedure',
                'price': 20.00,
                'cost_price': 5.00
            },
            
            # Radiology
            {
                'code': 'RAD-001',
                'name': 'X-Ray (Single View)',
                'description': 'Single view X-ray imaging',
                'category': 'Radiology',
                'price': 150.00,
                'cost_price': 60.00
            },
            {
                'code': 'RAD-002',
                'name': 'Ultrasound Scan',
                'description': 'General ultrasound examination',
                'category': 'Radiology',
                'price': 250.00,
                'cost_price': 100.00
            },
        ]

        created_count = 0
        updated_count = 0

        for item_data in service_items:
            service_item, created = ServiceItem.objects.update_or_create(
                code=item_data['code'],
                defaults={
                    'name': item_data['name'],
                    'description': item_data['description'],
                    'category': item_data['category'],
                    'price': item_data['price'],
                    'cost_price': item_data['cost_price'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {service_item.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'↻ Updated: {service_item.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Seeding complete!'))
        self.stdout.write(self.style.SUCCESS(f'   Created: {created_count} service items'))
        self.stdout.write(self.style.SUCCESS(f'   Updated: {updated_count} service items'))
        self.stdout.write(self.style.SUCCESS(f'   Total: {created_count + updated_count} service items'))
