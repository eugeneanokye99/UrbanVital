import { useState } from "react";
import { 
  History, 
  Search, 
  Download, 
  Calendar,
  Filter,
  ArrowUpRight
} from "lucide-react";

export default function PharmacyHistory() {
  const [search, setSearch] = useState("");

  // Mock Sales Data
  const salesHistory = [
    { id: "RX-1001", date: "24 Oct 2025", time: "10:45 AM", patient: "Williams Boampong", items: "Paracetamol, Amoxicillin", amount: 45.00, method: "Cash", pharmacist: "John Doe" },
    { id: "RX-1002", date: "24 Oct 2025", time: "09:30 AM", patient: "Sarah Mensah", items: "Artemether-Lumefantrine", amount: 35.00, method: "Insurance", pharmacist: "John Doe" },
    { id: "RX-1003", date: "23 Oct 2025", time: "04:15 PM", patient: "Emmanuel Osei", items: "Atorvastatin, Aspirin", amount: 120.00, method: "MoMo", pharmacist: "Jane Smith" },
    { id: "RX-1004", date: "23 Oct 2025", time: "02:00 PM", patient: "Ama Kyei", items: "Multivitamin Syrup", amount: 25.00, method: "Cash", pharmacist: "John Doe" },
  ];

  // Simple filter
  const filteredHistory = salesHistory.filter(sale => 
    sale.patient.toLowerCase().includes(search.toLowerCase()) || 
    sale.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on mobile, Row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <History className="w-6 h-6 sm:w-7 sm:h-7" />
            Sales & Dispensing Log
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Audit trail of all medications dispensed.</p>
        </div>
        <button className="w-full sm:w-auto bg-white border border-gray-200 text-[#073159] px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm transition-colors text-sm">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Filters Bar: Stack inputs on mobile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                  type="text" 
                  placeholder="Search Patient, Drug, or Receipt #..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-teal-500 outline-none transition-all text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <div className="relative flex-1 md:flex-none">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="date" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 outline-none focus:border-teal-500 text-sm" />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 flex-shrink-0">
                  <Filter size={20} />
              </button>
          </div>
      </div>

      {/* History Table Container */}
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
                <tr key={item.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-[#073159] font-bold">{item.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.date} <br/> <span className="text-xs text-gray-400">{item.time}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.patient}</td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={item.items}>
                    {item.items}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">₵{item.amount.toFixed(2)}</td>
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
                    <button className="text-gray-400 hover:text-[#073159] p-1 rounded-full hover:bg-gray-100 transition-all">
                        <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredHistory.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No records found matching your search.</div>
        )}
      </div>

    </div>
  );
}