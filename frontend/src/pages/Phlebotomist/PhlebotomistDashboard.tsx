import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  AlertTriangle, 
  Activity,
  Calendar,
  UserPlus,
  Loader2,
  Stethoscope,
  ClipboardList,
  ArrowRightCircle,
  CheckCircle2
} from "lucide-react";
import { fetchDashboardSummary } from "../../services/api";

export default function PhlebotomistDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [vitalsQueue, setVitalsQueue] = useState<any[]>([]);

  // Mock alerts 
  const [recentActivity] = useState([
    { id: 1, title: "Lab Supply Low", message: "Request more EDTA tubes from inventory.", type: "warning" },
    { id: 2, title: "Dr. Mensah", message: "Please prioritize Malaria RDTs for waiting room B.", type: "info" },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardSummary();
      setDashboardData(data);
      
      if (data?.recent_activity?.visits) {
        setVitalsQueue(data.recent_activity.visits.slice(0, 10)); 
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (triage: string) => {
    switch (triage?.toLowerCase()) {
      case "emergency": return "bg-red-100 text-red-700 border-red-200";
      case "urgent": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  // --- NEW: Handle Taking Vitals ---
const handleTakeVitals = (visit: any) => {
    // FIX: Navigate to the base route (no ID in URL) but pass data in state
    navigate("/phlebotomist/recordvitals", { 
        state: { 
            patient: {
                id: visit.patient_id || visit.id, 
                name: visit.patient_name || "Unknown Patient",
                mrn: visit.mrn || "NO-MRN",
                gender: visit.gender || "N/A", 
                age: visit.age || "--", 
                // Add any other fields you need
            } 
        } 
    });
};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#073159] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-[#073159]">
           Phlebotomy & Vitals
          </h2>
          <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm md:text-base">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
            <button 
            onClick={() => navigate("/phlebotomist/registerpatient")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-md hover:shadow-lg text-sm font-bold active:scale-95"
            >
            <UserPlus size={18} />
            <span>Register New Patient</span>
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Pending Vitals" 
          value={dashboardData?.summary?.active_visits?.toString() || "0"} 
          change="Waiting" 
          positive={false} 
          icon={<Activity className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-50"
          onClick={() => navigate("/phlebotomist/checkin")} 
          subtext="Patients in waiting room"
        />
        <MetricCard 
          title="Vitals Completed" 
          value={dashboardData?.summary?.today_visits?.toString() || "0"} 
          change="Today" 
          positive={true} 
          icon={<CheckCircle2 className="w-6 h-6 text-green-600" />} 
          color="bg-green-50"
          subtext="Processed successfully"
        />
        <MetricCard 
          title="New Registrations" 
          value={dashboardData?.summary?.today_patients?.toString() || "0"} 
          change="Today" 
          positive={true} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50"
          onClick={() => navigate("/phlebotomist/patients")}
          subtext="Added to system"
        />
        <MetricCard 
          title="Sent to Doctor/Lab" 
          value={dashboardData?.summary?.referrals?.toString() || "0"} 
          change="Forwarded" 
          positive={true} 
          icon={<ArrowRightCircle className="w-6 h-6 text-purple-600" />} 
          color="bg-purple-50"
          subtext="Vitals recorded & moved"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Vitals Queue */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-lg">
              <Stethoscope className="w-5 h-5 text-[#073159]" />
              Vitals Queue (Check-in List)
            </h3>
            <button 
              onClick={() => navigate("/phlebotomist/checkin")}
              className="text-xs md:text-sm text-blue-600 hover:underline font-medium"
            >
              View Full List
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {vitalsQueue.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Wait Time</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Triage</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vitalsQueue.map((visit) => (
                    <tr 
                        key={visit.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleTakeVitals(visit)} // Clicking row also triggers action
                    >
                      <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                        {formatTime(visit.check_in_time)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-[#073159]">{visit.patient_name || "Unknown"}</span>
                        <span className="text-xs text-gray-400">MRN: {visit.mrn || "---"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {visit.service_type || "General Consult"}
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getPriorityColor(visit.triage_level)}`}>
                            {visit.triage_level || "Standard"}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent double trigger
                                handleTakeVitals(visit);
                            }}
                            className="bg-[#073159] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#062a4d] transition-colors"
                        >
                            Take Vitals
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-gray-800 font-bold mb-1">All Caught Up!</h3>
                <p className="text-gray-400 text-sm">No patients currently waiting for vitals.</p>
                <button
                  onClick={() => navigate("/phlebotomist/registerpatient")}
                  className="mt-4 text-[#073159] text-sm font-bold hover:underline"
                >
                  Register a new patient manually
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Workflow */}
        <div className="space-y-6 md:space-y-8">
          
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
                <ClipboardList className="w-4 h-4 text-blue-500" />
                Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
                <button 
                    onClick={() => navigate("/phlebotomist/registerpatient")}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#073159] hover:bg-blue-50 transition-all text-left group"
                >
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-[#073159] flex items-center justify-center group-hover:bg-[#073159] group-hover:text-white transition-colors">
                        <UserPlus size={16} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 group-hover:text-[#073159]">Register Patient</span>
                        <span className="text-xs text-gray-400">Create new file</span>
                    </div>
                </button>
                <button 
                    onClick={() => navigate("/phlebotomist/recordvitals")}
                    className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-[#073159] hover:bg-blue-50 transition-all text-left group"
                >
                     <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Activity size={16} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700 group-hover:text-[#073159]">Record Vitals</span>
                        <span className="text-xs text-gray-400">BP, Temp, Weight</span>
                    </div>
                </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Staff Notice Board
            </h3>
            <div className="space-y-3">
              {recentActivity.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-xl border-l-4 text-sm ${
                    alert.type === 'warning' ? 'bg-orange-50 border-orange-500' : 
                    'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h4 className={`font-bold ${
                     alert.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
                  }`}>{alert.title}</h4>
                  <p className="text-gray-600 mt-1 text-xs">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// --- Helper Component ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

function MetricCard({ icon, title, value, change, positive, color, subtext, onClick, className }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:shadow-md active:scale-98' : ''} ${className}`}
    >
      <div>
        <p className="text-xs md:text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-[#073159]">{value}</h3>
        <div className="flex items-center mt-2 gap-2">
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
             {change}
           </span>
           <span className="text-xs text-gray-400">{subtext}</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}