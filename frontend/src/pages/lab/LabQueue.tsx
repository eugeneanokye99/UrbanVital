import { useState } from "react";
import { 
  TestTube, 
  Droplet, 
  FileText 
} from "lucide-react";

export default function LabTestQueue() {
  const [filter, setFilter] = useState("Pending");

  // Mock Queue
  const queue = [
    { id: 1, patient: "Williams Boampong", mrn: "UV-2025-0421", test: "Full Blood Count", status: "Pending Sample", doctor: "Dr. Asante" },
    { id: 2, patient: "Sarah Mensah", mrn: "UV-2025-0422", test: "Malaria RDT", status: "Processing", doctor: "Dr. Asante" },
    { id: 3, patient: "Emmanuel Osei", mrn: "UV-2025-0423", test: "Lipid Profile", status: "Result Ready", doctor: "Dr. Mensah" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Test Queue</h1>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
          {['Pending', 'Processing', 'Completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                filter === f ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Test Requested</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#073159]">{item.patient}</p>
                    <p className="text-xs text-gray-500">{item.mrn}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium text-xs border border-blue-100 whitespace-nowrap">
                      {item.test}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === "Pending Sample" ? (
                      <button className="bg-[#073159] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#062a4d] flex items-center gap-2 ml-auto transition-transform active:scale-95">
                        <Droplet size={14} /> Collect
                      </button>
                    ) : item.status === "Processing" ? (
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-purple-700 flex items-center gap-2 ml-auto transition-transform active:scale-95">
                        <TestTube size={14} /> Result
                      </button>
                    ) : (
                      <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-50 flex items-center gap-2 ml-auto transition-colors">
                        <FileText size={14} /> Report
                      </button>
                    )}
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

function StatusBadge({ status }: { status: string }) {
  if (status === "Pending Sample") return <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap">Waiting Sample</span>;
  if (status === "Processing") return <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">In Lab</span>;
  return <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap">Ready</span>;
}