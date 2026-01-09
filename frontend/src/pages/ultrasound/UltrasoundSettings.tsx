import { useState, useEffect } from "react";
import { 
  User, 
  Save, 
  FileText,
  Monitor,
  Plus,
  Loader2,
} from "lucide-react";
import { 
  fetchUltrasoundEquipment, 
  createUltrasoundEquipment, 
  updateUltrasoundEquipment 
} from "../../services/api";
import toast from "react-hot-toast";

export default function UltrasoundSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    model: "",
    serial_number: "",
    manufacturer: "",
    status: "Operational",
    location: ""
  });

  useEffect(() => {
    if (activeTab === "devices") {
      loadEquipment();
    }
  }, [activeTab]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await fetchUltrasoundEquipment();
      setEquipment(data.results || data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
      toast.error("Failed to load equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name.trim()) {
      toast.error("Equipment name is required");
      return;
    }
    try {
      setLoading(true);
      await createUltrasoundEquipment(newEquipment);
      toast.success("Equipment added successfully");
      setShowAddEquipment(false);
      setNewEquipment({
        name: "",
        model: "",
        serial_number: "",
        manufacturer: "",
        status: "Operational",
        location: ""
      });
      await loadEquipment();
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast.error("Failed to add equipment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipmentStatus = async (id: number, status: string) => {
    try {
      await updateUltrasoundEquipment(id, { status });
      toast.success("Equipment status updated");
      await loadEquipment();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast.error("Failed to update equipment");
    }
  };

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
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h2 className="text-lg font-bold text-gray-800">Equipment Management</h2>
                  <button
                    onClick={() => setShowAddEquipment(!showAddEquipment)}
                    className="bg-[#073159] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d]"
                  >
                    <Plus size={16} /> Add Equipment
                  </button>
                </div>
                
                {showAddEquipment && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="font-bold text-gray-700">New Equipment</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Equipment Name *"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Model"
                        value={newEquipment.model}
                        onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Serial Number"
                        value={newEquipment.serial_number}
                        onChange={(e) => setNewEquipment({...newEquipment, serial_number: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Manufacturer"
                        value={newEquipment.manufacturer}
                        onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={newEquipment.location}
                        onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      />
                      <select
                        value={newEquipment.status}
                        onChange={(e) => setNewEquipment({...newEquipment, status: e.target.value})}
                        className="w-full p-2 rounded-lg border outline-none focus:border-[#073159] text-sm"
                      >
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Out of Service">Out of Service</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowAddEquipment(false)}
                        className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEquipment}
                        disabled={loading}
                        className="px-4 py-2 bg-[#073159] text-white rounded-lg text-sm font-bold hover:bg-[#062a4d] flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Add Equipment
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {loading && !showAddEquipment ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
                    </div>
                  ) : equipment.length > 0 ? (
                    equipment.map((item: any) => (
                      <div 
                        key={item.id}
                        className={`p-4 border rounded-xl flex items-center justify-between ${
                          item.status === 'Operational' 
                            ? 'border-green-200 bg-green-50' 
                            : item.status === 'Maintenance'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-white rounded-lg ${
                            item.status === 'Operational' 
                              ? 'text-green-600' 
                              : item.status === 'Maintenance'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            <Monitor size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">
                              {item.model && `${item.model} • `}
                              {item.manufacturer && `${item.manufacturer} • `}
                              {item.location || "No location"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateEquipmentStatus(item.id, e.target.value)}
                            className="text-xs font-bold px-2 py-1 rounded border bg-white"
                          >
                            <option value="Operational">Operational</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Out of Service">Out of Service</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Monitor size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No equipment registered</p>
                      <p className="text-xs mt-1">Add equipment to manage your ultrasound machines</p>
                    </div>
                  )}
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