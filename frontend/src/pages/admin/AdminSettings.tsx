import { useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Save, 
  Building,
  ShieldAlert,
  Palette,
  Check,
  Clock // Added Clock icon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext"; 

export default function AdminSettings() {
  const { themeColor, setThemeColor } = useTheme(); 
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    clinicName: "UrbanVital Health Consult",
    address: "Kejetia opp. Maternal and Children's Hospital \nAK-014-1117",
  });

  // FIXED: Added 'setAccessControl' to allow updates
  const [accessControl, setAccessControl] = useState({
    enabled: false,
    startTime: "08:00",
    endTime: "18:00"
  });

  const themes = [
    { name: "Urban Blue", color: "#073159" },
    { name: "Vital Green", color: "#166534" },
    { name: "Royal Purple", color: "#6b21a8" },
    { name: "Ocean Teal", color: "#0f766e" },
    { name: "Crimson", color: "#991b1b" },
    { name: "Slate", color: "#334155" },
  ];

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Saved:", config, accessControl); 
      toast.success("Settings applied successfully!");
    }, 800);
  };

  const navItems = [
    { id: "general", label: "General & Theme", icon: <Building size={18} /> },
    { id: "security", label: "Security & Access", icon: <ShieldAlert size={18} /> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--primary)' }}>
        System Configuration
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Settings Menu */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={activeTab === item.id ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 outline-none ${
                  activeTab === item.id 
                  ? "bg-gray-50" 
                  : "text-gray-600 hover:bg-gray-50 border-transparent"
                }`}
              >
                {item.icon} <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[400px]">
            
            {/* GENERAL TAB */}
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* Branding */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Clinic Information</h2>
                    <div className="space-y-4">
                      <div className="relative">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Name</label>
                          <input 
                            value={config.clinicName} 
                            onChange={(e) => setConfig({...config, clinicName: e.target.value})} 
                            style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            className="w-full p-3 pl-10 rounded-xl border outline-none font-bold text-sm bg-gray-50 focus:bg-white transition-colors" 
                          />
                          <Building className="absolute left-3 top-8 text-gray-400" size={18} />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                          <textarea 
                              value={config.address}
                              onChange={(e) => setConfig({...config, address: e.target.value})}
                              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-gray-400 text-sm h-24 resize-none transition-colors"
                          ></textarea>
                      </div>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-2">
                        <Palette size={20} style={{ color: 'var(--primary)' }} /> App Theme
                    </h2>
                    
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Primary Brand Color</label>
                        <div className="flex flex-wrap gap-4">
                            {themes.map((theme) => (
                                <button
                                    key={theme.color}
                                    onClick={() => setThemeColor(theme.color)} 
                                    className={`group relative w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
                                        themeColor === theme.color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                                    }`}
                                    style={{ backgroundColor: theme.color }}
                                    title={theme.name}
                                >
                                    {themeColor === theme.color && <Check className="text-white" size={20} strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            This color will be applied to the sidebar, buttons, and headers across the application instantly.
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    style={{ backgroundColor: 'var(--primary)' }}
                    className="text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg w-full sm:w-auto justify-center transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? "Saving..." : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB - UPDATED */}
            {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShieldAlert style={{ color: 'var(--primary)' }} size={20} /> Access Control
                    </h2>
                    
                    <div className={`p-5 rounded-xl border transition-colors duration-300 ${accessControl.enabled ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 cursor-pointer" 
                                style={{ accentColor: 'var(--primary)' }}
                                checked={accessControl.enabled}
                                onChange={(e) => setAccessControl({...accessControl, enabled: e.target.checked})}
                            />
                            <label className="text-gray-800 font-bold cursor-pointer" onClick={() => setAccessControl({...accessControl, enabled: !accessControl.enabled})}>
                                Enforce Working Hours
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            When enabled, staff accounts (Clinicians, Lab, Pharmacy) will only be able to log in during the specified time range. Admin accounts are exempt.
                        </p>

                        {/* Working Hours Inputs */}
                        {accessControl.enabled && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Time</label>
                                    <div className="relative">
                                        <input 
                                            type="time" 
                                            value={accessControl.startTime}
                                            onChange={(e) => setAccessControl({...accessControl, startTime: e.target.value})}
                                            className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ borderColor: 'var(--primary)' }} // Optional: Tint border
                                        />
                                        <Clock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Time</label>
                                    <div className="relative">
                                        <input 
                                            type="time" 
                                            value={accessControl.endTime}
                                            onChange={(e) => setAccessControl({...accessControl, endTime: e.target.value})}
                                            className="w-full p-3 pl-10 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ borderColor: 'var(--primary)' }}
                                        />
                                        <Clock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={handleSave}
                            style={{ backgroundColor: 'var(--primary)' }}
                            className="text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow-lg transition-all active:scale-95"
                        >
                            Update Security
                        </button>
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}