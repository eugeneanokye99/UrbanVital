import { 
  ClipboardList, 
  Download, 
  Printer, 
  Eye,
  Filter
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

interface LabContextType {
    globalSearch: string;
}

export default function LabCompletedResults() {
  const navigate = useNavigate();
  // 1. Get search query from the Layout
  const { globalSearch } = useOutletContext<LabContextType>();
  
  // Local state for date filtering
  const [dateFilter, setDateFilter] = useState("");

  // Mock History Data (Enhanced with patient details for the report view)
  const history = [
    { id: 101, request_id: "REQ-101", patient: "Sarah Mensah", mrn: "UV-2025-0422", age: 45, gender: "Female", test: "Malaria RDT", result: "Negative", date: "2025-10-24", time: "10:30 AM", tech: "Alex" },
    { id: 102, request_id: "REQ-102", patient: "John Doe", mrn: "UV-2025-0012", age: 32, gender: "Male", test: "Typhoid (Widal)", result: "Reactive 1:80", date: "2025-10-23", time: "09:15 AM", tech: "Alex" },
    { id: 103, request_id: "REQ-103", patient: "Ama Kyei", mrn: "UV-2025-0424", age: 28, gender: "Female", test: "H. Pylori", result: "Positive", date: "2025-10-23", time: "02:00 PM", tech: "Sarah" },
    { id: 104, request_id: "REQ-104", patient: "Emmanuel Osei", mrn: "UV-2025-0423", age: 31, gender: "Male", test: "FBC", result: "Hb 12.5 g/dL", date: "2025-10-22", time: "04:45 PM", tech: "Kofi" },
  ];

  // 2. Filter Logic (Global Search + Date)
  const filteredHistory = history.filter(record => {
    const searchLower = globalSearch.toLowerCase();
    const matchesSearch = 
        record.patient.toLowerCase().includes(searchLower) || 
        record.test.toLowerCase().includes(searchLower) ||
        record.mrn.toLowerCase().includes(searchLower);
    
    const matchesDate = dateFilter ? record.date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  // --- Handlers ---

  const handleViewReport = (record: any) => {
    // Navigate to the printable report view with data
    navigate("/lab/labresult-view", { 
        state: { 
            record: {
                id: record.request_id,
                test: record.test,
                date: record.date,
                time: record.time,
                result: record.result,
                tech: record.tech
            },
            patient: {
                name: record.patient,
                age: record.age,
                gender: record.gender,
                mrn: record.mrn
            }
        } 
    });
  };

  const handleReprint = (id: string) => {
    toast.success(`Sent Report #${id} to printer`);
  };

  const handleExport = () => {
    toast.success("Downloading Excel report...");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Lab Records / Archive
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">View and manage past test results.</p>
        </div>
        
        <button 
            onClick={handleExport}
            className="w-full sm:w-auto text-sm font-bold text-[#073159] hover:bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 transform"
        >
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar: Date Filter */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50 justify-end">
          <div className="w-full sm:w-auto flex items-center gap-2">
             <Filter size={18} className="text-gray-400" />
             <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto p-2 border border-gray-200 rounded-xl bg-white text-gray-600 outline-none text-sm focus:border-[#073159] cursor-pointer" 
             />
             {dateFilter && (
                 <button onClick={() => setDateFilter("")} className="text-xs text-red-500 hover:underline">Clear</button>
             )}
          </div>
        </div>

        {/* Table with Horizontal Scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Test Performed</th>
                <th className="px-6 py-4">Summary Result</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-gray-500">{record.date}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{record.patient}</p>
                    <p className="text-xs text-gray-500">{record.mrn}</p>
                  </td>
                  <td className="px-6 py-4 text-[#073159] font-medium">{record.test}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        record.result.includes("Negative") ? "bg-green-100 text-green-700" :
                        record.result.includes("Positive") || record.result.includes("Reactive") ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                    }`}>
                        {record.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{record.tech}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleViewReport(record)}
                        className="p-2 text-gray-500 hover:text-[#073159] hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View Full Report"
                      >
                          <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleReprint(record.request_id)}
                        className="p-2 text-gray-500 hover:text-[#073159] hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Reprint"
                      >
                          <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm">
                <p>No records found matching your filters.</p>
            </div>
        )}
      </div>

    </div>
  );
}