import { 
  TestTube, 
  Activity, 
  Clock, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";
import LabSidebar from "../../components/LabSidebar";
import LabNavbar from "../../components/LabNavbar";

export default function LabDashboard() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <div className="hidden md:block">
        <LabSidebar />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <LabNavbar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Laboratory Overview</h1>
              <p className="text-sm md:text-base text-gray-500">Real-time status of sample processing and test requests.</p>
            </div>

            {/* Metrics: 1 col (mobile) -> 2 cols (tablet) -> 4 cols (desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Pending Samples" value="8" icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
              <StatCard label="Processing" value="3" icon={<Activity size={20} />} color="bg-blue-50 text-blue-600" />
              <StatCard label="Completed Today" value="24" icon={<CheckCircle size={20} />} color="bg-green-50 text-green-600" />
              <StatCard label="Total Requests" value="35" icon={<TestTube size={20} />} color="bg-purple-50 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              
              {/* Recent Requests Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">Incoming Requests</h3>
                  <button className="text-xs font-bold text-[#073159] hover:underline bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                    View Queue
                  </button>
                </div>
                
                {/* Horizontal Scroll Wrapper for Mobile */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4">Patient</th>
                        <th className="px-6 py-4">Test</th>
                        <th className="px-6 py-4">Urgency</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">Kwame Osei</td>
                          <td className="px-6 py-4 text-gray-600">Full Blood Count</td>
                          <td className="px-6 py-4">
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                STAT
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-[#073159] font-bold text-xs flex items-center justify-end gap-1 hover:gap-2 transition-all p-2 hover:bg-gray-100 rounded-lg ml-auto">
                              Process <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-gray-800 mb-6 text-sm md:text-base">Department Workload</h3>
                <div className="space-y-5">
                  <WorkloadBar label="Hematology" count={15} total={35} color="bg-red-500" />
                  <WorkloadBar label="Parasitology (Malaria)" count={12} total={35} color="bg-blue-500" />
                  <WorkloadBar label="Biochemistry" count={5} total={35} color="bg-yellow-500" />
                  <WorkloadBar label="Microbiology" count={3} total={35} color="bg-purple-500" />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helpers
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wide">{label}</p>
      </div>
    </div>
  )
}

function WorkloadBar({ label, count, total, color }: any) {
  const width = `${(count / total) * 100}%`;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded text-xs">{count} Tests</span>
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width }}></div>
      </div>
    </div>
  )
}