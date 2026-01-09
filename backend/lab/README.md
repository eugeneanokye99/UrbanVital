# Lab Module API Documentation

## Overview
The Lab module backend has been successfully implemented and connected to the frontend. All endpoints follow RESTful conventions and include proper authentication, error handling, and empty-state responses.

## Base URL
```
http://127.0.0.1:8000/api/lab/
```

## Available Endpoints

### Lab Tests (Catalog)
- `GET /api/lab/tests/` - List all lab tests (filtered by active by default)
- `GET /api/lab/tests/{id}/` - Get single lab test details
- `POST /api/lab/tests/` - Create new lab test
- `PATCH /api/lab/tests/{id}/` - Update lab test
- `DELETE /api/lab/tests/{id}/` - Delete lab test

**Query Parameters:**
- `category` - Filter by test category
- `is_active` - Filter by active status
- `search` - Search by name or code

### Lab Orders
- `GET /api/lab/orders/` - List all lab orders
- `GET /api/lab/orders/{id}/` - Get single lab order details
- `POST /api/lab/orders/` - Create new lab order
- `PATCH /api/lab/orders/{id}/` - Update lab order
- `DELETE /api/lab/orders/{id}/` - Delete lab order

**Query Parameters:**
- `status` - Filter by status (Pending, Sample Collected, In Progress, Completed, Cancelled)
- `urgency` - Filter by urgency (Normal, Urgent, Emergency)
- `patient_id` - Filter by patient ID
- `search` - Search by patient name, MRN, or clinical indication
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)

### Lab Order Actions
- `POST /api/lab/orders/{order_id}/collect-sample/` - Mark sample as collected
- `POST /api/lab/orders/{order_id}/start-processing/` - Start processing order
- `POST /api/lab/orders/{order_id}/cancel/` - Cancel order

### Lab Worklist
- `GET /api/lab/worklist/` - Get worklist with categorized orders

**Response Structure:**
```json
{
  "pending_orders": [],
  "sample_collected": [],
  "in_progress": []
}
```

### Lab Results
- `GET /api/lab/results/` - List all lab results
- `GET /api/lab/results/{id}/` - Get single lab result details
- `GET /api/lab/results/by-order/{order_id}/` - Get result by order ID
- `POST /api/lab/results/` - Create new lab result
- `PATCH /api/lab/results/{id}/` - Update lab result
- `DELETE /api/lab/results/{id}/` - Delete lab result

**Query Parameters:**
- `status` - Filter by status (Preliminary, Final, Corrected, Cancelled)
- `patient_id` - Filter by patient ID
- `search` - Search by patient name, MRN, or order ID
- `date_from` - Filter from date
- `date_to` - Filter to date

### Lab Result Actions
- `POST /api/lab/results/{result_id}/verify/` - Verify lab result (marks as Final)

### Lab Statistics
- `GET /api/lab/statistics/` - Get dashboard statistics

**Response Structure:**
```json
{
  "orders_today": 0,
  "pending_count": 0,
  "sample_collected_count": 0,
  "in_progress_count": 0,
  "completed_today": 0,
  "total_completed": 0
}
```

## Database Models

### LabTest
Catalog of available lab tests with:
- Name, code, category
- Sample type, turnaround time
- Normal ranges
- Active status

### LabOrder
Patient lab orders with:
- Patient reference
- Urgency level
- Clinical indication
- Status tracking
- Sample collection info
- Processing info

### LabOrderTest
Junction table linking orders to specific tests

### LabResult
Test results with:
- Results data (JSON)
- Interpretation
- Abnormal flags
- Verification status

## Frontend Integration

All API functions are available in `frontend/src/services/api.tsx`:

### Main Functions:
- `fetchLabStats()` - Dashboard statistics
- `fetchLabWorklist()` - Worklist data
- `fetchLabTests()` - Test catalog
- `createLabOrder()` - Create order
- `collectLabSample()` - Collect sample
- `startLabProcessing()` - Start processing
- `createLabResult()` - Submit results
- `verifyLabResult()` - Verify results

## Seed Data

23 common lab tests have been pre-populated:
- Hematology: FBC, Blood Grouping, Sickling Test, etc.
- Biochemistry: Lipid Panel, LFT, KFT, FBS, RBS
- Parasitology: Malaria tests
- Microbiology: Urine/Stool exams
- Serology: Typhoid, H. Pylori, Hepatitis B, VDRL, etc.
- Immunology: HIV, Pregnancy Test, Gonorrhea

## Empty State Handling

All endpoints return proper empty responses:
- Lists return empty arrays `[]`
- Worklist returns empty arrays for each category
- Statistics return zero counts
- No `null` values that could break frontend

## Authentication

All endpoints require JWT authentication via Bearer token in Authorization header.

## Cache Management

Frontend caching implemented for:
- Lab statistics (5 minutes)
- Worklist (fresh on each request)
- Automatic cache invalidation on create/update operations
