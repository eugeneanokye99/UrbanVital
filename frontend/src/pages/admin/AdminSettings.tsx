import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  User, 
  Bell, 
  Save, 
  Building,
  Globe,
  Mail
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // --- State for Profile Form ---
  const [profile, setProfile] = useState({
    name: "Dr. Kwame Mensah",
    email: "admin@urbanvital.com",
  });

  // --- State for System Config ---
  const [config, setConfig] = useState({
    clinicName: "UrbanVital Health Consult",
    fee: "150.00",
    url: "portal.urbanvital.com",
    address: "123 Independence Avenue, Accra, Ghana"
  });

  // --- State for Notifications ---
  const [notifs, setNotifs] = useState({
    dailyReport: true,
    lowStock: true,
    loginAlert: false
  });

  // --- Handlers ---
  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings updated successfully!");
    }, 800);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            
            <h1 className="text-xl md:text-2xl font-bold text-[#073159] mb-6">
              Global Configuration & Settings
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* --- Settings Menu (Horizontal scroll on mobile, Vertical on Desktop) --- */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 outline-none focus:bg-gray-50 ${
                        activeTab === "profile" 
                        ? "bg-blue-50 text-[#073159] border-[#073159]" 
                        : "text-gray-600 hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <User size={18} /> <span className="whitespace-nowrap">My Profile</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("system")}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 outline-none focus:bg-gray-50 ${
                        activeTab === "system" 
                        ? "bg-blue-50 text-[#073159] border-[#073159]" 
                        : "text-gray-600 hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <Building size={18} /> <span className="whitespace-nowrap">System Config</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("notifications")}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 outline-none focus:bg-gray-50 ${
                        activeTab === "notifications" 
                        ? "bg-blue-50 text-[#073159] border-[#073159]" 
                        : "text-gray-600 hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <Bell size={18} /> <span className="whitespace-nowrap">Notifications</span>
                  </button>
                </div>
              </div>

              {/* --- Content Area --- */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[400px]">
                  
                  {/* --- PROFILE TAB --- */}
                  {activeTab === "profile" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Admin Profile</h2>
                      
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                        <div className="h-20 w-20 rounded-full bg-[#073159] text-white flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white ring-1 ring-gray-100 shrink-0">
                            AD
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="font-bold text-gray-800 text-lg">Super Administrator</h3>
                          <p className="text-sm text-gray-500 mb-2">System Owner</p>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                            MASTER ACCESS
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] transition-colors text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin ID</label>
                          <input type="text" defaultValue="ADMIN-001" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed text-sm font-mono" readOnly />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Email</label>
                          <div className="relative">
                            <input 
                                type="email" 
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] transition-colors text-sm" 
                            />
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 w-full sm:w-auto justify-center transition-all active:scale-95 disabled:opacity-70"
                        >
                          {loading ? "Saving..." : <><Save size={16} /> Update Profile</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- SYSTEM CONFIG TAB --- */}
                  {activeTab === "system" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Clinic Configuration</h2>
                      
                      <div className="space-y-4 md:space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Name</label>
                          <div className="relative">
                            <input 
                                type="text" 
                                value={config.clinicName}
                                onChange={(e) => setConfig({...config, clinicName: e.target.value})}
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm font-bold text-[#073159]" 
                            />
                            <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Consultation Fee (Default)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500 font-bold">₵</span>
                                    <input 
                                        type="number" 
                                        value={config.fee}
                                        onChange={(e) => setConfig({...config, fee: e.target.value})}
                                        className="w-full pl-8 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm font-mono" 
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website / Portal URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={config.url}
                                        onChange={(e) => setConfig({...config, url: e.target.value})}
                                        className="w-full pl-10 p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm" 
                                    />
                                </div>
                             </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                            <textarea 
                                value={config.address}
                                onChange={(e) => setConfig({...config, address: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm h-24 resize-none"
                            ></textarea>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg w-full sm:w-auto justify-center transition-all active:scale-95 disabled:opacity-70"
                        >
                          {loading ? "Saving..." : <><Save size={16} /> Save System Config</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* --- NOTIFICATIONS TAB --- */}
                  {activeTab === "notifications" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Alert Preferences</h2>
                      
                      <div className="space-y-3 md:space-y-4">
                        
                        {/* Notification Item 1 */}
                        <label className="p-4 border border-gray-100 rounded-xl flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 rounded text-[#073159] focus:ring-[#073159] border-gray-300 cursor-pointer" 
                                checked={notifs.dailyReport}
                                onChange={(e) => setNotifs({...notifs, dailyReport: e.target.checked})}
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Daily Financial Report</p>
                                <p className="text-xs text-gray-500">Receive a summary of revenue and expenses every evening at 6 PM.</p>
                            </div>
                        </label>

                        {/* Notification Item 2 */}
                        <label className="p-4 border border-gray-100 rounded-xl flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 rounded text-[#073159] focus:ring-[#073159] border-gray-300 cursor-pointer" 
                                checked={notifs.lowStock}
                                onChange={(e) => setNotifs({...notifs, lowStock: e.target.checked})}
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800">Low Stock Alerts</p>
                                <p className="text-xs text-gray-500">Get notified immediately when pharmacy inventory drops below minimum levels.</p>
                            </div>
                        </label>

                        {/* Notification Item 3 */}
                        <label className="p-4 border border-gray-100 rounded-xl flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 rounded text-[#073159] focus:ring-[#073159] border-gray-300 cursor-pointer" 
                                checked={notifs.loginAlert}
                                onChange={(e) => setNotifs({...notifs, loginAlert: e.target.checked})}
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-800">System Login Alerts</p>
                                <p className="text-xs text-gray-500">Receive an email whenever a new staff account is created or a suspicious login occurs.</p>
                            </div>
                        </label>

                      </div>

                      <div className="pt-4 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg w-full sm:w-auto justify-center transition-all active:scale-95 disabled:opacity-70"
                        >
                          {loading ? "Saving..." : <><Save size={16} /> Save Preferences</>}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}