import { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Download, 
  Calendar,
  Eye,
  Printer,
  FileImage,
  Loader2,
  AlertCircle
} from "lucide-react";
import { fetchCompletedUltrasoundScans } from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export default function UltrasoundHistory() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadCompletedScans();
  }, []);

  const loadCompletedScans = async () => {
    try {
      setLoading(true);
      const data = await fetchCompletedUltrasoundScans();
      setScanHistory(data.results || data || []);
    } catch (error) {
      console.error("Error loading scan history:", error);
      toast.error("Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = scanHistory.filter(item => {
    const matchesSearch = debouncedSearch === "" || 
      item.patient_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      item.scan_type?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.scan_number?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom && item.scan_completed_at) {
      matchesDate = matchesDate && new Date(item.scan_completed_at) >= new Date(dateFrom);
    }
    if (dateTo && item.scan_completed_at) {
      matchesDate = matchesDate && new Date(item.scan_completed_at) <= new Date(dateTo);
    }
    
    return matchesSearch && matchesDate;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <History className="w-6 h-6 sm:w-7 sm:h-7" />
            Scan History & Archive
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Access past ultrasound reports and images.</p>
        </div>
        <button className="w-full sm:w-auto bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-colors text-sm active:scale-95">
          <Download size={18} /> Export Log
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Search Patient, Scan Type, or ID..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <div className="relative flex-1 md:flex-none">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 outline-none focus:border-indigo-500 text-sm" 
                    placeholder="From"
                  />
              </div>
              <div className="relative flex-1 md:flex-none">
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 outline-none focus:border-indigo-500 text-sm" 
                    placeholder="To"
                  />
              </div>
          </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Scan ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Scan Type</th>
                <th className="px-6 py-4">Summary</th>
                <th className="px-6 py-4">Sonographer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#073159] font-bold">{item.scan_number || `SCN-${item.id}`}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(item.scan_completed_at || item.created_at)} <br/> 
                    <span className="text-xs text-gray-400">{formatTime(item.scan_completed_at || item.created_at)}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.patient_name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                        {item.scan_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.impression || item.findings || "No findings"}</td>
                  <td className="px-6 py-4 text-gray-500">{item.performed_by_name || "N/A"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Images">
                          <FileImage size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#073159] hover:bg-gray-100 rounded-lg transition-colors" title="View Report">
                          <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-[#073159] hover:bg-gray-100 rounded-lg transition-colors" title="Reprint">
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
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertCircle size={48} className="mb-4 opacity-50" />
            <p className="text-base font-medium mb-1">No scan records found</p>
            <p className="text-sm">
              {debouncedSearch || dateFrom || dateTo
                ? "Try adjusting your filters"
                : "Completed scans will appear here"
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
}