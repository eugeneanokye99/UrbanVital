import { useState, useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  HeartPulse,
  Edit, 
  Save, 
  X, 
  ArrowLeft,
  Shield
} from "lucide-react";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

export default function StaffPatientDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Retrieve patient passed from the list
  const initialData = location.state?.patient;

  // 2. Local state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // Default values in case initialData is missing specific fields
    name: "",
    mrn: "",
    phone: "",
    gender: "Male",
    dob: "1995-05-12", // Mock DOB
    address: "",
    occupation: "Teacher",
    email: "patient@email.com",
    emergencyName: "Sarah Mensah",
    emergencyPhone: "020 999 8888",
    emergencyRelation: "Spouse",
    insuranceProvider: "NHIS",
    insuranceNumber: "12345678",
    ...initialData // Overwrite defaults with actual passed data
  });

  // Redirect if accessed directly without data
  if (!initialData) {
    return <Navigate to="/staff/patients" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // API Call would go here: await API.put(`/patients/${formData.id}`, formData);
    toast.success("Patient details updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert changes
    setFormData({ ...initialData, ...formData }); // In real app, reset to original API data
    setIsEditing(false);
    toast.error("Changes discarded");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <button 
                  onClick={() => navigate("/frontdesk/patients")}
                  className="flex items-center text-gray-500 hover:text-[#073159] mb-2 transition-colors font-medium text-sm"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back to List
                </button>
                <h1 className="text-2xl font-bold text-[#073159]">Patient Profile</h1>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                    >
                      <X size={18} /> Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-colors font-medium text-sm"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 transition-all font-medium text-sm"
                  >
                    <Edit size={18} /> Edit Details
                  </button>
                )}
              </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-[#073159] text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg">
                    {formData.name.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{formData.name}</h2>
                  <p className="text-sm text-gray-500 font-mono mt-1">{formData.mrn}</p>
                  
                  <div className="mt-6 w-full border-t border-gray-100 pt-6 space-y-4 text-left">
                    <InfoField label="Date of Birth" name="dob" value={formData.dob} isEditing={isEditing} type="date" onChange={handleChange} />
                    <InfoField label="Gender" name="gender" value={formData.gender} isEditing={isEditing} type="select" options={["Male", "Female"]} onChange={handleChange} />
                    <InfoField label="Occupation" name="occupation" value={formData.occupation} isEditing={isEditing} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Forms */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-[#073159] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <MapPin size={20} /> Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Phone Number" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleChange} />
                    <InfoField label="Email Address" name="email" value={formData.email} isEditing={isEditing} onChange={handleChange} />
                    <div className="md:col-span-2">
                      <InfoField label="Residential Address" name="address" value={formData.address} isEditing={isEditing} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-red-600 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <HeartPulse size={20} /> Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Next of Kin Name" name="emergencyName" value={formData.emergencyName} isEditing={isEditing} onChange={handleChange} />
                    <InfoField label="Relationship" name="emergencyRelation" value={formData.emergencyRelation} isEditing={isEditing} onChange={handleChange} />
                    <InfoField label="Emergency Phone" name="emergencyPhone" value={formData.emergencyPhone} isEditing={isEditing} onChange={handleChange} />
                  </div>
                </div>

                {/* Insurance / Billing */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-green-600 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <CreditCard size={20} /> Insurance & Billing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} isEditing={isEditing} type="select" options={["Private Cash", "NHIS", "Acacia", "Ace Medical"]} onChange={handleChange} />
                    <InfoField label="Policy / Member No." name="insuranceNumber" value={formData.insuranceNumber} isEditing={isEditing} onChange={handleChange} />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Helper Component to switch between View/Edit ---
interface InfoFieldProps {
  label: string;
  name: string;
  value: string;
  isEditing: boolean;
  type?: "text" | "date" | "select";
  options?: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function InfoField({ label, name, value, isEditing, type = "text", options, onChange }: InfoFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      
      {isEditing ? (
        type === "select" ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange}
            className="w-full p-2 rounded-lg border border-blue-300 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#073159]"
          >
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange}
            className="w-full p-2 rounded-lg border border-blue-300 bg-blue-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#073159]"
          />
        )
      ) : (
        <p className="text-gray-800 font-medium text-base py-2 border-b border-transparent">
          {value || <span className="text-gray-300 italic">Not set</span>}
        </p>
      )}
    </div>
  );
}