import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- Auth & Layouts ---
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoutes';
import AdminLayout from './layouts/AdminLayout'; // Ensure this exists from previous step
import ClinicianLayout from './layouts/ClinicianLayout';
import StaffLayout from './layouts/StaffLayout';
import LabLayout from './layouts/LabLayout';
import PharmacyLayout from './layouts/PharmacyLayout';
import UltrasoundLayout from './layouts/UltrasoundLayout';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatientsList from './pages/admin/PatientsList';
import AdminStaff from './pages/admin/StaffManagement';
import AdminFinance from './pages/admin/Finance';
import AdminInventory from './pages/admin/AdminInventory';
import RegisterStaff from './pages/admin/RegisterStaff';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';

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
import LabPatientProfile from './pages/lab/LabPatientProfile';
import LabQueue from './pages/lab/LabQueue';
import LabEntry from './pages/lab/LabEntry';
import LabResults from './pages/lab/LabResults';
import LabInventory from './pages/lab/LabInventory';
import LabResultView from './pages/lab/LabResultView';

// --- Pharmacy Pages ---
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacyAlerts from './pages/pharmacy/PharmacyAlerts';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyHistory from './pages/pharmacy/PharmacyHistory';
import PharmacySettings from './pages/pharmacy/PharmacySettings';
import PrescriptionReview from './pages/pharmacy/PrescriptionReview';
import PharmacyPOS from './pages/pharmacy/PharmacyPOS';

// -- Ultrasound Pages --
import UltrasoundDashboard from './pages/ultrasound/UltrasoundDashboard';
import UltrasoundWorklist from './pages/ultrasound/UltrasoundWorklist';
import UltrasoundReport from './pages/ultrasound/UltrasoundReport';
import UltrasoundSettings from './pages/ultrasound/UltrasoundSettings';
import UltrasoundHistory from './pages/ultrasound/UltrasoundHistory';

function App() {
  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* === Public Routes === */}
        <Route path="/" element={<Login />} />

        {/* === Admin Module (Wrapped in Layout) === */}
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatientsList />} />
          <Route path="staff" element={<AdminStaff />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="register" element={<RegisterStaff />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* === Front Desk Module === */}
        <Route path="/frontdesk" element={<ProtectedRoute roles={["Cashier"]}><StaffLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="staffdashboard" replace />} />
          <Route path="staffdashboard" element={<StaffDashboard />} />
          <Route path="checkin" element={<StaffCheckIn />} />
          <Route path="patientdetail" element={<StaffPatientDetail />} />
          <Route path="patients" element={<StaffPatientsList />} />
          <Route path="registerpatient" element={<RegisterPatient />} />
          <Route path="billings" element={<StaffBillings />} />
        </Route>

        {/* === Clinician Module (Wrapped in Layout) === */}
       <Route path="/clinician" element={<ProtectedRoute roles={["Clinician"]}><ClinicianLayout /></ProtectedRoute>}>
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

        {/* === Lab Module (Wrapped in Layout) === */}
       <Route path="/lab" element={<LabLayout />}>
          <Route index element={<Navigate to="labdashboard" replace />} />
          <Route path="labdashboard" element={<LabDashboard />} />
          <Route path="patient-profile" element={<LabPatientProfile />} />
          <Route path="labqueue" element={<LabQueue />} />
          <Route path="labentry" element={<LabEntry />} />
          <Route path="labresults" element={<LabResults />} />
          <Route path="labinventory" element={<LabInventory />} />
          <Route path="labresult-view" element={<LabResultView />} />
       </Route>

        {/* === Pharmacy Module === */}

        <Route path="/pharmacy" element={<PharmacyLayout />}>
          <Route index element={<Navigate to="pharmacydashboard" replace />} />
          <Route path="pharmacydashboard" element={<PharmacyDashboard />} />
          <Route path="pharmacyalerts" element={<PharmacyAlerts />} />
          <Route path="pharmacyinventory" element={<PharmacyInventory />} />
          <Route path="pharmacyhistory" element={<PharmacyHistory />} />
          <Route path="pharmacysettings" element={<PharmacySettings />} />
          <Route path="prescription-review" element={<PrescriptionReview />} />
          <Route path="pharmacypos" element={<PharmacyPOS />} />
       </Route>

       {/* === Ultrasound Module === */}
      <Route path="/ultrasound" element={<UltrasoundLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UltrasoundDashboard />} />
        <Route path="worklist" element={<UltrasoundWorklist />} />
        <Route path="reports" element={<UltrasoundReport />} />
        <Route path="settings" element={<UltrasoundSettings />} />
        <Route path="history" element={<UltrasoundHistory />} />
      </Route>

      </Routes>
    </Router>
  );
}

export default App;