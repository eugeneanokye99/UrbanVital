import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard'
import RegisterStaff from './pages/admin/RegisterStaff'
import ProtectedRoute from './components/ProtectedRoutes';
import PatientList from './pages/admin/PatientsList';
import Finance from './pages/admin/Finance';
import Staff from './pages/admin/StaffManagement';
import StaffDashboard from './pages/frontdesk/StaffDashboard';
import CheckIn from './pages/frontdesk/CheckIn';
import PatientDetail from './pages/frontdesk/PatientDetail'
import PatientsList from './pages/frontdesk/PatientsList';
import RegisterPatient from './pages/frontdesk/RegisterPatient';
import Billings from './pages/frontdesk/Billings'
import PatientDetails from './pages/clinician/PatientDetails';
import Dashboard from './pages/clinician/Dashboard';
import Patients from './pages/clinician/Patients';
import Consulting from './pages/clinician/Consulting';
import FollowUp from './pages/clinician/FollowUp';
import Billing from './pages/clinician/Billing';
import Documents from './pages/clinician/Documents';
import LabInventory from './pages/lab/LabInventory';
import LabQueue from './pages/lab/LabQueue';
import LabResults from './pages/lab/LabResults';
import LabDashboard from './pages/lab/LabDashboard';
import LabPatients from './pages/lab/LabPatients';
import PatientProfile from './pages/lab/LabPatientProfile';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import PharmacySettings from './pages/pharmacy/PharmacySettings';
import PharmacyHistory from './pages/pharmacy/PharmacyHistory';
import LabResultEntry from './pages/lab/LabEntry';
import ClinicianLabResults from './pages/clinician/ClinicianLabResults';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';





function App() {
  return (
    <Router>
      <Toaster position="bottom-right" toastOptions={{duration: 8000}} />
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
          {/* <Route
          path="/admin/register"
          element={
            <ProtectedRoute>
              <RegisterStaff />
            </ProtectedRoute>
          }
        /> */}

        {/* Routes not protected and using for testing purposes only */}

        <Route
        path="/admin/dashboard"
        element={
            <AdminDashboard />
          
        }
      />
        <Route
        path="/admin/register"
        element={
            <RegisterStaff />
        }
      />
      <Route
        path="/admin/patients"
        element={
            <PatientList />
        }
      />
      <Route
        path="/admin/finance"
        element={
            <Finance />
        }
      />
      <Route
        path="/admin/staff"
        element={
            <Staff />
        }
      />
      <Route
        path="/admin/inventory"
        element={
            <AdminInventory />
        }
      />
      <Route
        path="/admin/settings"
        element={
            <AdminSettings />
        }
      />



{/* FrontDesk routes */}


      <Route
        path="/frontdesk/staffdashboard"
        element={
            <StaffDashboard />
        }
      />
      <Route
        path="/frontdesk/checkin"
        element={
            <CheckIn />
        }
      />
      <Route
        path="/frontdesk/patientdetail"
        element={
            <PatientDetail />
        }
      />

      <Route
        path="/frontdesk/registerpatient"
        element={
            <RegisterPatient />
        }
      />

      <Route
        path="/frontdesk/patients"
        element={
            <PatientsList />
        }
      />
      <Route
        path="/frontdesk/billings"
        element={
            <Billings />
        }
      />


      {/* Clinician Routes */}
          <Route 
          path="/clinician/patient-details" 
          element={
          <PatientDetails />
          }
          />
          <Route 
          path="/clinician/dashboard" 
          element={
          <Dashboard />
          }
          />

          <Route
        path="/clinician/patients"
        element={
            <Patients />
        }
      />  
      <Route
        path="/clinician/consulting"
        element={
            <Consulting />
        }
      />  
      <Route
        path="/clinician/followup"
        element={
            <FollowUp />
        }
      />
      <Route
        path="/clinician/billing"
        element={
            <Billing />
        }
      /> 
      <Route
        path="/clinician/documents"
        element={
            <Documents />
        }
      /> 
      <Route
        path="/clinician/clinicianlabresults"
        element={
            <ClinicianLabResults />
        }
      /> 
  {/* Lab Technician Routes */ }
      <Route
        path="/lab/labdashboard"
        element={
            <LabDashboard />
        }
      />
      <Route
        path="/lab/labpatients"
        element={
            <LabPatients />
        }
      />
      <Route
      path="/lab/labpatient-profile"
      element={
          <PatientProfile />
      }
    />
    <Route
      path="/lab/labentry"
      element={
          <LabResultEntry />
      }
    />
      <Route
        path="/lab/labresults"
        element={
            <LabResults />
        }
      /> 
      <Route
        path="/lab/labqueue"
        element={
            <LabQueue />
        }
      />
      <Route
        path="/lab/labinventory"
        element={
            <LabInventory />
        }
      /> 

          {/* Pharmacy Routes -  */}
         <Route
        path="/pharmacy/pharmacydashboard"
        element={
            <PharmacyDashboard />
        }
      />
      <Route
        path="/pharmacy/pharmacyinventory"
        element={
            <PharmacyInventory />
        }
      /> 
      <Route
        path="/pharmacy/pharmacyhistory"
        element={
            <PharmacyHistory />
        }
      />
      <Route
        path="/pharmacy/pharmacysettings"
        element={
            <PharmacySettings />
        }
      />



      </Routes>
  </Router>


);
}

export default App;