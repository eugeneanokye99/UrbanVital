import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Waves } from "lucide-react";

export default function UltrasoundWorklist() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Pending");

  const queue = [
    { id: 1, name: "Ama Kyei", mrn: "UV-2025-01", scan: "Obstetric (2nd Tri)", urgency: "Normal", doctor: "Dr. Mensah" },
    { id: 2, name: "John Doe", mrn: "UV-2025-02", scan: "Abdominal", urgency: "Urgent", doctor: "Dr. Asante" },
    { id: 3, name: "Sarah Smith", mrn: "UV-2025-03", scan: "Pelvic", urgency: "Normal", doctor: "Dr. Mensah" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Scan Worklist</h1>
         <div className="flex bg-white p-1 rounded-lg border border-gray-200">
            {['Pending', 'Completed'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f ? 'bg-[#073159] text-white' : 'text-gray-500'}`}
                >
                    {f}
                </button>
            ))}
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Search patient..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm" />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Patient</th>
                        <th className="px-6 py-4">Scan Requested</th>
                        <th className="px-6 py-4">Referring Doctor</th>
                        <th className="px-6 py-4">Urgency</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {queue.map(item => (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-[#073159]">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.mrn}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 text-xs font-bold">
                                    {item.scan}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${item.urgency === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {item.urgency}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => navigate("/ultrasound/reports")}
                                  className="bg-[#073159] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#062a4d] flex items-center gap-2 ml-auto w-fit"
                                >
                                    <Waves size={14} /> Process
                                </button>
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