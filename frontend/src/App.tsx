import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard'
import RegisterStaff from './pages/admin/RegisterStaff'
import ProtectedRoute from './components/ProtectedRoutes';




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
          <Route
          path="/admin/register"
          element={
            <ProtectedRoute>
              <RegisterStaff />
            </ProtectedRoute>
          }
        />
        <Route
        path="/admin/dashboard"
        element={
            <AdminDashboard />
          
        }
      />
    </Routes>
  </Router>
);
}

export default App;