import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  User, 
  Phone, 
  MapPin, 
  Flag, 
  Contact, 
  ChevronLeft, 
  Save,
  Activity,
  Hash
} from "lucide-react";
import API from "../../services/api";
import ghFlag from "../../assets/ghana-flag.png";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

export default function RegisterPatient() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    contactperson: "",
    flags: "",
  });

  // Generate MRN only once per render to prevent flickering, 
  // or handle this via backend logic usually. 
  // For now, keeping your random logic but memoized effectively by render.
  const mrnSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register/", form);
      toast.success(`${form.name} registered successfully`);
      setForm({
        name: "",
        phone: "",
        address: "",
        gender: "",
        contactperson: "",
        flags: "",
      });
    } catch {
      toast.error("Failed to register user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar Wrapper */}
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#073159]">
                  Patient Registration
                </h1>
                <p className="text-gray-500 mt-1">
                  Enter patient details to start a new visit.
                </p>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-[#073159] transition-colors font-medium"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back to list
              </button>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              
              {/* Card Header / MRN Display */}
              <div className="bg-[#073159] px-6 py-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <User size={24} className="text-white" />
                  </div>
                  <span className="font-medium text-lg tracking-wide">New Patient Entry</span>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                  <Hash size={18} className="text-blue-200" />
                  <span className="text-blue-200 text-sm font-semibold uppercase">MRN:</span>
                  <span className="text-white font-mono text-lg tracking-wider">
                    UV-2025-{mrnSuffix}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  
                  {/* Full Name */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. Kwame Mensah"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none gap-2 border-r border-gray-200 pr-2 my-2">
                        <img src={ghFlag} alt="GH" className="h-4 w-6 object-cover rounded-sm shadow-sm" />
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="054 673 2719"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full pl-24 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Gender (Added this as it was in state but missing in UI) */}
                  <div>
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Residential Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="e.g. House No. 12, Adenta Housing Down, Accra"
                        value={form.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Emergency Contact <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Contact className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="contactperson"
                        placeholder="Next of Kin Name"
                        value={form.contactperson}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Medical Flags */}
                  <div>
                    <label className="block text-sm font-semibold text-[#073159] mb-2 uppercase tracking-wide">
                      Medical Flags
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Flag className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="flags"
                        placeholder="e.g. Penicillin Allergy, Diabetic"
                        value={form.flags}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-gray-700 bg-gray-50 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#073159] hover:bg-[#062a4d] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <Activity className="animate-spin h-5 w-5" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                    <span>Start New Visit</span>
                  </button>
                </div>
              </form>
            </div>
            
            <p className="text-center text-gray-400 text-sm mt-8">
              &copy; 2025 Hospital Management System. Secure Form.
            </p>

          </div>
        </main>
      </div>
    </div>
  );
}