import { 
  TestTube, 
  Activity, 
  Clock, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom"; 

export default function LabDashboard() {
  const navigate = useNavigate();
  // Get Search Text from Layout
  const { globalSearch } = useOutletContext<{ globalSearch: string }>();

  // Mock Data for "Incoming Requests" (Added MRN for data passing)
  const incomingRequests = [
    { id: 1, patient: "Kwame Osei", mrn: "UV-2025-0099", test: "Full Blood Count", urgency: "STAT" },
    { id: 2, patient: "Sarah Mensah", mrn: "UV-2025-0422", test: "Malaria RDT", urgency: "Normal" },
    { id: 3, patient: "John Doe", mrn: "UV-2025-0012", test: "Typhoid (IgM/IgG)", urgency: "Normal" }, // Updated test name to match valid ones
  ];

  // Filter Logic
  const filteredRequests = incomingRequests.filter(req => 
    req.patient.toLowerCase().includes(globalSearch.toLowerCase()) || 
    req.test.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // --- Handlers ---

  const handleViewQueue = () => {
    navigate("/lab/labqueue");
  };

  const handleProcessRequest = (request: any) => {
    // Navigate to Result Entry page and pre-fill data
    navigate("/lab/labentry", { 
        state: { 
            patient: { name: request.patient, id: request.mrn },
            testToSelect: request.test 
        } 
    });
  };

  const handleViewCompleted = () => {
      navigate("/lab/labresults");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Laboratory Overview</h1>
        <p className="text-sm md:text-base text-gray-500">Real-time status of sample processing and test requests.</p>
      </div>

      {/* Metrics: Clickable Cards for Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            label="Pending Samples" 
            value="8" 
            icon={<Clock size={20} />} 
            color="bg-orange-50 text-orange-600" 
            onClick={handleViewQueue} // Navigates to Queue
        />
        <StatCard 
            label="Processing" 
            value="3" 
            icon={<Activity size={20} />} 
            color="bg-blue-50 text-blue-600" 
            onClick={handleViewQueue} 
        />
        <StatCard 
            label="Completed Today" 
            value="24" 
            icon={<CheckCircle size={20} />} 
            color="bg-green-50 text-green-600" 
            onClick={handleViewCompleted} // Navigates to Results
        />
        <StatCard 
            label="Total Requests" 
            value="35" 
            icon={<TestTube size={20} />} 
            color="bg-purple-50 text-purple-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Recent Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-800 text-sm md:text-base">Incoming Requests</h3>
            <button 
                onClick={handleViewQueue}
                className="text-xs font-bold text-[#073159] hover:underline bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
            >
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
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{req.patient}</td>
                      <td className="px-6 py-4 text-gray-600">{req.test}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${
                            req.urgency === "STAT" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        }`}>
                            {req.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={() => handleProcessRequest(req)}
                            className="text-[#073159] font-bold text-xs flex items-center justify-end gap-1 hover:gap-2 transition-all p-2 hover:bg-gray-100 rounded-lg ml-auto"
                        >
                          Process <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                      No requests found matching "{globalSearch}"
                    </td>
                  </tr>
                )}
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
  );
}

// Helpers
function StatCard({ label, value, icon, color, onClick }: any) {
  return (
    <div 
        onClick={onClick}
        className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
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