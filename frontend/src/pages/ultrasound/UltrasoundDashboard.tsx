import { useNavigate } from "react-router-dom";
import { 
  Waves, 
  Activity, 
  Clock, 
  CheckCircle, 
  Users 
} from "lucide-react";

export default function UltrasoundDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Ultrasound Unit</h1>
          <p className="text-sm md:text-base text-gray-500">Daily scan overview and patient queue.</p>
        </div>
        <button 
          onClick={() => navigate("/ultrasound/worklist")}
          className="w-full sm:w-auto bg-[#073159] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#062a4d] transition-transform active:scale-95 shadow-md"
        >
          View Worklist
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Scans" value="5" icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
        <StatCard label="In Progress" value="1" icon={<Activity size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard label="Completed Today" value="12" icon={<CheckCircle size={20} />} color="bg-green-50 text-green-600" />
        <StatCard label="Total Patients" value="18" icon={<Users size={20} />} color="bg-indigo-50 text-indigo-600" />
      </div>

      {/* Machine Status & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Waves size={20} className="text-indigo-600" /> Equipment Status
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-sm font-medium text-gray-700">Machine 1 (GE Voluson)</span>
                    <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded">Operational</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-sm font-medium text-gray-700">Machine 2 (Portable)</span>
                    <span className="text-xs font-bold text-green-600 bg-white px-2 py-1 rounded">Operational</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-sm font-medium text-gray-700">Printer 2</span>
                    <span className="text-xs font-bold text-red-600 bg-white px-2 py-1 rounded">Offline</span>
                </div>
            </div>
        </div>

        {/* Up Next Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Up Next</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Patient</th>
                            <th className="px-6 py-3">Scan Type</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-indigo-50/30">
                            <td className="px-6 py-4 font-mono text-gray-500">10:00 AM</td>
                            <td className="px-6 py-4 font-bold text-[#073159]">Ama Kyei</td>
                            <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Obstetric</span></td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => navigate("/ultrasound/reports")} className="text-indigo-600 font-bold text-xs hover:underline">Start Scan</button>
                            </td>
                        </tr>
                        <tr className="hover:bg-indigo-50/30">
                            <td className="px-6 py-4 font-mono text-gray-500">10:30 AM</td>
                            <td className="px-6 py-4 font-bold text-[#073159]">John Doe</td>
                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">Abdominal</span></td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-indigo-600 font-bold text-xs hover:underline">Start Scan</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

// Helper
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wide">{label}</p>
      </div>
    </div>
  )
}