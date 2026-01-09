# ultrasound/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from patients.models import Patient
from .models import UltrasoundOrder, UltrasoundScan, UltrasoundEquipment


class UltrasoundOrderTestCase(APITestCase):
    """Test cases for ultrasound orders"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(username='testdoctor', password='testpass123')
        self.client.force_authenticate(user=self.user)
        
        # Create test patient
        self.patient = Patient.objects.create(
            name='Test Patient',
            first_name='Test',
            last_name='Patient',
            mrn='TEST-001',
            date_of_birth='1990-01-01',
            gender='Male',
            phone='1234567890'
        )
    
    def test_create_ultrasound_order(self):
        """Test creating an ultrasound order"""
        data = {
            'patient': self.patient.id,
            'scan_type': 'Abdominal',
            'urgency': 'Normal',
            'clinical_indication': 'Abdominal pain',
        }
        response = self.client.post('/api/ultrasound/orders/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UltrasoundOrder.objects.count(), 1)
        order = UltrasoundOrder.objects.first()
        self.assertEqual(order.ordered_by, self.user)
    
    def test_list_ultrasound_orders(self):
        """Test listing ultrasound orders"""
        UltrasoundOrder.objects.create(
            patient=self.patient,
            ordered_by=self.user,
            scan_type='Pelvic',
            urgency='Urgent',
            clinical_indication='Test indication'
        )
        response = self.client.get('/api/ultrasound/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class UltrasoundScanTestCase(APITestCase):
    """Test cases for ultrasound scans"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(username='sonographer', password='testpass123')
        self.client.force_authenticate(user=self.user)
        
        # Create test patient
        self.patient = Patient.objects.create(
            name='Test Patient',
            first_name='Test',
            last_name='Patient',
            mrn='TEST-001',
            date_of_birth='1990-01-01',
            gender='Female',
            phone='1234567890'
        )
        
        # Create test order
        self.order = UltrasoundOrder.objects.create(
            patient=self.patient,
            ordered_by=self.user,
            scan_type='Obstetric (2nd Trimester)',
            urgency='Normal',
            clinical_indication='Routine antenatal scan'
        )
    
    def test_create_ultrasound_scan(self):
        """Test creating an ultrasound scan"""
        data = {
            'order': self.order.id,
            'patient': self.patient.id,
            'scan_type': 'Obstetric (2nd Trimester)',
            'clinical_indication': 'Routine antenatal scan',
            'findings': 'Single intrauterine pregnancy...',
            'impression': 'Normal 20-week scan',
        }
        response = self.client.post('/api/ultrasound/scans/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UltrasoundScan.objects.count(), 1)
        scan = UltrasoundScan.objects.first()
        self.assertEqual(scan.performed_by, self.user)
        self.assertIsNotNone(scan.scan_number)


class UltrasoundEquipmentTestCase(APITestCase):
    """Test cases for ultrasound equipment"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='testpass123')
        self.client.force_authenticate(user=self.user)
    
    def test_create_equipment(self):
        """Test creating equipment"""
        data = {
            'name': 'GE Voluson E10',
            'model': 'E10',
            'serial_number': 'GE-12345',
            'manufacturer': 'GE Healthcare',
            'status': 'Operational',
            'location': 'Room 101'
        }
        response = self.client.post('/api/ultrasound/equipment/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(UltrasoundEquipment.objects.count(), 1)
