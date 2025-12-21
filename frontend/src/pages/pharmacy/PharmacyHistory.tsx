import { useState, useEffect, useMemo } from "react";
import { 
  History, 
  Search, 
  Download, 
  Calendar,
  ArrowUpRight,
  X
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PharmacyHistory() {
  // 1. Get the LIVE sales data from the Layout context
  const { globalSearch, sales } = useOutletContext<{ globalSearch: string; sales: any[] }>();
  
  const [localSearch, setLocalSearch] = useState(globalSearch);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
      setLocalSearch(globalSearch);
  }, [globalSearch]);

  // 2. Filter logic using the context data
  const filteredHistory = useMemo(() => {
    return (sales || []).filter(sale => {
        const searchLower = localSearch.toLowerCase();
        const matchesSearch = 
            sale.patient.toLowerCase().includes(searchLower) || 
            sale.id.toLowerCase().includes(searchLower) ||
            sale.items.toLowerCase().includes(searchLower);
        
        const matchesDate = dateFilter ? sale.date === dateFilter : true;
        return matchesSearch && matchesDate;
    });
  }, [sales, localSearch, dateFilter]);

  // --- HANDLERS ---
  const handleExport = () => {
      if (filteredHistory.length === 0) return toast.error("No data to export");
      const headers = ["ID", "Date", "Time", "Patient", "Items", "Amount", "Method", "Pharmacist"];
      const csvRows = filteredHistory.map(s => [s.id, s.date, s.time, `"${s.patient}"`, `"${s.items}"`, s.amount, s.method, s.pharmacist].join(","));
      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvString], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Pharmacy_History.csv");
      link.click();
      toast.success("Download started");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header (Only One Title Here) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <History className="w-6 h-6 sm:w-7 sm:h-7" />
            Sales & Dispensing Log
          </h1>
          <p className="text-sm text-gray-500">Audit trail of all medications dispensed.</p>
        </div>
        <button 
            onClick={handleExport}
            className="w-full sm:w-auto bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-sm"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* 2. Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Search Patient, Drug, or Receipt #..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 outline-none text-sm"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <div className="relative flex-1 md:flex-none">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 outline-none text-sm cursor-pointer" 
                  />
                  {dateFilter && (
                      <button onClick={() => setDateFilter("")} className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500">
                          <X size={16} />
                      </button>
                  )}
              </div>
          </div>
      </div>

      {/* 3. The Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Receipt ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Items Dispensed</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[#073159] font-bold">{item.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.date} <br/> <span className="text-xs text-gray-400">{item.time}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.patient}</td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.items}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">₵{Number(item.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.method === "Cash" ? "bg-green-100 text-green-700" :
                        item.method === "Insurance" ? "bg-purple-100 text-purple-700" :
                        "bg-blue-100 text-blue-700"
                    }`}>
                        {item.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-[#073159] p-2 rounded-full hover:bg-gray-100 transition-all">
                        <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm italic">
                No history records found matching your filters.
            </div>
        )}
      </div>
    </div>
  );
}