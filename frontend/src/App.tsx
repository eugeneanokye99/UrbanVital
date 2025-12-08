import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- Auth & Layouts ---
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminLayout from './layouts/AdminLayout'; // Ensure this exists from previous step
import ClinicianLayout from './layouts/ClinicianLayout';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatientsList from './pages/admin/PatientsList';
import AdminStaff from './pages/admin/StaffManagement';
import AdminFinance from './pages/admin/Finance';
import AdminInventory from './pages/admin/AdminInventory';
import RegisterStaff from './pages/admin/RegisterStaff';
import AdminSettings from './pages/admin/AdminSettings';

// --- Front Desk (Staff) Pages ---
import StaffDashboard from './pages/frontdesk/StaffDashboard';
import StaffCheckIn from './pages/frontdesk/CheckIn';
import StaffPatientDetail from './pages/frontdesk/PatientDetail';
import StaffPatientsList from './pages/frontdesk/PatientsList';
import RegisterPatient from './pages/frontdesk/RegisterPatient';
import StaffBillings from './pages/frontdesk/Billings';

// --- Clinician Pages ---
import ClinicianDashboard from './pages/clinician/Dashboard';
import ClinicianPatients from './pages/clinician/Patients';
import ClinicianPatientDetails from './pages/clinician/PatientDetails';
import ClinicianConsulting from './pages/clinician/Consulting';
import ClinicianFollowUp from './pages/clinician/FollowUp';
import ClinicianBilling from './pages/clinician/Billing';
import ClinicianDocuments from './pages/clinician/Documents';
import ClinicianLabResults from './pages/clinician/ClinicianLabResults';

// --- Lab Pages ---
import LabDashboard from './pages/lab/LabDashboard';
import LabPatients from './pages/lab/LabPatients';
import LabPatientProfile from './pages/lab/LabPatientProfile';
import LabQueue from './pages/lab/LabQueue';
import LabEntry from './pages/lab/LabEntry';
import LabResults from './pages/lab/LabResults';
import LabInventory from './pages/lab/LabInventory';

// --- Pharmacy Pages ---
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyHistory from './pages/pharmacy/PharmacyHistory';
import PharmacySettings from './pages/pharmacy/PharmacySettings';

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* === Public Routes === */}
        <Route path="/" element={<Login />} />

        {/* === Admin Module (Wrapped in Layout) === */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatientsList />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="register" element={<RegisterStaff />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* === Front Desk Module === */}
        {/* TIP: Create a StaffLayout to handle sidebar/navbar responsiveness here too */}
        <Route path="/frontdesk/staffdashboard" element={<StaffDashboard />} />
        <Route path="/frontdesk/checkin" element={<StaffCheckIn />} />
        <Route path="/frontdesk/patients" element={<StaffPatientsList />} />
        <Route path="/frontdesk/patientdetail" element={<StaffPatientDetail />} />
        <Route path="/frontdesk/registerpatient" element={<ProtectedRoute><RegisterPatient /></ProtectedRoute>} />
        <Route path="/frontdesk/billings" element={<StaffBillings />} />

        {/* === Clinician Module (Wrapped in Layout) === */}
       <Route path="/clinician" element={<ClinicianLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClinicianDashboard />} />
          <Route path="patients" element={<ClinicianPatients />} />
          <Route path="patient-details" element={<ClinicianPatientDetails />} />
          <Route path="consulting" element={<ClinicianConsulting />} />
          <Route path="followup" element={<ClinicianFollowUp />} />
          <Route path="billing" element={<ClinicianBilling />} />
          <Route path="documents" element={<ClinicianDocuments />} />
          <Route path="clinicianlabresults" element={<ClinicianLabResults />} />
       </Route>

        {/* === Lab Module === */}
        <Route path="/lab/labdashboard" element={<LabDashboard />} />
        <Route path="/lab/labpatients" element={<LabPatients />} />
        <Route path="/lab/labpatient-profile" element={<LabPatientProfile />} />
        <Route path="/lab/labqueue" element={<LabQueue />} />
        <Route path="/lab/labentry" element={<LabEntry />} />
        <Route path="/lab/labresults" element={<LabResults />} />
        <Route path="/lab/labinventory" element={<LabInventory />} />

        {/* === Pharmacy Module === */}
        <Route path="/pharmacy/pharmacydashboard" element={<PharmacyDashboard />} />
        <Route path="/pharmacy/pharmacyinventory" element={<PharmacyInventory />} />
        <Route path="/pharmacy/pharmacyhistory" element={<PharmacyHistory />} />
        <Route path="/pharmacy/pharmacysettings" element={<PharmacySettings />} />

      </Routes>
    </Router>
  );
}

export default App;