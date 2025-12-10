import { useState } from "react";
import { 
  User, 
  Save, 
  FileText,
  Monitor,
  Wifi
} from "lucide-react";

export default function UltrasoundSettings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Mock Templates State
  const [templates, setTemplates] = useState({
    abdominal: "Liver is normal in size and echotexture. Gallbladder is well distended...",
    pelvic: "Uterus is anteverted with normal dimensions. Endometrium is..."
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Ultrasound Configuration</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row lg:flex-col overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "profile" ? "bg-indigo-50 text-indigo-700 border-indigo-600" : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <User size={18} /> <span className="whitespace-nowrap">My Profile</span>
            </button>
            <button 
              onClick={() => setActiveTab("templates")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "templates" ? "bg-indigo-50 text-indigo-700 border-indigo-600" : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <FileText size={18} /> <span className="whitespace-nowrap">Report Templates</span>
            </button>
            <button 
              onClick={() => setActiveTab("devices")}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors border-b-2 lg:border-b-0 lg:border-l-4 ${
                  activeTab === "devices" ? "bg-indigo-50 text-indigo-700 border-indigo-600" : "text-gray-600 hover:bg-gray-50 border-transparent"
              }`}
            >
              <Monitor size={18} /> <span className="whitespace-nowrap">Machines & DICOM</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8 min-h-[400px]">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Sonographer Profile</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">SJ</div>
                  <div>
                    <h3 className="font-bold text-gray-800">Sonographer James</h3>
                    <p className="text-xs text-gray-500">Radiology Department</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
                    <input type="text" defaultValue="Sonographer James" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                    <input type="text" defaultValue="Senior Sonographer" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 text-sm" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg active:scale-95 transition-transform">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* --- TEMPLATES TAB --- */}
            {activeTab === "templates" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Default Report Text</h2>
                <p className="text-sm text-gray-500">Set standard text that loads automatically when you start a report.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Abdominal Template</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 text-sm h-32"
                            value={templates.abdominal}
                            onChange={(e) => setTemplates({...templates, abdominal: e.target.value})}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pelvic / OB Template</label>
                        <textarea 
                            className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-500 text-sm h-32"
                            value={templates.pelvic}
                            onChange={(e) => setTemplates({...templates, pelvic: e.target.value})}
                        ></textarea>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] shadow-lg active:scale-95 transition-transform">
                    <Save size={16} /> Update Templates
                  </button>
                </div>
              </div>
            )}

            {/* --- DEVICES TAB --- */}
            {activeTab === "devices" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Connected Machines</h2>
                
                <div className="space-y-4">
                    <div className="p-4 border border-green-200 bg-green-50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-green-600"><Monitor size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">GE Voluson E8</h4>
                                <p className="text-xs text-gray-500">IP: 192.168.1.50 • Port: 104</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded flex items-center gap-1"><Wifi size={12}/> Online</span>
                    </div>

                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex items-center justify-between opacity-70">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg text-gray-400"><Monitor size={20} /></div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Portable Mindray</h4>
                                <p className="text-xs text-gray-500">IP: 192.168.1.52 • Port: 104</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">Offline</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">DICOM Storage Server</h3>
                    <input type="text" defaultValue="192.168.1.100 (PACS)" className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-gray-50 text-sm" readOnly />
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}