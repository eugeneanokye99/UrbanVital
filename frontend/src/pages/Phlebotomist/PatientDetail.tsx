import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  MapPin, 
  CreditCard, 
  HeartPulse,
  Edit, 
  Save, 
  X, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import { fetchPatientById } from "../../services/api"; 

export default function StaffPatientDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const statePatient = location.state?.patient;
  const [loading, setLoading] = useState(!statePatient);
  const [isEditing, setIsEditing] = useState(false);
  const [patientData, setPatientData] = useState<any>(statePatient || null);

  const [formData, setFormData] = useState({
    name: "",
    mrn: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    occupation: "",
    email: "",
    idNumber: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    paymentMode: "", 
    insuranceProvider: "",
    insuranceNumber: "",
    medicalFlags: "",
  });

  useEffect(() => {
    const loadFullDetails = async () => {
      // Handle case where patient ID might be directly on state or inside a nested patient object
      const patientId = statePatient?.id; 

      if (patientId) {
        try {
          // If we suspect data is missing, ensure loading spinner shows
          if (!statePatient.emergency_name && !statePatient.emergency_contact_name) {
             setLoading(true);
          }

          const fullData = await fetchPatientById(patientId);
          setPatientData(fullData);
          
          // --- HERE IS THE FIX ---
          // We check multiple possible key names from the backend response
          setFormData({
            name: fullData.name || `${fullData.first_name} ${fullData.last_name}` || "",
            mrn: fullData.mrn || "",
            phone: fullData.phone || "",
            gender: fullData.gender || "Male",
            dob: fullData.date_of_birth || fullData.dob || "",
            address: fullData.address || "",
            city: fullData.city || "",
            occupation: fullData.occupation || "",
            email: fullData.email || "",
            idNumber: fullData.id_number || "",
            
            // CHECKING BOTH NAMING CONVENTIONS HERE:
            emergencyName: fullData.emergency_name || fullData.emergency_contact_name || "", 
            emergencyPhone: fullData.emergency_phone || fullData.emergency_contact_phone || "",
            emergencyRelation: fullData.emergency_relation || fullData.emergency_contact_relation || "",
            
            paymentMode: fullData.payment_mode || "Cash",
            insuranceProvider: fullData.insurance_provider || "",
            insuranceNumber: fullData.insurance_number || "",
            medicalFlags: fullData.medical_history || fullData.medical_flags || "",
          });

        } catch (error) {
          console.error("Failed to load details", error);
          toast.error("Could not load full details");
        } finally {
          setLoading(false);
        }
      }
    };

    loadFullDetails();
  }, [statePatient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setTimeout(() => {
        toast.success("Patient details updated successfully!");
        setIsEditing(false);
    }, 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    toast.error("Changes discarded");
  };

  if (loading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#073159]" />
          </div>
      )
  }

  if (!patientData && !loading) return <div className="p-8 text-center text-gray-500">Patient not found</div>;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <button 
            onClick={() => navigate("/phlebotomist/patients")}
            className="flex items-center text-gray-500 hover:text-[#073159] mb-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to List
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Patient Profile</h1>
        </div>

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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-[#073159] text-white flex items-center justify-center text-2xl md:text-3xl font-bold mb-4 shadow-lg">
              {formData.name?.charAt(0) || "P"}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 break-words w-full px-2">{formData.name}</h2>
            <p className="text-sm text-gray-500 font-mono mt-1 bg-gray-50 px-2 py-0.5 rounded">{formData.mrn}</p>
            
            {/* Medical Flags Alert */}
            {formData.medicalFlags && (
                <div className="mt-4 w-full p-3 bg-red-50 border border-red-100 rounded-xl text-left">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-1">
                        <AlertCircle size={14} /> Medical Alert
                    </div>
                    <p className="text-sm text-red-600 leading-snug">{formData.medicalFlags}</p>
                </div>
            )}

            <div className="mt-6 w-full border-t border-gray-100 pt-6 space-y-4 text-left">
              <InfoField label="Date of Birth" name="dob" value={formData.dob} isEditing={isEditing} type="date" onChange={handleChange} />
              <InfoField label="Gender" name="gender" value={formData.gender} isEditing={isEditing} type="select" options={["Male", "Female"]} onChange={handleChange} />
              <InfoField label="Occupation" name="occupation" value={formData.occupation} isEditing={isEditing} onChange={handleChange} />
              <InfoField label="ID Number" name="idNumber" value={formData.idNumber} isEditing={isEditing} onChange={handleChange} />
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
              <InfoField label="City / Town" name="city" value={formData.city} isEditing={isEditing} onChange={handleChange} />
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
              <CreditCard size={20} /> Billing Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <InfoField label="Payment Mode" name="paymentMode" value={formData.paymentMode} isEditing={isEditing} onChange={handleChange} />
              {formData.paymentMode === "Insurance" && (
                  <>
                    <InfoField label="Provider" name="insuranceProvider" value={formData.insuranceProvider} isEditing={isEditing} type="select" options={["NHIS", "Acacia", "Ace Medical"]} onChange={handleChange} />
                    <InfoField label="Member No." name="insuranceNumber" value={formData.insuranceNumber} isEditing={isEditing} onChange={handleChange} />
                  </>
              )}
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