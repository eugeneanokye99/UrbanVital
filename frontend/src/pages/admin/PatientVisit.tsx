import { useState, useMemo } from "react";
import { 
  Users, Search,Plus, Clock,Stethoscope,Save,X,Activity,  Scan,FlaskConical,Filter, Layers} from "lucide-react";
import { toast } from "react-hot-toast";

export default function PatientVisits() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. Defined Categories & Departments ---
  const CATEGORIES = [
    "Walk-in",
    "Lab Only",
    "Imaging Only",
    "Lab and Imaging",
    "Lab and Consulting",
    "Lab, Imaging and Consulting"
  ];

  const DEPARTMENTS = [
    "Consultation",
    "Pharmacy",
    "Laboratory",
    "Imaging"
  ];

  // --- 2. Mock Data ---
  const [visits, setVisits] = useState([
    { id: "VST-1001", patient: "Sarah Mensah", category: "Walk-in", dept: "Consultation", time: "08:30 AM", status: "Completed", type: "General Checkup" },
    { id: "VST-1002", patient: "Emmanuel Osei", category: "Lab and Consulting", dept: "Laboratory", time: "09:15 AM", status: "In Progress", type: "Malaria Test & Review" },
    { id: "VST-1003", patient: "John Doe", category: "Lab Only", dept: "Laboratory", time: "10:00 AM", status: "Waiting", type: "Full Blood Count" },
    { id: "VST-1004", patient: "Grace Antwi", category: "Imaging Only", dept: "Imaging", time: "10:45 AM", status: "Completed", type: "Chest X-Ray" },
    { id: "VST-1005", patient: "Kwame Boateng", category: "Lab, Imaging and Consulting", dept: "Consultation", time: "11:20 AM", status: "In Progress", type: "Full Physical" },
  ]);

  // --- 3. Smart Statistics Logic ---
  const stats = {
    total: visits.length,
    // Count specific "Walk-in" category
    walkIns: visits.filter(v => v.category === "Walk-in").length,
    // Count ANY category that includes the word "Lab"
    totalLabs: visits.filter(v => v.category.includes("Lab")).length,
    // Count ANY category that includes the word "Imaging"
    totalImaging: visits.filter(v => v.category.includes("Imaging")).length,
  };

  // --- 4. Filter Logic ---
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      const matchesSearch = visit.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            visit.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" ? true : visit.status === statusFilter;
      const matchesType = typeFilter === "All Categories" ? true : visit.category === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [visits, searchQuery, statusFilter, typeFilter]);

  // --- 5. Handlers ---
  const handleRecordVisit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newVisit = {
      id: `VST-${Math.floor(1000 + Math.random() * 9000)}`,
      patient: formData.get("patient") as string,
      category: formData.get("category") as string,
      dept: formData.get("dept") as string,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Waiting",
      type: formData.get("type") as string,
    };

    setVisits([newVisit, ...visits]);
    setIsModalOpen(false);
    toast.success("Patient checked in successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700";
      case "In Progress": return "bg-blue-100 text-blue-700";
      case "Waiting": return "bg-orange-100 text-orange-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
      if (category === "Walk-in") return <Users size={14} className="text-blue-600" />;
      if (category === "Lab Only") return <FlaskConical size={14} className="text-teal-600" />;
      if (category === "Imaging Only") return <Scan size={14} className="text-purple-600" />;
      // For combinations like "Lab and Imaging", use a combo icon
      if (category.includes("and") || category.includes(",")) return <Layers size={14} className="text-indigo-600" />;
      return <Activity size={14} className="text-gray-600" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Users className="w-7 h-7" /> Patient Visits Log
          </h1>
          <p className="text-sm text-gray-500">Track patient flow across Lab, Imaging, and Consulting.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#073159] text-white rounded-xl font-bold shadow-lg hover:bg-[#062a4d] transition-transform active:scale-95"
        >
          <Plus size={18} /> Record New Visit
        </button>
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visits" value={stats.total} icon={<Users size={18}/>} color="bg-gray-100 text-gray-600" />
        <StatCard label="Walk-ins" value={stats.walkIns} icon={<Stethoscope size={18}/>} color="bg-blue-50 text-blue-600" />
        <StatCard label="Lab Orders" value={stats.totalLabs} subText="(Includes combos)" icon={<FlaskConical size={18}/>} color="bg-teal-50 text-teal-600" />
        <StatCard label="Imaging Orders" value={stats.totalImaging} subText="(Includes combos)" icon={<Scan size={18}/>} color="bg-purple-50 text-purple-600" />
      </div>

      {/* --- Filters & Search --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patient name or Visit ID..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <div className="relative">
                <Filter className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-[#073159] cursor-pointer appearance-none min-w-[180px]"
                >
                    <option>All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Status Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {["All", "Waiting", "In Progress", "Completed"].map((status) => (
                <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
                    statusFilter === status 
                    ? "bg-[#073159] text-white border-[#073159]" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
                >
                {status}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* --- Visits Table --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Visit ID</th>
                <th className="px-6 py-4">Patient Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Check-in Time</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[#073159] font-bold">{visit.id}</td>
                    <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{visit.patient}</p>
                        <p className="text-[10px] text-gray-400 font-normal truncate max-w-[150px]">{visit.type}</p>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            {getCategoryIcon(visit.category)}
                            <span className="text-gray-700 font-medium text-xs whitespace-nowrap">{visit.category}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                        <Clock size={14} /> {visit.time}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{visit.dept}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <Users className="w-10 h-10 opacity-20" />
                        <p>No visits found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- NEW VISIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#073159] text-white">
              <h3 className="font-bold flex items-center gap-2"> Record New Visit</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleRecordVisit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Patient Name *</label>
                <input name="patient" type="text" placeholder="Enter patient name" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159]" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Visit Category</label>
                    <select name="category" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159]">
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Specific Service</label>
                    <input name="type" type="text" placeholder="e.g. Malaria Test" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159]" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Assign Department</label>
                <select name="dept" className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:border-[#073159]">
                    {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95">
                    <Save size={18} /> Check-In Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Helper Component ---
function StatCard({ label, value, icon, color, subText }: any) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-28 transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-400 uppercase">{label}</span>
                <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
            </div>
            <div>
                <span className="text-2xl font-bold text-gray-800">{value}</span>
                {subText && <p className="text-[10px] text-gray-400 mt-1">{subText}</p>}
            </div>
        </div>
    )
}