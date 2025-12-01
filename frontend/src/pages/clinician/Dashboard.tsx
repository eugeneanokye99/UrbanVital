import { 
  Users, 
  Clock, 
  Activity, 
  Calendar, 
  ArrowRight,
  TestTube
} from "lucide-react";
import ClinicianSidebar from "../../components/ClinicianSidebar";
import ClinicianNavbar from "../../components/ClinicianNavbar";

export default function ClinicianDashboard() {
  const appointments = [
    { time: "09:00 AM", name: "Sarah Mensah", reason: "Follow-up: Malaria", status: "Checked In" },
    { time: "09:30 AM", name: "John Doe", reason: "General Consultation", status: "Waiting" },
    { time: "10:15 AM", name: "Ama Osei", reason: "Lab Results Review", status: "Pending" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <ClinicianSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClinicianNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[#073159]">Good Morning, Dr. Asante</h1>
              <p className="text-gray-500">You have 12 appointments scheduled for today.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">12</h3>
                  <p className="text-sm text-gray-500">Patients Today</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Clock size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">4</h3>
                  <p className="text-sm text-gray-500">Waiting Now</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TestTube size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">3</h3>
                  <p className="text-sm text-gray-500">Lab Results Ready</p>
                </div>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-[#073159] mb-4 flex items-center gap-2">
                <Calendar size={20} /> Today's Schedule
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                      <th className="py-3 px-2">Time</th>
                      <th className="py-3 px-2">Patient</th>
                      <th className="py-3 px-2">Reason</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {appointments.map((apt, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-2 font-mono text-sm text-[#073159]">{apt.time}</td>
                        <td className="py-4 px-2 font-medium">{apt.name}</td>
                        <td className="py-4 px-2 text-gray-600 text-sm">{apt.reason}</td>
                        <td className="py-4 px-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.status === "Checked In" ? "bg-green-100 text-green-700" :
                            apt.status === "Waiting" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button className="text-sm font-semibold text-[#073159] hover:underline flex items-center justify-end gap-1 w-full">
                            Start <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}