import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { fetchNotifications } from './services/notifications';
import { ThemeProvider } from './context/ThemeContext';

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
import AdminInventory from './pages/admin/AdminInventoryHub';
import RegisterStaff from './pages/admin/RegisterStaff';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import PatientVisits from './pages/admin/PatientVisit';
import AdminPharmacyInventory from './pages/admin/AdminPharmacyInventory';
import AdminLabInventory from './pages/admin/AdminLabInventory';
import AdminLabRecords from './pages/admin/AdminLabRecords';

// --- Phlebotomist Pages ---
import PhlebotomistDashboard from './pages/Phlebotomist/PhlebotomistDashboard';
import StaffCheckIn from './pages/Phlebotomist/CheckIn';
import StaffPatientDetail from './pages/Phlebotomist/PatientDetail';
import StaffPatientsList from './pages/Phlebotomist/PatientsList';
import RegisterPatient from './pages/Phlebotomist/RegisterPatient';
import StaffBillings from './pages/Phlebotomist/Billings';

// --- Clinician Pages ---
import ClinicianDashboard from './pages/clinician/ClinicianDashboard';
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
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyHistory from './pages/pharmacy/PharmacyHistory';
import PrescriptionReview from './pages/pharmacy/PrescriptionReview';
import PharmacyPOS from './pages/pharmacy/PharmacyPOS';
import PharmacyReturns from './pages/pharmacy/PharmacyReturns';

// -- Ultrasound Pages --
import UltrasoundDashboard from './pages/ultrasound/UltrasoundDashboard';
import UltrasoundWorklist from './pages/ultrasound/UltrasoundWorklist';
import UltrasoundReport from './pages/ultrasound/UltrasoundReport';
import UltrasoundHistory from './pages/ultrasound/UltrasoundHistory';

function App() {
  const lastSeenRef = useRef<number[]>([]);
  const { user, loading } = useUser();
  useEffect(() => {
    if (loading) return;
    if (user?.role !== 'admin') return;
    let interval: any;
    const poll = async () => {
      try {
        const notifs = await fetchNotifications();
        const newNotifs = notifs.filter(n => !n.is_read && !lastSeenRef.current.includes(n.id));
        if (newNotifs.length > 0) {
          newNotifs.forEach(n => {
            toast.custom(() => (
              <div className="bg-white border border-blue-100 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200" style={{ minWidth: 260 }}>
                <span className="text-blue-600 font-bold">{n.action}</span>
                <span className="text-xs text-gray-500">{n.message}</span>
              </div>
            ), { id: `notif-${n.id}` });
          });
          lastSeenRef.current = [...lastSeenRef.current, ...newNotifs.map(n => n.id)];
        }
      } catch {}
    };
    poll();
    interval = setInterval(poll, 12000);
    return () => clearInterval(interval);
  }, [user, loading]);

  return (
    <UserProvider>
      <ThemeProvider>
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
          <Route path="patient-visits" element={<PatientVisits />} />
          <Route path="pharmacy-inventory" element={<AdminPharmacyInventory />} />
          <Route path="lab-inventory" element={<AdminLabInventory />} />
          <Route path="lab-records" element={<AdminLabRecords />} />

        </Route>

        {/* === Phlebotomist Module === */}
        <Route path="/phlebotomist" element={<ProtectedRoute roles={["Cashier"]}><StaffLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="phlebotomistdashboard" replace />} />
          <Route path="phlebotomistdashboard" element={<PhlebotomistDashboard />} />
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
          <Route path="pharmacyinventory" element={<PharmacyInventory />} />
          <Route path="pharmacyhistory" element={<PharmacyHistory />} />
          <Route path="prescription-review" element={<PrescriptionReview />} />
          <Route path="pharmacypos" element={<PharmacyPOS />} />
          <Route path="pharmacyreturns" element={<PharmacyReturns />} />
       </Route>

       {/* === Ultrasound Module === */}
      <Route path="/ultrasound" element={<UltrasoundLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UltrasoundDashboard />} />
        <Route path="worklist" element={<UltrasoundWorklist />} />
        <Route path="reports" element={<UltrasoundReport />} />
        <Route path="history" element={<UltrasoundHistory />} />
      </Route>

      </Routes>
    </Router>
    </ThemeProvider>
    </UserProvider>
  ); 
}

export default App;