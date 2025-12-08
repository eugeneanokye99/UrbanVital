import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  User, 
  Mail, 
  Briefcase, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  UserPlus, 
  ShieldCheck 
} from "lucide-react";
import ghFlag from "../../assets/ghana-flag.png";
import { registerStaff } from "../../services/api";

export default function RegisterStaff() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerStaff(form);
      toast.success(`${form.role} registered successfully`);
      setForm({ username: "", email: "", phone: "", password: "", role: "" });
    } catch (error) {
      toast.error("Failed to register user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-[#073159] flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-[#073159]" />
          </div>
          Add New Staff
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-2 ml-1">
          Create accounts for Clinicians, Lab Technicians, Pharmacists, and Cashiers.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="h-1.5 md:h-2 bg-[#073159] w-full"></div> 
        
        <form onSubmit={handleSubmit} className="p-5 md:p-8 lg:p-10">
          
          {/* Grid: 1 col on mobile, 2 cols on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

            {/* Username / Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. Dr. Kwame Mensah"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none text-sm md:text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="staff@urbanvital.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none text-sm md:text-base"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                  className="w-full pl-24 pr-4 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none font-mono text-sm md:text-base"
                />
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Department / Role
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                </div>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none appearance-none cursor-pointer text-sm md:text-base"
                >
                  <option value="">Select Role</option>
                  <option value="Clinician">Clinician</option>
                  <option value="Lab">Lab Technician</option>
                  <option value="Pharmacy">Pharmacist</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Ultrasound">Ultrasound Specialist</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Password - Full Width on all screens */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                Temporary Password
                <span className="text-[10px] normal-case font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={10} /> Secure
                </span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-2.5 md:py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none text-sm md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

          </div>

          {/* Submit Actions: Stack on mobile, Row on desktop */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 text-center md:text-left">
              * All fields are required to create a new staff profile.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#073159] hover:bg-[#062a4d] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Staff Member
                </>
              )}
            </button>
          </div>

        </form>
      </div>
      
    </div>
  );
}