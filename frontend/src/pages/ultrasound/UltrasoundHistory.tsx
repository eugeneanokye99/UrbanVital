import { useState } from "react";
import { 
  History, 
  Search, 
  Download, 
  Calendar,
  Filter,
  Eye,
  Printer,
  FileImage
} from "lucide-react";

export default function UltrasoundHistory() {
  const [search, setSearch] = useState("");

  // Mock History Data
  const scanHistory = [
    { id: "SCN-1001", date: "24 Oct 2025", time: "10:45 AM", patient: "Ama Kyei", scan: "Obstetric (2nd Tri)", findings: "Normal fetal growth", sonographer: "James" },
    { id: "SCN-1002", date: "24 Oct 2025", time: "09:30 AM", patient: "John Doe", scan: "Abdominal", findings: "Mild fatty liver", sonographer: "James" },
    { id: "SCN-1003", date: "23 Oct 2025", time: "04:15 PM", patient: "Sarah Smith", scan: "Pelvic", findings: "Ovarian cyst (Right)", sonographer: "Sarah" },
    { id: "SCN-1004", date: "23 Oct 2025", time: "02:00 PM", patient: "Kwame Osei", scan: "Thyroid", findings: "No nodules detected", sonographer: "James" },
  ];

  const filteredHistory = scanHistory.filter(item => 
    item.patient.toLowerCase().includes(search.toLowerCase()) || 
    item.scan.toLowerCase().includes(search.toLowerCase())
  );

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
                  <input type="date" className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 outline-none focus:border-indigo-500 text-sm" />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 flex-shrink-0">
                  <Filter size={20} />
              </button>
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
                  <td className="px-6 py-4 font-mono text-[#073159] font-bold">{item.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.date} <br/> <span className="text-xs text-gray-400">{item.time}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.patient}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">
                        {item.scan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{item.findings}</td>
                  <td className="px-6 py-4 text-gray-500">{item.sonographer}</td>
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
            <div className="p-12 text-center text-gray-400 text-sm">No scan records found.</div>
        )}
      </div>

    </div>
  );
}