import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard'
import RegisterStaff from './pages/admin/RegisterStaff'
import ProtectedRoute from './components/ProtectedRoutes';
import PatientList from './pages/admin/PatientsList';
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
import LabResults from './pages/clinician/LabResults';





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
        path="/clinician/labresults"
        element={
            <LabResults />
        }
      /> 









      </Routes>
  </Router>


);
}

export default App;