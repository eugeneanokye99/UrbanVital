import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Flag, 
  Contact, 
  Users, // For gender/role
  Phone,
  ArrowRight,
  UserPlus
} from "lucide-react";
import API from "../../services/api";
import ghFlag from "../../assets/ghana-flag.png";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    gender: "",
    contactperson: "",
    flags: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call - Replace with actual API.post when ready
      // await API.post("/auth/register/", form);
      
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success(`${form.name} registered successfully`);
      
      // Navigate only AFTER success
      navigate("/staff/registerpatientform"); 
      
      setForm({
        name: "",
        phone: "",
        address: "",
        gender: "",
        contactperson: "",
        flags: "",
      });
    } catch (error) {
      toast.error("Failed to register user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Page Header */}
            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-[#073159] flex items-center justify-center md:justify-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-[#073159]" />
                </div>
                Register New Patient
              </h1>
              <p className="text-gray-500 mt-2 ml-1">
                Create a new patient profile in the system.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="h-2 bg-[#073159] w-full"></div> {/* Decorative top bar */}
              
              <form onSubmit={handleSubmit} className="p-6 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="name" 
                        placeholder="Patient Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none gap-2 border-r border-gray-200 pr-2 my-2">
                        <img src={ghFlag} alt="GH" className="h-4 w-6 object-cover rounded-sm" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="054 XXX XXXX"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full pl-24 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Address Input */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Residential Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        placeholder="House Number, Street Name, City"
                        value={form.address}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Gender Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Gender
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                      </div>
                      <select
                        name="gender" 
                        value={form.gender}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                         <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Emergency Contact
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
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Flags (Full width) */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Medical Flags / Notes
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Flag className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="flags"
                        placeholder="e.g. Severe Peanut Allergy, Diabetic, Asthmatic"
                        value={form.flags}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#073159] hover:bg-[#062a4d] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:transform-none"
                  >
                    {loading ? "Saving..." : "Save & Continue"}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>

              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}