import { useState } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Save, 
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function PharmacySettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [lowStockThreshold, setLowStockThreshold] = useState(20);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Pharmacy Configuration</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- Settings Menu (Horizontal scroll on mobile, Vertical on Desktop) --- */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "profile" 
                  ? "bg-teal-50 text-teal-700 border-teal-600" 
                  : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <User size={18} /> <span className="whitespace-nowrap">My Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "security" 
                  ? "bg-teal-50 text-teal-700 border-teal-600" 
                  : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <Lock size={18} /> <span className="whitespace-nowrap">Security</span>
            </button>
            <button 
              onClick={() => setActiveTab("alerts")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "alerts" 
                  ? "bg-teal-50 text-teal-700 border-teal-600" 
                  : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <Bell size={18} /> <span className="whitespace-nowrap">Inventory Alerts</span>
            </button>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[400px]">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Pharmacist Profile</h2>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  <div className="h-20 w-20 rounded-full bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">JD</div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-gray-800">John Doe</h3>
                    <p className="text-xs text-gray-500 mb-2">Head Pharmacist</p>
                    <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input type="text" defaultValue="John Doe" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">License Number</label>
                    <input type="text" defaultValue="PHARM-99283" className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-gray-50 text-gray-500 cursor-not-allowed text-sm" readOnly />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input type="email" defaultValue="pharmacy@urbanvital.com" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input type="tel" defaultValue="054 123 4567" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-colors text-sm" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 w-full sm:w-auto justify-center active:scale-95 transition-transform">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-teal-500 transition-all text-sm" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 w-full sm:w-auto justify-center active:scale-95 transition-transform">
                    <ShieldCheck size={16} /> Update Password
                  </button>
                </div>
              </div>
            )}

            {/* --- INVENTORY ALERTS TAB --- */}
            {activeTab === "alerts" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Stock Notifications</h2>
                
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                      <h4 className="font-bold text-orange-800 text-sm">Low Stock Threshold</h4>
                      <p className="text-xs text-orange-700 mt-1">
                          System will flag drugs as "Low Stock" when quantity drops below this level.
                      </p>
                  </div>
                </div>

                <div className="space-y-6 max-w-md">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Global Minimum Quantity</label>
                      <div className="flex items-center gap-4">
                          <input 
                              type="range" 
                              min="5" 
                              max="100" 
                              value={lowStockThreshold} 
                              onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                          />
                          <div className="h-10 w-12 flex items-center justify-center bg-teal-50 border border-teal-100 rounded-lg font-bold text-teal-700">
                              {lowStockThreshold}
                          </div>
                      </div>
                  </div>

                  <div className="pt-2 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <input type="checkbox" className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300" defaultChecked />
                          <span className="text-sm font-medium text-gray-700">Email me daily low stock reports</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <input type="checkbox" className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300" defaultChecked />
                          <span className="text-sm font-medium text-gray-700">Alert 3 months before expiry</span>
                      </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg shadow-blue-900/20 w-full sm:w-auto justify-center active:scale-95 transition-transform">
                    <Save size={16} /> Save Preferences
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