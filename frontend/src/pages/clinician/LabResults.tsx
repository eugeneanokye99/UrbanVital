import { useState, useMemo } from "react";
import { 
  TestTube, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import ClinicianSidebar from "../../components/ClinicianSidebar";
import ClinicianNavbar from "../../components/ClinicianNavbar";

export default function ClinicianLabResults() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedResultId, setSelectedResultId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. COMPREHENSIVE MOCK DATABASE ---
  // This represents data "Captured by Lab Technicians"
  const allLabResults = [
    { 
      id: 1, 
      patient: "Williams Boampong", 
      mrn: "UV-2025-0421", 
      test: "Full Blood Count (FBC)", 
      date: "Today, 10:30 AM", 
      status: "Critical",
      labRef: "LAB-88392",
      technician: "Alex (Lab)",
      completedAt: "Oct 24, 2025 • 10:45 AM",
      note: "WBC significantly elevated. Immediate review required.",
      parameters: [
        { name: "Hemoglobin (Hb)", value: 10.5, unit: "g/dL", min: 11.5, max: 16.5, status: "Low" },
        { name: "White Blood Cells", value: 14.2, unit: "x10^9/L", min: 4.0, max: 11.0, status: "High" },
        { name: "Platelets", value: 180, unit: "x10^9/L", min: 150, max: 400, status: "Normal" },
      ]
    },
    { 
      id: 2, 
      patient: "Sarah Mensah", 
      mrn: "UV-2025-0422", 
      test: "Malaria RDT & Microscopy", 
      date: "Today, 09:15 AM", 
      status: "Normal",
      labRef: "LAB-88393",
      technician: "Sarah (Lab)",
      completedAt: "Oct 24, 2025 • 09:30 AM",
      note: "No malaria parasites seen.",
      parameters: [
        { name: "RDT Result", value: "Negative", unit: "", min: "-", max: "-", status: "Normal" },
        { name: "Parasite Count", value: "0", unit: "mps", min: "0", max: "0", status: "Normal" },
      ]
    },
    { 
      id: 3, 
      patient: "Emmanuel Osei", 
      mrn: "UV-2025-0423", 
      test: "Lipid Profile", 
      date: "Yesterday, 4:00 PM", 
      status: "Abnormal",
      labRef: "LAB-88380",
      technician: "Kofi (Lab)",
      completedAt: "Oct 23, 2025 • 04:15 PM",
      note: "Cholesterol levels slightly above range. Diet advice recommended.",
      parameters: [
        { name: "Total Cholesterol", value: 6.2, unit: "mmol/L", min: 0, max: 5.2, status: "High" },
        { name: "HDL Cholesterol", value: 1.1, unit: "mmol/L", min: 1.0, max: 3.0, status: "Normal" },
        { name: "LDL Cholesterol", value: 4.1, unit: "mmol/L", min: 0, max: 3.4, status: "High" },
      ]
    },
    { 
      id: 4, 
      patient: "Ama Kyei", 
      mrn: "UV-2025-0424", 
      test: "Urine Routine", 
      date: "Yesterday, 2:00 PM", 
      status: "Normal",
      labRef: "LAB-88375",
      technician: "Alex (Lab)",
      completedAt: "Oct 23, 2025 • 02:30 PM",
      note: "Sample clear. No abnormalities detected.",
      parameters: [
        { name: "Appearance", value: "Clear", unit: "", min: "-", max: "-", status: "Normal" },
        { name: "pH", value: "6.5", unit: "", min: "4.5", max: "8.0", status: "Normal" },
        { name: "Protein", value: "Negative", unit: "", min: "-", max: "-", status: "Normal" },
      ]
    },
  ];

  // --- 2. FILTER LOGIC ---
  const filteredResults = useMemo(() => {
    return allLabResults.filter(item => {
      // Filter by Tab
      const matchesTab = activeTab === "all" ? true : item.status === activeTab;
      // Filter by Search
      const matchesSearch = 
        item.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.mrn.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  // --- 3. GET CURRENTLY SELECTED DETAILS ---
  const selectedResult = allLabResults.find(r => r.id === selectedResultId) || allLabResults[0];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ClinicianSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Results Today" value={allLabResults.length.toString()} icon={<TestTube size={20} />} color="bg-blue-50 text-blue-600" />
              <StatCard label="Critical Alerts" value="1" icon={<AlertTriangle size={20} />} color="bg-red-50 text-red-600" />
              <StatCard label="Pending Lab" value="3" icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
              <StatCard label="Total Verified" value="45" icon={<CheckCircle size={20} />} color="bg-green-50 text-green-600" />
            </div>

            {/* Main Content Split */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
              
              {/* --- LEFT: INBOX LIST --- */}
              <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                
                {/* Search & Filter */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search patient name or MRN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['all', 'Critical', 'Abnormal', 'Normal'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          activeTab === tab ? "bg-[#073159] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List Items */}
                <div className="flex-1 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedResultId(item.id)}
                        className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 ${
                          selectedResultId === item.id ? "bg-blue-50 border-l-4 border-l-[#073159]" : "border-l-4 border-l-transparent"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`font-bold text-sm ${selectedResultId === item.id ? "text-[#073159]" : "text-gray-800"}`}>
                            {item.patient}
                          </h4>
                          <span className="text-[10px] text-gray-400">{item.date}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{item.test}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <span className="text-[10px] font-mono text-gray-400">{item.mrn}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No results found.
                    </div>
                  )}
                </div>
              </div>

              {/* --- RIGHT: DETAILED REPORT VIEW --- */}
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                
                {/* Detail Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {selectedResult.patient.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#073159]">{selectedResult.patient}</h2>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><FileText size={12}/> Ref: {selectedResult.labRef}</span>
                        <span>•</span>
                        <span>Tech: {selectedResult.technician}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                    <Download size={14} /> PDF Report
                  </button>
                </div>

                {/* Result Table Container */}
                <div className="flex-1 overflow-y-auto p-6">
                  
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{selectedResult.test}</h3>
                      <p className="text-sm text-gray-500">Authorized by {selectedResult.technician}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">{selectedResult.completedAt}</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                          <th className="px-6 py-3">Parameter</th>
                          <th className="px-6 py-3 text-center">Result</th>
                          <th className="px-6 py-3 text-center hidden md:table-cell">Reference</th>
                          <th className="px-6 py-3 text-center">Trend/Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {selectedResult.parameters.map((param, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-700">
                              {param.name}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-bold text-base ${
                                param.status === "High" ? "text-red-600" :
                                param.status === "Low" ? "text-orange-500" :
                                "text-gray-800"
                              }`}>
                                {param.value}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">{param.unit}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-500 text-xs hidden md:table-cell">
                              {param.min} - {param.max}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {param.status === "High" && <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full"><TrendingUp size={12}/> HIGH</span>}
                                {param.status === "Low" && <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full"><TrendingDown size={12}/> LOW</span>}
                                {param.status === "Normal" && <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle size={12}/> OK</span>}
                              </div>
                              
                              {/* Visual Range Bar (Visualizer) */}
                              <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-2 mx-auto relative hidden md:block overflow-hidden">
                                {/* Safe Range Zone (Middle) */}
                                <div className="absolute left-[30%] width-[40%] h-full bg-green-200/50 w-2/5"></div>
                                {/* Marker */}
                                <div 
                                  className={`absolute h-full w-1 top-0 ${
                                    param.status === "Normal" ? "bg-green-500 left-1/2" :
                                    param.status === "High" ? "bg-red-500 left-[85%]" :
                                    "bg-orange-500 left-[15%]"
                                  }`}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tech Comments */}
                  <div className={`mt-8 p-4 border rounded-xl flex gap-3 ${
                    selectedResult.status === "Critical" ? "bg-red-50 border-red-100" :
                    selectedResult.status === "Abnormal" ? "bg-orange-50 border-orange-100" :
                    "bg-blue-50 border-blue-100"
                  }`}>
                    <Info size={20} className={`${
                       selectedResult.status === "Critical" ? "text-red-600" :
                       selectedResult.status === "Abnormal" ? "text-orange-600" :
                       "text-blue-600"
                    }`} />
                    <div>
                        <h4 className={`font-bold text-sm mb-1 ${
                            selectedResult.status === "Critical" ? "text-red-800" :
                            selectedResult.status === "Abnormal" ? "text-orange-800" :
                            "text-blue-800"
                        }`}>Lab Technician Note:</h4>
                        <p className={`text-sm ${
                            selectedResult.status === "Critical" ? "text-red-700" :
                            selectedResult.status === "Abnormal" ? "text-orange-700" :
                            "text-blue-700"
                        }`}>
                            {selectedResult.note}
                        </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "Critical") return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={10} /> Critical</span>;
    if (status === "Abnormal") return <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Abnormal</span>;
    return <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded">Normal</span>;
}