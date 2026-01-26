import { useState, useMemo } from "react";
import { 
  Search, 
  Calendar, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- Mock Data for Lab Records ---
const MOCK_RECORDS = [
  { 
    id: "LAB-2024-001", 
    patient: "Sarah Mensah", 
    testName: "Full Blood Count (FBC)", 
    date: "2024-01-26 09:30 AM", 
    doctor: "Dr. Opoku", 
    status: "Completed", 
    technician: "Kwame Tech",
    results: [
      { param: "Hemoglobin", value: "12.5", unit: "g/dL", refRange: "11.5-16.5", flag: "Normal" },
      { param: "WBC", value: "14.2", unit: "x10^9/L", refRange: "4.0-11.0", flag: "High" },
      { param: "Platelets", value: "250", unit: "x10^9/L", refRange: "150-400", flag: "Normal" },
    ]
  },
  { 
    id: "LAB-2024-002", 
    patient: "Emmanuel Osei", 
    testName: "Malaria Parasite", 
    date: "2024-01-26 10:15 AM", 
    doctor: "Dr. Ama", 
    status: "Completed", 
    technician: "Kwame Tech",
    results: [
      { param: "Parasite Density", value: "++", unit: "", refRange: "Negative", flag: "Positive" }
    ]
  },
  { 
    id: "LAB-2024-003", 
    patient: "John Doe", 
    testName: "Widal Test", 
    date: "2024-01-26 11:00 AM", 
    doctor: "Dr. Kwame", 
    status: "Pending", 
    technician: "-",
    results: []
  },
  { 
    id: "LAB-2024-004", 
    patient: "Grace Antwi", 
    testName: "Lipid Profile", 
    date: "2024-01-25 02:45 PM", 
    doctor: "Dr. Opoku", 
    status: "In Progress", 
    technician: "Sarah Lab",
    results: []
  },
];

export default function AdminLabRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Modal State
  const [viewingRecord, setViewingRecord] = useState<any>(null);

  // --- Filter Logic ---
  const filteredRecords = useMemo(() => {
    return MOCK_RECORDS.filter(record => {
      const matchesSearch = 
        record.patient.toLowerCase().includes(searchQuery.toLowerCase()) || 
        record.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "All" ? true : record.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // --- Handlers ---
  const handlePrintResult = () => {
    toast.success("Downloading Lab Report...");
    // In a real app, this would trigger a PDF generation
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-200";
      case "Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "In Progress": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
            <FileText className="w-8 h-8" /> Laboratory Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">Audit trail of all diagnostic tests performed.</p>
        </div>
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patient, test or ID..." 
              className="pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:border-[#073159] outline-none w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2.5 border rounded-xl bg-white outline-none focus:border-[#073159] font-medium text-gray-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Record ID</th>
                <th className="px-6 py-4">Patient & Doctor</th>
                <th className="px-6 py-4">Test Details</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-[#073159] font-bold">{record.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{record.patient}</div>
                      <div className="text-xs text-gray-500">Ref: {record.doctor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{record.testName}</div>
                      {record.technician !== "-" && (
                        <div className="text-xs text-gray-400 mt-0.5">Tech: {record.technician}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {record.date.split(' ')[0]}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1 text-gray-400">
                        <Clock size={12} /> {record.date.split(' ').slice(1).join(' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {record.status === "Completed" ? (
                        <button 
                          onClick={() => setViewingRecord(record)}
                          className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={14} /> View Result
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Result</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={32} className="opacity-20" />
                        <p>No lab records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW RESULT MODAL --- */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-[#073159]">Lab Result</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">Finalized</span>
                </div>
                <p className="text-sm text-gray-500">Result ID: <span className="font-mono text-gray-700">{viewingRecord.id}</span></p>
              </div>
              <button onClick={() => setViewingRecord(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
                
                {/* Patient Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Patient Name</span>
                        <p className="font-bold text-gray-800">{viewingRecord.patient}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Requested By</span>
                        <p className="font-bold text-gray-800">{viewingRecord.doctor}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Test Type</span>
                        <p className="font-bold text-[#073159]">{viewingRecord.testName}</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Date Verified</span>
                        <p className="font-bold text-gray-800">{viewingRecord.date}</p>
                    </div>
                </div>

                {/* Results Table */}
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 border-b pb-2">Parameter Details</h4>
                <div className="border rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Parameter</th>
                                <th className="px-4 py-3 text-left">Result</th>
                                <th className="px-4 py-3 text-left">Units</th>
                                <th className="px-4 py-3 text-left">Ref. Range</th>
                                <th className="px-4 py-3 text-center">Flag</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {viewingRecord.results.map((res: any, idx: number) => (
                                <tr key={idx} className={res.flag === "High" || res.flag === "Low" || res.flag === "Positive" ? "bg-red-50/50" : ""}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{res.param}</td>
                                    <td className="px-4 py-3 font-bold text-gray-900">{res.value}</td>
                                    <td className="px-4 py-3 text-gray-500">{res.unit}</td>
                                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{res.refRange}</td>
                                    <td className="px-4 py-3 text-center">
                                        {res.flag === "Normal" ? (
                                            <span className="text-green-600 font-bold text-xs flex items-center justify-center gap-1"><CheckCircle2 size={12}/> OK</span>
                                        ) : (
                                            <span className="text-red-600 font-bold text-xs flex items-center justify-center gap-1"><AlertCircle size={12}/> {res.flag.toUpperCase()}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Notes */}
                <div className="text-xs text-gray-400 italic">
                    <p>* These results have been electronically verified by {viewingRecord.technician}.</p>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button 
                    onClick={() => setViewingRecord(null)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors"
                >
                    Close
                </button>
                <button 
                    onClick={handlePrintResult}
                    className="px-5 py-2.5 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] shadow-lg flex items-center gap-2"
                >
                    <Download size={18} /> Download Report
                </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}