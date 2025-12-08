import { 
  Users, 
  Clock, 
  Calendar, 
  ArrowRight,
  TestTube
} from "lucide-react";

export default function ClinicianDashboard() {
  const appointments = [
    { time: "09:00 AM", name: "Sarah Mensah", reason: "Follow-up: Malaria", status: "Checked In" },
    { time: "09:30 AM", name: "John Doe", reason: "General Consultation", status: "Waiting" },
    { time: "10:15 AM", name: "Ama Osei", reason: "Lab Results Review", status: "Pending" },
  ];

  return (
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Good Morning, Dr. Asante</h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">You have 12 appointments scheduled for today.</p>
            </div>

            {/* Metrics: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">12</h3>
                  <p className="text-xs md:text-sm text-gray-500">Patients Today</p>
                </div>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Clock size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">4</h3>
                  <p className="text-xs md:text-sm text-gray-500">Waiting Now</p>
                </div>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TestTube size={24} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-[#073159]">3</h3>
                  <p className="text-xs md:text-sm text-gray-500">Lab Results Ready</p>
                </div>
              </div>
            </div>

            {/* Schedule Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-[#073159] flex items-center gap-2">
                  <Calendar size={20} /> Today's Schedule
                </h2>
              </div>
              
              {/* Horizontal Scroll for Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 bg-gray-50/50">
                      <th className="py-4 px-6">Time</th>
                      <th className="py-4 px-6">Patient</th>
                      <th className="py-4 px-6">Reason</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {appointments.map((apt, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-mono text-[#073159] font-medium">{apt.time}</td>
                        <td className="py-4 px-6 font-bold text-gray-800">{apt.name}</td>
                        <td className="py-4 px-6 text-gray-600">{apt.reason}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status === "Checked In" ? "bg-green-100 text-green-700" :
                            apt.status === "Waiting" ? "bg-orange-100 text-orange-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-sm font-bold text-[#073159] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
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

  );
}