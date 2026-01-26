import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  MapPin, 
  CreditCard, 
  HeartPulse,
  Edit, 
  Save, 
  X, 
  ArrowLeft
} from "lucide-react";

export default function StaffPatientDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve passed patient data
  const initialData = location.state?.patient;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mrn: "",
    phone: "",
    gender: "Male",
    dob: "1995-05-12",
    address: "",
    occupation: "Teacher",
    email: "patient@email.com",
    emergencyName: "Sarah Mensah",
    emergencyPhone: "020 999 8888",
    emergencyRelation: "Spouse",
    insuranceProvider: "NHIS",
    insuranceNumber: "12345678",
    ...initialData // Merge mock data with defaults
  });

  // Redirect if accessed directly without data
  if (!initialData) {
    return <Navigate to="/frontdesk/patients" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Simulate API update
    setTimeout(() => {
        toast.success("Patient details updated successfully!");
        setIsEditing(false);
    }, 500);
  };

  const handleCancel = () => {
    setFormData({ ...initialData, ...formData }); // Reset would ideally go back to original
    setIsEditing(false);
    toast.error("Changes discarded");
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      
      {/* Header: Stack on mobile, Row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <button 
            onClick={() => navigate("/frontdesk/patients")}
            className="flex items-center text-gray-500 hover:text-[#073159] mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to List
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Patient Profile</h1>
        </div>

        {/* Action Buttons: Full width on mobile */}
        <div className="flex gap-3 w-full sm:w-auto">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md transition-colors font-medium text-sm"
              >
                <Save size={18} /> Save
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 transition-all font-medium text-sm active:scale-95"
            >
              <Edit size={18} /> Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: 1 col (mobile) -> 3 cols (desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-[#073159] text-white flex items-center justify-center text-2xl md:text-3xl font-bold mb-4 shadow-lg">
              {formData.name.charAt(0)}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 break-words w-full px-2">{formData.name}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-50 px-2 py-0.5 rounded">{formData.mrn}</p>
            
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
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base md:text-lg font-bold text-[#073159] mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
              <MapPin size={20} /> Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InfoField label="Phone Number" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleChange} />
              <InfoField label="Email Address" name="email" value={formData.email} isEditing={isEditing} onChange={handleChange} />
              <div className="md:col-span-2">
                <InfoField label="Residential Address" name="address" value={formData.address} isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base md:text-lg font-bold text-red-600 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
              <HeartPulse size={20} /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InfoField label="Next of Kin Name" name="emergencyName" value={formData.emergencyName} isEditing={isEditing} onChange={handleChange} />
              <InfoField label="Relationship" name="emergencyRelation" value={formData.emergencyRelation} isEditing={isEditing} onChange={handleChange} />
              <div className="md:col-span-2">
                  <InfoField label="Emergency Phone" name="emergencyPhone" value={formData.emergencyPhone} isEditing={isEditing} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Insurance / Billing */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base md:text-lg font-bold text-green-600 mb-4 md:mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
              <CreditCard size={20} /> Insurance & Billing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InfoField label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} isEditing={isEditing} type="select" options={["Private Cash", "NHIS", "Acacia", "Ace Medical"]} onChange={handleChange} />
              <InfoField label="Policy / Member No." name="insuranceNumber" value={formData.insuranceNumber} isEditing={isEditing} onChange={handleChange} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// Helper Component for Fields
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
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      
      {isEditing ? (
        type === "select" ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange}
            className="w-full p-2.5 rounded-xl border border-blue-300 bg-blue-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#073159] transition-all"
          >
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type} 
            name={name} 
            value={value} 
            onChange={onChange}
            className="w-full p-2.5 rounded-xl border border-blue-300 bg-blue-50 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#073159] transition-all"
          />
        )
      ) : (
        <p className="text-gray-800 font-medium text-sm md:text-base py-2 border-b border-transparent break-words">
          {value || <span className="text-gray-300 italic">Not set</span>}
        </p>
      )}
    </div>
  );
}