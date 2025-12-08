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

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // --- State ---
  const [profile, setProfile] = useState({
    name: "Dr. Kwame Mensah",
    email: "admin@urbanvital.com",
  });

  const [config, setConfig] = useState({
    clinicName: "UrbanVital Health Consult",
    fee: "150.00",
    url: "portal.urbanvital.com",
    address: "123 Independence Avenue, Accra, Ghana"
  });

  const [notifs, setNotifs] = useState({
    dailyReport: true,
    lowStock: true,
    loginAlert: false
  });

  // --- Handlers ---
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings updated successfully!");
    }, 800);
  };

  const navItems = [
    { id: "profile", label: "My Profile", icon: <User size={18} /> },
    { id: "system", label: "System Config", icon: <Building size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <h1 className="text-xl md:text-2xl font-bold text-[#073159]">
        Global Configuration & Settings
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- Settings Menu --- */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 outline-none focus:bg-gray-50 ${
                    activeTab === item.id 
                    ? "bg-blue-50 text-[#073159] border-[#073159]" 
                    : "text-gray-600 hover:bg-gray-50 border-transparent"
                }`}
              >
                {item.icon} <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
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
                  <FormInput label="Full Name" value={profile.name} onChange={(e: any) => setProfile({...profile, name: e.target.value})} />
                  <FormInput label="Admin ID" value="ADMIN-001" readOnly bg="bg-gray-50" />
                  <div className="md:col-span-2 relative">
                    <FormInput label="Official Email" type="email" value={profile.email} onChange={(e: any) => setProfile({...profile, email: e.target.value})} pl="pl-10" />
                    <Mail className="absolute left-3 top-8 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <SaveButton onClick={handleSave} loading={loading} label="Update Profile" />
                </div>
              </div>
            )}

            {/* --- SYSTEM CONFIG TAB --- */}
            {activeTab === "system" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Clinic Configuration</h2>
                
                <div className="space-y-4 md:space-y-6">
                  <div className="relative">
                      <FormInput label="Clinic Name" value={config.clinicName} onChange={(e: any) => setConfig({...config, clinicName: e.target.value})} pl="pl-10" font="font-bold text-[#073159]" />
                      <Building className="absolute left-3 top-8 text-gray-400" size={18} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                       <div className="relative">
                          <FormInput label="Consultation Fee" type="number" value={config.fee} onChange={(e: any) => setConfig({...config, fee: e.target.value})} pl="pl-8" font="font-mono" />
                          <span className="absolute left-3 top-8 text-gray-500 font-bold">₵</span>
                       </div>
                       <div className="relative">
                          <FormInput label="Portal URL" value={config.url} onChange={(e: any) => setConfig({...config, url: e.target.value})} pl="pl-10" />
                          <Globe className="absolute left-3 top-8 text-gray-400" size={18} />
                       </div>
                  </div>
                  
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                      <textarea 
                          value={config.address}
                          onChange={(e) => setConfig({...config, address: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm h-24 resize-none transition-colors"
                      ></textarea>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <SaveButton onClick={handleSave} loading={loading} label="Save System Config" />
                </div>
              </div>
            )}

            {/* --- NOTIFICATIONS TAB --- */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Alert Preferences</h2>
                
                <div className="space-y-3 md:space-y-4">
                  <NotificationItem 
                      label="Daily Financial Report" 
                      desc="Receive a summary of revenue and expenses every evening at 6 PM." 
                      checked={notifs.dailyReport}
                      onChange={(e: any) => setNotifs({...notifs, dailyReport: e.target.checked})}
                  />
                  <NotificationItem 
                      label="Low Stock Alerts" 
                      desc="Get notified immediately when pharmacy inventory drops below minimum levels." 
                      checked={notifs.lowStock}
                      onChange={(e: any) => setNotifs({...notifs, lowStock: e.target.checked})}
                  />
                  <NotificationItem 
                      label="System Login Alerts" 
                      desc="Receive an email whenever a new staff account is created or a suspicious login occurs." 
                      checked={notifs.loginAlert}
                      onChange={(e: any) => setNotifs({...notifs, loginAlert: e.target.checked})}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <SaveButton onClick={handleSave} loading={loading} label="Save Preferences" />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

// --- Reusable Components ---

function FormInput({ label, type = "text", value, onChange, readOnly = false, pl = "", font = "", bg = "" }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            <input 
                type={type} 
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#073159] transition-colors text-sm ${pl} ${font} ${bg} ${readOnly ? 'cursor-not-allowed text-gray-500' : ''}`} 
            />
        </div>
    )
}

function NotificationItem({ label, desc, checked, onChange }: any) {
    return (
        <label className="p-4 border border-gray-100 rounded-xl flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer select-none">
            <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded text-[#073159] focus:ring-[#073159] border-gray-300 cursor-pointer accent-[#073159]" 
                checked={checked}
                onChange={onChange}
            />
            <div>
                <p className="text-sm font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </label>
    )
}

function SaveButton({ onClick, loading, label }: any) {
    return (
        <button 
            onClick={onClick}
            disabled={loading}
            className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg w-full sm:w-auto justify-center transition-all active:scale-95 disabled:opacity-70"
        >
            {loading ? "Saving..." : <><Save size={16} /> {label}</>}
        </button>
    )
}