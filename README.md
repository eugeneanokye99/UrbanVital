# 🏥 UrbanVital Health Consult Web App

**UrbanVital** is a clinical operations platform that unifies **Consulting**, **Laboratory**, **Ultrasound**, **Pharmacy**, and **Billing** workflows in a single system.  
It’s designed to run reliably even with spotty internet, reduce operational errors, and streamline daily clinic tasks.

---

## 🚀 Overview

UrbanVital simplifies and connects all internal healthcare operations:

- Patient registration and record management  
- Consultations with lab, ultrasound, and prescription ordering  
- Laboratory result tracking and PDF report generation  
- Ultrasound study management with image uploads  
- Pharmacy inventory and dispensing with expiry tracking  
- Unified billing and payment processing  
- Analytics dashboards for productivity and performance tracking  

**Phase 1:** Internal staff use only  
**Phase 2:** Patient-facing portal (bookings, payments, online results)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite + TypeScript |
| State Management | Zustand / Redux Toolkit |
| Styling | Tailwind CSS  |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (Simple JWT) |
| Reporting | WeasyPrint / wkhtmltopdf |
| File Storage | Local or MinIO (S3-compatible) |
| Notifications | Hubtel SMS + SMTP (SendGrid / Mailgun) |

---

## 🔐 User Roles

| Role | Description |
|------|--------------|
| **Admin** | Full access; manage users, roles, configuration |
| **Clinician / PA** | Conduct consultations, order labs/ultrasound, prescribe drugs |
| **Lab Scientist** | Manage lab orders, enter and sign results |
| **Ultrasound Sonographer** | Perform studies, upload images, sign reports |
| **Pharmacist** | Manage stock, dispensing, sales tracking |
| **Cashier / Front Desk** | Register patients, billing, payments |
| **Owner** | Read-only analytics and reports |

---

## 🧩 Core Modules

- **Patient Registry:** Create/search patients, MRN auto-generation, attach files  
- **Consulting:** SOAP notes, vitals, orders, printable prescriptions  
- **Laboratory:** Worklist, barcode samples, result templates, sign-off workflow  
- **Ultrasound:** Structured report templates with image uploads  
- **Pharmacy:** Stock management, batch/expiry control, dispensing interface  
- **Billing:** Unified invoice with discounts and multi-method payments  
- **Analytics:** Real-time dashboards, CSV/XLS export  

---

## ⚙️ Local Development Setup

### 1️⃣ Backend Setup (Django + PostgreSQL)

```bash
# Clone the repo and navigate into it
git clone https://github.com/yourusername/urbanvital-backend.git
cd urbanvital-backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary python-dotenv django-cors-headers

# Apply migrations and start the server
python manage.py migrate
python manage.py runserver
````

### 2️⃣ Frontend Setup (React + Vite + TypeScript)

```bash
# From project root
npm create vite@latest frontend
cd frontend

# Install dependencies
npm install axios react-router-dom tailwindcss @tanstack/react-query

# Run development server
npm run dev
```

Your frontend should now run on **[http://localhost:5173](http://localhost:5173)** and backend on **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 🗓️ 6-Week Development Plan

| Week  | Focus                   | Deliverables                                               |
| ----- | ----------------------- | ---------------------------------------------------------- |
| **1** | Setup & Auth            | Django + React skeleton, JWT signup/login, role management |
| **2** | Patient Registry        | CRUD operations, search, MRN auto-generation               |
| **3** | Consulting Module       | SOAP form, orders, prescription print                      |
| **4** | Laboratory & Ultrasound | Worklist, results entry, reports (PDF)                     |
| **5** | Pharmacy & Billing      | Inventory, dispensing, unified invoice                     |
| **6** | Dashboard & Deployment  | Analytics, testing, optimization, deploy                   |

---

## 🧪 Testing

* **Backend:** `pytest` for unit and integration tests
* **Frontend:** `vitest` or `jest` for component and API testing
* Postman collections for API testing

---

## 🔒 Security

* JWT authentication with refresh tokens
* HTTPS (TLS) for all endpoints
* Role-based permissions
* Encrypted backups (PostgreSQL dump + offsite storage)

---

## 🧑‍💻 Contributors

| Name                 | Role           | Responsibility                     |
| -------------------- | -------------- | ---------------------------------- |
| Eugene Anokye        | Lead Developer | Backend, API Integration           |
| Felix Adu Korankye   | Frontend Dev   | Frontend                           |
| William              | Designer       | UI/UX Designer                     |

---

## 📜 License

MIT License © 2025 UrbanVital Development Team

