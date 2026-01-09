# Ultrasound Module - Backend API Documentation

## Overview
The ultrasound module provides comprehensive backend functionality for managing ultrasound orders, scans, reports, images, and equipment in the UrbanVital healthcare system.

## Models

### 1. UltrasoundOrder
Represents orders for ultrasound scans placed by clinicians.

**Fields:**
- `patient`: ForeignKey to Patient
- `visit`: ForeignKey to Visit (optional)
- `ordered_by`: ForeignKey to User (clinician)
- `scan_type`: Choice field (Obstetric, Abdominal, Pelvic, etc.)
- `urgency`: Normal, Urgent, Emergency
- `clinical_indication`: Text describing reason for scan
- `special_instructions`: Optional additional instructions
- `status`: Pending, Scheduled, In Progress, Completed, Cancelled
- `scheduled_date`: Optional scheduled datetime
- Timestamps: `ordered_at`, `updated_at`

### 2. UltrasoundScan
Represents the actual scan performed and report generated.

**Fields:**
- `order`: OneToOne relationship to UltrasoundOrder
- `patient`: ForeignKey to Patient
- `performed_by`: ForeignKey to User (sonographer)
- `verified_by`: ForeignKey to User (optional, for verification)
- `scan_number`: Auto-generated unique identifier (USG-YYYYMM-XXXX)
- `scan_type`: Type of scan performed
- `machine_used`: Equipment used
- `clinical_indication`: Clinical indication
- `lmp`: Last Menstrual Period (for obstetric scans)
- `gestational_age`: e.g., "12 weeks 3 days"
- `technique`: Scan technique description
- `findings`: Detailed ultrasound findings
- `measurements`: JSONField for structured data
- `impression`: Conclusion/diagnosis
- `recommendations`: Follow-up recommendations
- `status`: Draft, In Progress, Completed, Verified, Cancelled
- Timestamps: `scan_started_at`, `scan_completed_at`, `verified_at`, `created_at`, `updated_at`

### 3. UltrasoundImage
Stores images/attachments for scans.

**Fields:**
- `scan`: ForeignKey to UltrasoundScan
- `image`: ImageField (uploaded file)
- `image_url`: Optional external URL
- `image_type`: e.g., Sagittal, Transverse
- `description`: Optional description
- `uploaded_at`: Timestamp

### 4. UltrasoundEquipment
Tracks equipment/machines in the ultrasound unit.

**Fields:**
- `name`: Equipment name
- `model`, `serial_number`, `manufacturer`: Equipment details
- `status`: Operational, Maintenance, Offline, Decommissioned
- `location`: Physical location
- `purchase_date`, `last_maintenance_date`, `next_maintenance_date`
- `notes`: Additional notes

---

## API Endpoints

### Authentication
All endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

### Ultrasound Orders

#### 1. List / Create Orders
**Endpoint:** `GET/POST /api/ultrasound/orders/`

**GET - Query Parameters:**
- `status`: Filter by status (Pending, Scheduled, etc.)
- `urgency`: Filter by urgency
- `patient_id`: Filter by patient
- `date_from`, `date_to`: Date range filters
- `search`: Search patient name, MRN, scan type

**POST - Request Body:**
```json
{
  "patient": 1,
  "visit": 5,
  "scan_type": "Obstetric (2nd Trimester)",
  "urgency": "Normal",
  "clinical_indication": "Routine antenatal screening",
  "special_instructions": "Patient has latex allergy"
}
```

**Response:**
```json
{
  "id": 1,
  "patient": 1,
  "patient_name": "Ama Kyei",
  "patient_mrn": "UV-2025-01",
  "scan_type": "Obstetric (2nd Trimester)",
  "urgency": "Normal",
  "status": "Pending",
  "ordered_by_name": "Dr. Mensah",
  "ordered_at": "2026-01-09T10:30:00Z"
}
```

#### 2. Get Order Details
**Endpoint:** `GET /api/ultrasound/orders/<id>/`

#### 3. Update Order
**Endpoint:** `PUT/PATCH /api/ultrasound/orders/<id>/`

#### 4. Delete Order
**Endpoint:** `DELETE /api/ultrasound/orders/<id>/`

#### 5. Pending Orders (Worklist)
**Endpoint:** `GET /api/ultrasound/orders/pending/`

Returns all pending and scheduled orders for the worklist.

#### 6. Update Order Status
**Endpoint:** `POST /api/ultrasound/orders/<id>/status/`

**Request Body:**
```json
{
  "status": "Scheduled",
  "scheduled_date": "2026-01-10T14:00:00Z"
}
```

---

### Ultrasound Scans

#### 1. List / Create Scans
**Endpoint:** `GET/POST /api/ultrasound/scans/`

**GET - Query Parameters:**
- `status`: Filter by status
- `patient_id`: Filter by patient
- `date_from`, `date_to`: Date range
- `search`: Search scan number, patient name, MRN

**POST - Request Body:**
```json
{
  "order": 1,
  "patient": 1,
  "scan_type": "Obstetric (2nd Trimester)",
  "machine_used": "GE Voluson E10",
  "clinical_indication": "Routine antenatal",
  "lmp": "2025-09-15",
  "gestational_age": "20 weeks 3 days",
  "technique": "Transabdominal ultrasound performed",
  "findings": "Single viable intrauterine pregnancy. Fetal biometry consistent with dates. Normal anatomy scan. Placenta posterior, grade 0. Adequate liquor volume.",
  "measurements": {
    "BPD": "47mm",
    "HC": "178mm",
    "AC": "156mm",
    "FL": "32mm",
    "EFW": "320g"
  },
  "impression": "Normal 20-week anomaly scan. Single viable pregnancy.",
  "recommendations": "Routine antenatal follow-up",
  "status": "Draft"
}
```

**Response:**
```json
{
  "id": 1,
  "scan_number": "USG-202601-0001",
  "patient_name": "Ama Kyei",
  "scan_type": "Obstetric (2nd Trimester)",
  "status": "Draft",
  "performed_by_name": "Sonographer James",
  "created_at": "2026-01-09T11:00:00Z"
}
```

#### 2. Get Scan Details
**Endpoint:** `GET /api/ultrasound/scans/<id>/`

Returns full scan details including images.

#### 3. Update Scan
**Endpoint:** `PUT/PATCH /api/ultrasound/scans/<id>/`

#### 4. Delete Scan
**Endpoint:** `DELETE /api/ultrasound/scans/<id>/`

#### 5. Completed Scans
**Endpoint:** `GET /api/ultrasound/scans/completed/`

Returns all completed and verified scans.

#### 6. Complete Scan
**Endpoint:** `POST /api/ultrasound/scans/<id>/complete/`

Marks a scan as completed and sets completion timestamp.

#### 7. Verify Scan
**Endpoint:** `POST /api/ultrasound/scans/<id>/verify/`

Verifies a completed scan (typically by senior sonographer).

---

### Ultrasound Images

#### 1. List / Upload Images
**Endpoint:** `GET/POST /api/ultrasound/images/`

**GET - Query Parameters:**
- `scan_id`: Filter images by scan

**POST - Request Body (multipart/form-data):**
```
scan: 1
image: [file]
image_type: "Sagittal"
description: "Sagittal view of fetus"
```

#### 2. Image Details
**Endpoint:** `GET /api/ultrasound/images/<id>/`

#### 3. Update/Delete Image
**Endpoint:** `PUT/PATCH/DELETE /api/ultrasound/images/<id>/`

---

### Equipment Management

#### 1. List / Create Equipment
**Endpoint:** `GET/POST /api/ultrasound/equipment/`

**POST - Request Body:**
```json
{
  "name": "GE Voluson E10",
  "model": "E10",
  "serial_number": "GE-12345",
  "manufacturer": "GE Healthcare",
  "status": "Operational",
  "location": "Ultrasound Room 1",
  "purchase_date": "2023-01-15",
  "last_maintenance_date": "2025-12-01",
  "next_maintenance_date": "2026-06-01"
}
```

#### 2. Equipment Details
**Endpoint:** `GET/PUT/PATCH/DELETE /api/ultrasound/equipment/<id>/`

---

### Statistics & Dashboard

#### 1. Ultrasound Statistics
**Endpoint:** `GET /api/ultrasound/stats/`

**Response:**
```json
{
  "today_scans": 5,
  "pending_orders": 8,
  "in_progress": 2,
  "completed_today": 12,
  "order_status_stats": {
    "Pending": 5,
    "Scheduled": 3,
    "In Progress": 2,
    "Completed": 45,
    "Cancelled": 1
  },
  "scan_type_stats": [
    {"scan_type": "Obstetric (2nd Trimester)", "count": 15},
    {"scan_type": "Abdominal", "count": 10}
  ],
  "weekly_data": [
    {"day": "Mon", "date": "2026-01-03", "scans": 8},
    {"day": "Tue", "date": "2026-01-04", "scans": 12}
  ],
  "equipment_stats": {
    "Operational": 3,
    "Maintenance": 1,
    "Offline": 0
  },
  "recent_completed": [...]
}
```

#### 2. Worklist View
**Endpoint:** `GET /api/ultrasound/worklist/`

Returns pending orders and in-progress scans.

**Response:**
```json
{
  "pending_orders": [...],
  "in_progress_scans": [...]
}
```

#### 3. Patient Ultrasound History
**Endpoint:** `GET /api/ultrasound/patient/<patient_id>/history/`

Returns all scans and orders for a specific patient.

---

## Permissions & Role-Based Access

All endpoints require authentication (`IsAuthenticated` permission).

**Typical Roles:**
- **Clinician**: Can create orders
- **Ultrasound Staff**: Can view orders, create/edit scans, upload images
- **Admin**: Full access to all endpoints

---

## Integration with Existing Modules

### With Patients Module
- UltrasoundOrder and UltrasoundScan link to `Patient` model
- Patient history includes ultrasound records

### With Visits Module
- Orders can be linked to specific visits
- Supports visit workflow integration

### With Billing Module
- Scan types can be linked to billable service items
- Completed scans can generate billing entries

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Missing/invalid token
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "error": "Detailed error message",
  "field_name": ["Field-specific error"]
}
```

---

## Testing

Run tests with:
```bash
python manage.py test ultrasound
```

---

## Setup Instructions

1. **Add to INSTALLED_APPS** (already done):
```python
INSTALLED_APPS = [
    # ...
    'ultrasound',
]
```

2. **Include URLs** (already done):
```python
urlpatterns = [
    # ...
    path('api/ultrasound/', include('ultrasound.urls')),
]
```

3. **Run migrations**:
```bash
python manage.py makemigrations ultrasound
python manage.py migrate ultrasound
```

4. **Create superuser** (if not exists):
```bash
python manage.py createsuperuser
```

5. **Access Admin Panel**:
Visit `http://localhost:8000/admin/` to manage ultrasound data.

---

## Future Enhancements

- DICOM image support
- HL7/FHIR integration
- Advanced reporting templates
- Real-time collaboration features
- Mobile app integration
- Automated measurements using AI

---

## Support

For issues or questions, contact the development team.
