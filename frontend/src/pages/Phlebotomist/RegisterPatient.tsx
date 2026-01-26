import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  ArrowRight,
  UserPlus,
  Calendar,
  CreditCard,
  Shield,
  HeartPulse,
  Mail
} from "lucide-react";
import ghFlag from "../../assets/ghana-flag.png";
import { registerPatient } from "../../services/api";

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Comprehensive Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    occupation: "",
    idType: "Ghana Card",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    paymentMode: "Cash",
    insuranceProvider: "",
    insuranceNumber: "",
    medicalFlags: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

// In your RegisterPatient component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const patientData = {
      first_name: form.firstName,
      last_name: form.lastName,
      date_of_birth: form.dob,
      gender: form.gender,
      marital_status: form.maritalStatus,
      occupation: form.occupation,
      id_type: form.idType,
      id_number: form.idNumber,
      phone: form.phone,
      email: form.email || "",
      address: form.address,
      city: form.city || "",
      emergency_name: form.emergencyName,
      emergency_phone: form.emergencyPhone,
      emergency_relation: form.emergencyRelation,
      payment_mode: form.paymentMode,
      insurance_provider: form.paymentMode === "Insurance" ? form.insuranceProvider : "",
      insurance_number: form.paymentMode === "Insurance" ? form.insuranceNumber : "",
      medical_flags: form.medicalFlags || "",
    };

    // Use the separated create endpoint
    const newPatient = await registerPatient(patientData);
    toast.success(`${patientData.first_name} ${patientData.last_name} registered successfully!`);
    console.log("Created patient:", newPatient);
    
    // Navigate to patient list or detail page
    navigate("/frontdesk/patients");
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Show specific error messages
    if (error.response?.data) {
      Object.entries(error.response.data).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((message: string) => {
            toast.error(`${field}: ${message}`);
          });
        }
      });
    } else {
      toast.error("Failed to register patient. Please check your data.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-[#073159]" />
            </div>
            New Patient Registration
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-2 ml-1">
            Enter patient demographics, insurance, and emergency details.
          </p>
        </div>
        
        {/* MRN Preview Badge */}
        <div className="flex flex-col items-start sm:items-end bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-none border-gray-100 shadow-sm sm:shadow-none w-full sm:w-auto">
          <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Generated MRN</span>
          <span className="text-lg md:text-xl font-mono font-bold text-gray-400 tracking-wider">UV-2025-XXXX</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- SECTION 1: PERSONAL INFORMATION --- */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
            <User size={20} className="text-[#073159]" /> Personal Demographics
          </h3>
          
          {/* Grid: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* First Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">First Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Kwame" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm transition-all bg-gray-50 focus:bg-white" 
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Last Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Mensah" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm transition-all bg-gray-50 focus:bg-white" 
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Gender <span className="text-red-500">*</span></label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                required 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none bg-white text-sm transition-all"
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* DOB */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Date of Birth <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                    type="date" 
                    name="dob" 
                    value={form.dob} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
                />
                <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Occupation</label>
              <input 
                type="text" 
                name="occupation" 
                value={form.occupation} 
                onChange={handleChange} 
                placeholder="e.g. Teacher" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
              />
            </div>

            {/* ID Card */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Ghana Card / ID No.</label>
              <div className="relative">
                  <input 
                    type="text" 
                    name="idNumber" 
                    value={form.idNumber} 
                    onChange={handleChange} 
                    placeholder="GHA-000000000-0" 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
                  />
                  <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: CONTACT & ADDRESS --- */}
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
            <MapPin size={20} className="text-[#073159]" /> Contact Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative flex items-center">
                  <span className="absolute left-3 flex items-center gap-1 border-r border-gray-300 pr-2 pointer-events-none">
                      <img src={ghFlag} alt="GH" className="w-5 h-3 object-cover rounded-sm" />
                  </span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    placeholder="054 673 2719" 
                    className="w-full pl-16 p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none font-mono text-sm bg-gray-50 focus:bg-white transition-all" 
                  />
              </div>
            </div>

            {/* Address (Spans 2 cols on Desktop) */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Residential Address <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="address" 
                value={form.address} 
                onChange={handleChange} 
                required 
                placeholder="House No, Street Name, Landmark" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">Email (Optional)</label>
              <div className="relative">
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    placeholder="patient@email.com" 
                    className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
                  />
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            {/* City/Town */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600 uppercase">City / Town</label>
              <input 
                type="text" 
                name="city" 
                value={form.city} 
                onChange={handleChange} 
                placeholder="e.g. Adenta" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 3: EMERGENCY & INSURANCE (Split) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Emergency Contact */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <HeartPulse size={20} className="text-red-500" /> Emergency Contact
              </h3>
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Next of Kin Name</label>
                      <input 
                        type="text" 
                        name="emergencyName" 
                        value={form.emergencyName} 
                        onChange={handleChange} 
                        required 
                        placeholder="Full Name" 
                        className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
                      />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Relationship</label>
                          <select name="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} required className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none bg-white text-sm">
                              <option value="">Select...</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Parent">Parent</option>
                              <option value="Sibling">Sibling</option>
                              <option value="Child">Child</option>
                              <option value="Friend">Friend</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600 uppercase">Phone</label>
                          <input 
                            type="tel" 
                            name="emergencyPhone" 
                            value={form.emergencyPhone} 
                            onChange={handleChange} 
                            required 
                            placeholder="020..." 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm bg-gray-50 focus:bg-white transition-all" 
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* Insurance / Payment */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <CreditCard size={20} className="text-green-600" /> Payment & Billing
              </h3>
              
              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-600 uppercase">Primary Payment Mode</label>
                      <div className="flex flex-col sm:flex-row gap-3 mt-2">
                          <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-sm font-medium ${form.paymentMode === 'Cash' ? 'bg-[#073159] text-white border-[#073159]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                              <input type="radio" name="paymentMode" value="Cash" checked={form.paymentMode === "Cash"} onChange={handleChange} className="hidden" />
                              Cash
                          </label>
                          <label className={`flex-1 cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-sm font-medium ${form.paymentMode === 'Insurance' ? 'bg-[#073159] text-white border-[#073159]' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                              <input type="radio" name="paymentMode" value="Insurance" checked={form.paymentMode === "Insurance"} onChange={handleChange} className="hidden" />
                              Insurance
                          </label>
                      </div>
                  </div>

                  {form.paymentMode === "Insurance" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-600 uppercase">Provider</label>
                              <select name="insuranceProvider" value={form.insuranceProvider} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white text-sm">
                                  <option value="">Select Provider</option>
                                  <option value="NHIS">NHIS</option>

                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-600 uppercase">Member No.</label>
                              <input type="text" name="insuranceNumber" value={form.insuranceNumber} onChange={handleChange} placeholder="Provider ID" className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm bg-gray-50 focus:bg-white transition-all" />
                          </div>
                      </div>
                  )}
                  
                  <div className="space-y-1 pt-2">
                      <label className="text-xs font-bold text-gray-600 uppercase">Important Medical Flags</label>
                      <textarea 
                        name="medicalFlags" 
                        value={form.medicalFlags} 
                        onChange={handleChange} 
                        placeholder="e.g. Diabetic, allergic to Penicillin" 
                        className="w-full p-3 rounded-xl border border-gray-200 outline-none h-20 text-sm bg-gray-50 focus:bg-white transition-all resize-none"
                      ></textarea>
                  </div>
              </div>
          </div>

        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4 md:pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#073159] hover:bg-[#062a4d] text-white font-bold py-3.5 px-10 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base md:text-lg"
          >
            {loading ? "Registering..." : "Complete Registration"}
            {!loading && <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
        </div>

      </form>
    </div>
  );
}