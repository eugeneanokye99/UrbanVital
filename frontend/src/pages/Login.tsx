import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getStaffRole } from "../services/api";
import toast from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckSquare, 
  Activity,
  ArrowRight
} from "lucide-react";

// Images
import doctorImg from "../../src/assets/doctor.png"; 
import logoImg from "../../src/assets/urbanvital-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(form);

      if (data.is_superuser) {
        navigate("/admin");
      } else {
        const result = await getStaffRole(data.email);
        navigate("/staff/staffdashboard");
      }
    } catch (error) {
      toast.error("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* --- LEFT SECTION (Visuals) --- 
        Changed 'hidden lg:flex' to 'hidden md:flex' so it shows on tablets too.
      */}
      <div className="hidden md:flex md:w-1/2 bg-[#073159] relative items-center justify-center overflow-hidden transition-all duration-500">
        
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#073159] to-[#041d36]"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Abstract ECG Line Pattern */}
        <div className="absolute bottom-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 50 L10 50 L15 40 L20 60 L25 50 L100 50" stroke="white" strokeWidth="0.5" fill="none" />
           </svg>
        </div>

        {/* Main Visual Content */}
        <div className="relative z-10 flex flex-col items-center">
            
            {/* Responsive Circle Wrapper 
               - Tablet (md): 320px 
               - Laptop (lg): 450px 
               - Desktop (xl): 500px
            */}
            <div className="relative w-[320px] h-[320px] lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px] flex items-center justify-center transition-all duration-500">
                
                {/* Outer Rotating Ring */}
                <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-6 lg:inset-8 border border-white/5 rounded-full"></div>
                
                {/* Inner Image Container (Scales with parent) */}
                <div className="relative w-[80%] h-[80%] bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                        src={doctorImg} 
                        alt="Doctor" 
                        className="w-full h-full object-cover object-top opacity-90 hover:scale-105 transition-transform duration-700" 
                    />
                </div>

                {/* Floating Status Badge (Adjusted position for responsiveness) */}
                <div className="absolute bottom-10 right-0 lg:bottom-20 lg:-right-4 bg-white/10 backdrop-blur-md border border-white/20 p-3 lg:p-4 rounded-xl shadow-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <Activity className="text-white w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xs lg:text-sm">System Status</p>
                            <p className="text-green-400 text-[10px] lg:text-xs font-medium">Operational</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Text Description */}
            <div className="text-center mt-6 lg:mt-8 px-8 lg:px-12">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">UrbanVital Health</h2>
                <p className="text-blue-200 text-sm lg:text-base">Modern solutions for modern healthcare management.</p>
            </div>
        </div>
      </div>

      {/* --- RIGHT SECTION (Form) ---
        - On mobile: w-full
        - On tablet/desktop: w-1/2
      */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-gray-50/50 overflow-y-auto">
        <div className="w-full max-w-sm lg:max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="flex flex-col items-center mb-6 lg:mb-8">
            <img 
                src={logoImg} 
                alt="UrbanVital" 
                className="h-12 lg:h-16 mb-4 lg:mb-6 object-contain"
            />
            <h1 className="text-xl lg:text-2xl font-bold text-[#073159] text-center">
                Welcome Back
            </h1>
            <p className="text-gray-500 text-center mt-2 text-xs lg:text-sm">
                Manage patients, labs, and pharmacy efficiently.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            
            {/* Username */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email / Username</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                    </div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter your email"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 lg:py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none text-sm lg:text-base"
                        required
                    />
                </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#073159] transition-colors" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-3 lg:py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#073159] focus:ring-4 focus:ring-[#073159]/10 transition-all outline-none text-sm lg:text-base"
                        required
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

            {/* Options */}
            <div className="flex items-center justify-between text-xs lg:text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div 
                        onClick={() => setRememberMe(!rememberMe)} 
                        className={`w-4 h-4 lg:w-5 lg:h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#073159] border-[#073159]' : 'bg-white border-gray-300'}`}
                    >
                        {rememberMe && <CheckSquare size={14} className="text-white" />}
                    </div>
                    <span className="text-gray-600 group-hover:text-gray-800">Remember me</span>
                </label>
                
                <a href="#" className="font-semibold text-[#073159] hover:text-blue-700 hover:underline">
                    Forgot password?
                </a>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#073159] hover:bg-[#062a4d] text-white font-bold py-3 lg:py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transform transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-sm lg:text-base"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Login to Account
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
          </form>

          {/* Footer Help */}
          <div className="mt-6 lg:mt-8 text-center">
            <p className="text-xs text-gray-500">
                Need help? Contact IT Support at <br />
                <a href="mailto:urbanvitalsupport@gmail.com" className="font-semibold text-[#073159] hover:underline">
                    urbanvitalsupport@gmail.com
                </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}