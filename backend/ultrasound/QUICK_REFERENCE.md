# Ultrasound API - Quick Reference Guide

## Common Use Cases

### 1. Create an Ultrasound Order (Clinician)
```bash
POST /api/ultrasound/orders/
Authorization: Bearer <token>

{
  "patient": 1,
  "scan_type": "Obstetric (2nd Trimester)",
  "urgency": "Normal",
  "clinical_indication": "Routine antenatal scan at 20 weeks"
}
```

### 2. Get Worklist (Sonographer)
```bash
GET /api/ultrasound/worklist/
Authorization: Bearer <token>
```
Returns pending orders and in-progress scans.

### 3. Start a Scan
```bash
POST /api/ultrasound/scans/
Authorization: Bearer <token>

{
  "order": 1,
  "patient": 1,
  "scan_type": "Obstetric (2nd Trimester)",
  "clinical_indication": "Routine antenatal",
  "lmp": "2025-09-15",
  "status": "In Progress"
}
```

### 4. Update Scan Findings
```bash
PATCH /api/ultrasound/scans/1/
Authorization: Bearer <token>

{
  "findings": "Single viable intrauterine pregnancy...",
  "impression": "Normal 20-week scan",
  "measurements": {
    "BPD": "47mm",
    "HC": "178mm",
    "FL": "32mm"
  }
}
```

### 5. Complete a Scan
```bash
POST /api/ultrasound/scans/1/complete/
Authorization: Bearer <token>
```

### 6. Verify a Scan (Senior Sonographer)
```bash
POST /api/ultrasound/scans/1/verify/
Authorization: Bearer <token>
```

### 7. Get Dashboard Stats
```bash
GET /api/ultrasound/stats/
Authorization: Bearer <token>
```

### 8. Search Patients' Scan History
```bash
GET /api/ultrasound/patient/5/history/
Authorization: Bearer <token>
```

### 9. Filter Orders by Status
```bash
GET /api/ultrasound/orders/?status=Pending
GET /api/ultrasound/orders/?urgency=Urgent
GET /api/ultrasound/orders/?search=Ama
```

### 10. Get Completed Scans
```bash
GET /api/ultrasound/scans/completed/
Authorization: Bearer <token>
```

## Typical Workflow

```
1. Clinician creates order
   POST /api/ultrasound/orders/

2. Sonographer views worklist
   GET /api/ultrasound/worklist/

3. Sonographer starts scan
   POST /api/ultrasound/scans/

4. Sonographer records findings
   PATCH /api/ultrasound/scans/<id>/

5. Sonographer completes scan
   POST /api/ultrasound/scans/<id>/complete/

6. Senior verifies (optional)
   POST /api/ultrasound/scans/<id>/verify/

7. Report available for review
   GET /api/ultrasound/scans/<id>/
```

## Status Transitions

### Order Status Flow
```
Pending → Scheduled → In Progress → Completed
              ↓
          Cancelled
```

### Scan Status Flow
```
Draft → In Progress → Completed → Verified
              ↓
          Cancelled
```

## Error Responses

```json
{
  "error": "Order not found"
}
```

```json
{
  "scan_type": ["This field is required."]
}
```

## Tips

1. **Always authenticate**: Include Bearer token in Authorization header
2. **Use filters**: Add query parameters to narrow results
3. **Check status**: Verify scan/order status before operations
4. **Auto-fields**: ordered_by and performed_by set automatically
5. **Unique scans**: Each order can have only one scan (OneToOne)

## Equipment Management

### Add Equipment
```bash
POST /api/ultrasound/equipment/

{
  "name": "GE Voluson E10",
  "status": "Operational",
  "location": "Room 101"
}
```

### Update Equipment Status
```bash
PATCH /api/ultrasound/equipment/1/

{
  "status": "Maintenance",
  "last_maintenance_date": "2026-01-09"
}
```

## Patient Search

Search across multiple fields:
```bash
GET /api/ultrasound/orders/?search=UV-2025-01
GET /api/ultrasound/orders/?search=Ama
GET /api/ultrasound/scans/?search=Kyei
```

## Date Filtering

```bash
GET /api/ultrasound/orders/?date_from=2026-01-01&date_to=2026-01-09
GET /api/ultrasound/scans/?date_from=2026-01-01
```

## Testing with cURL

```bash
# Get token first
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use token
curl http://localhost:8000/api/ultrasound/stats/ \
  -H "Authorization: Bearer <your_token>"
```

## Frontend Integration

```typescript
// Example API call from React
const createOrder = async (orderData) => {
  const response = await API.post('/ultrasound/orders/', orderData);
  return response.data;
};

const getWorklist = async () => {
  const response = await API.get('/ultrasound/worklist/');
  return response.data;
};

const completeScan = async (scanId) => {
  const response = await API.post(`/ultrasound/scans/${scanId}/complete/`);
  return response.data;
};
```
