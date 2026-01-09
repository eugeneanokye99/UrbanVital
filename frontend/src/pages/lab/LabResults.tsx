import { 
  ClipboardList, 
  Download, 
  Printer, 
  Eye,
  Filter,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchLabResults } from "../../services/api";

interface LabContextType {
    globalSearch: string;
}

export default function LabCompletedResults() {
  const navigate = useNavigate();
  const { globalSearch } = useOutletContext<LabContextType>();
  
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
  }, [dateFilter]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateFilter) {
        params.date_from = dateFilter;
        params.date_to = dateFilter;
      }
      const data = await fetchLabResults(params);
      setResults(data || []);
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic (Global Search)
  const filteredHistory = results.filter(record => {
    const searchLower = globalSearch.toLowerCase();
    const matchesSearch = 
        record.patient_name?.toLowerCase().includes(searchLower) || 
        record.patient_mrn?.toLowerCase().includes(searchLower) ||
        record.tests?.some((t: any) => t.test_name?.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  // --- Handlers ---

  const handleViewReport = (record: any) => {
    navigate("/lab/labresult-view", { 
        state: { 
            result: record,
            order: record.order,
            patient: {
                name: record.patient_name,
                age: record.patient_age,
                gender: record.patient_gender,
                mrn: record.patient_mrn
            }
        } 
    });
  };

  const handleReprint = (orderId: number) => {
    toast.success(`Sent Report for Order #${orderId} to printer`);
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

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
        </div>
      ) : (
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
                  <td className="px-6 py-4 font-mono text-gray-500">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{record.patient_name}</p>
                    <p className="text-xs text-gray-500">{record.patient_mrn}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {record.tests?.slice(0, 2).map((t: any, idx: number) => (
                        <span key={idx} className="text-[#073159] font-medium text-xs">
                          {t.test_name}{idx < Math.min(1, record.tests.length - 1) && ', '}
                        </span>
                      ))}
                      {record.tests?.length > 2 && (
                        <span className="text-xs text-gray-500">+{record.tests.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        record.status === "Final" ? "bg-green-100 text-green-700" :
                        record.status === "Preliminary" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                    }`}>
                        {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{record.performed_by_name}</td>
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
                        onClick={() => handleReprint(record.order_id)}
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
      )}

    </div>
  );
}