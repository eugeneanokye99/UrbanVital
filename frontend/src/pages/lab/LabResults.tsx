import { 
  ClipboardList, 
  Search, 
  Download, 
  Printer, 
  Eye
} from "lucide-react";

export default function LabCompletedResults() {
  
  // Mock History
  const history = [
    { id: 101, patient: "Sarah Mensah", test: "Malaria RDT", result: "Negative", date: "24 Oct 2025", tech: "Alex" },
    { id: 102, patient: "John Doe", test: "Typhoid (Widal)", result: "Reactive 1:80", date: "23 Oct 2025", tech: "Alex" },
    { id: 103, patient: "Ama Kyei", test: "H. Pylori", result: "Positive", date: "23 Oct 2025", tech: "Sarah" },
    { id: 104, patient: "Emmanuel Osei", test: "FBC", result: "Hb 12.5 g/dL", date: "22 Oct 2025", tech: "Kofi" },
  ];

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
        
        <button className="w-full sm:w-auto text-sm font-bold text-[#073159] hover:bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95 transform">
          <Download size={16} /> Export to Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar: Stack on Mobile */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Patient Name or Test..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
            />
          </div>
          <input 
            type="date" 
            className="w-full sm:w-auto p-2 border border-gray-200 rounded-xl bg-white text-gray-600 outline-none text-sm focus:border-[#073159]" 
          />
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
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-500">{record.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{record.patient}</td>
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
                      <button className="p-2 text-gray-500 hover:text-[#073159] hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-[#073159] hover:bg-blue-50 rounded-lg transition-colors" title="Reprint">
                          <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}