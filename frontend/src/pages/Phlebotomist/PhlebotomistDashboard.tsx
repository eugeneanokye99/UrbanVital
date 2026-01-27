import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity,
  Calendar,
  DollarSign,
  UserPlus,
  Loader2,
  FileText,
} from "lucide-react";
import { fetchDashboardSummary } from "../../services/api";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

  // Mock alerts (you can make these dynamic too)
  const [recentActivity] = useState([
    { id: 1, title: "System Update", message: "System maintenance scheduled for Sunday 2 AM", type: "info" },
    { id: 2, title: "Doctor Schedule", message: "Dr. Mensah will be 30 mins late today.", type: "warning" },
  ]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardSummary();
      setDashboardData(data);
      
      // Extract recent visits from dashboard data
      if (data?.recent_activity?.visits) {
        setRecentVisits(data.recent_activity.visits);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

 
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Checked In":
      case "Waiting":
        return "bg-orange-100 text-orange-700";
      case "In Consultation":
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Vitals Taken":
      case "Awaiting Lab":
        return "bg-purple-100 text-purple-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get short status text
  const getShortStatus = (status: string) => {
    switch (status) {
      case "Checked In": return "Waiting";
      case "In Consultation": return "In Consult";
      case "Vitals Taken": return "Vitals";
      case "Awaiting Lab": return "Labs";
      case "Awaiting Pharmacy": return "Pharmacy";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#073159] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-[#073159]">
           Phlebotomist Dashboard
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

        <button 
          onClick={() => navigate("/phlebotomist/registerpatient")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-md hover:shadow-lg text-sm font-bold active:scale-95 transform"
        >
          <UserPlus size={18} />
          <span>Register Patient</span>
        </button>
      </div>

      {/* --- Quick Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Total Patients" 
          value={dashboardData?.summary?.total_patients?.toString() || "0"} 
          change="Total" 
          positive={true} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50"
          onClick={() => navigate("/phlebotomist/patients")}
          subtext={`+${dashboardData?.summary?.today_patients || 0} today`}
        />
        <MetricCard 
          title="Today's Visits" 
          value={dashboardData?.summary?.today_visits?.toString() || "0"} 
          change="Active" 
          positive={false} 
          icon={<Activity className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-50"
          onClick={() => navigate("/phlebotomist/checkin")}
          subtext={`${dashboardData?.summary?.active_visits || 0} waiting`}
        />
        <MetricCard 
          title="Cash Collected" 
          value={`₵${(dashboardData?.summary?.today_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          change="Today" 
          positive={true} 
          icon={<DollarSign className="w-6 h-6 text-green-600" />} 
          color="bg-green-50"
          onClick={() => navigate("/phlebotomist/billing")}
          subtext={`₵${(dashboardData?.summary?.week_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this week`}
        />
        <MetricCard 
          title="Pending Invoices" 
          value={dashboardData?.summary?.pending_invoices?.toString() || "0"} 
          change="Unpaid" 
          positive={false} 
          icon={<FileText className="w-6 h-6 text-red-600" />} 
          color="bg-red-50"
          onClick={() => navigate("/phlebotomist/billing")}
          subtext="Require payment"
        />
      </div>

      {/* --- Charts & Queue Grid --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Queue): Takes 2/3 space on large screens */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
          <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-lg">
              <Activity className="w-5 h-5 text-[#073159]" />
              Recent Check-ins
            </h3>
            <button 
              onClick={() => navigate("/phlebotomist/checkin")}
              className="text-xs md:text-sm text-blue-600 hover:underline font-medium"
            >
              View Full List
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {recentVisits.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Phlebotomist</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-500 whitespace-nowrap">
                        {formatTime(visit.check_in_time)}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#073159]">
                        {visit.patient_name || "Unknown Patient"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {visit.service_type || "General"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {visit.phlebotomist || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(visit.status)}`}>
                          {getShortStatus(visit.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-400 text-sm">No recent check-ins</p>
                <button
                  onClick={() => navigate("/phlebotomist/checkin")}
                  className="mt-2 text-[#073159] text-sm font-bold hover:underline"
                >
                  Check in a patient
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Revenue & Alerts): Takes 1/3 space on large screens */}
        <div className="space-y-6 md:space-y-8">
          
          {/* Mini Revenue Chart */}
          <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Weekly Revenue</h3>
              <TrendingUp size={18} className="text-green-500" />
            </div>
            {dashboardData?.charts?.weekly_revenue?.length > 0 ? (
              <>
                <div className="h-32 w-full">
                  <svg viewBox="0 0 300 100" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d={`M 0 100 ` + dashboardData.charts.weekly_revenue.map((item: any, i: number) => {
                          const x = (i / (dashboardData.charts.weekly_revenue.length - 1)) * 300;
                          const maxRevenue = Math.max(...dashboardData.charts.weekly_revenue.map((r: any) => r.revenue));
                          const y = item.revenue > 0 ? 100 - (item.revenue / maxRevenue) * 80 : 100;
                          return `L ${x} ${y}`;
                        }).join(" ") + ` L 300 100 Z`}
                      fill="#073159"
                      opacity="0.1"
                    />
                    <path
                      d={dashboardData.charts.weekly_revenue.map((item: any, i: number) => {
                          const x = (i / (dashboardData.charts.weekly_revenue.length - 1)) * 300;
                          const maxRevenue = Math.max(...dashboardData.charts.weekly_revenue.map((r: any) => r.revenue));
                          const y = item.revenue > 0 ? 100 - (item.revenue / maxRevenue) * 80 : 100;
                          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                      fill="none"
                      stroke="#073159"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                  <span>{dashboardData.charts.weekly_revenue[0]?.day || "Mon"}</span>
                  <span>{dashboardData.charts.weekly_revenue[dashboardData.charts.weekly_revenue.length - 1]?.day || "Sun"}</span>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  Total: ₵{(dashboardData.charts.weekly_revenue.reduce((sum: number, item: any) => sum + item.revenue, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                No revenue data available
              </div>
            )}
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
              <Users className="w-4 h-4 text-blue-500" />
              Recent Patients
            </h3>
            {dashboardData?.recent_activity?.patients?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recent_activity.patients.slice(0, 3).map((patient: any) => (
                  <div 
                    key={patient.id}
                    onClick={() => navigate(`/frontdesk/patientdetail`, { state: { patient } })}
                    className="p-3 rounded-xl border border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#073159] font-bold text-sm mr-3">
                        {patient.name?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-sm">{patient.name || "Unknown"}</h4>
                        <p className="text-xs text-gray-500">{patient.mrn || "No MRN"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{formatTime(patient.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/frontdesk/patients")}
                  className="w-full text-center text-xs text-[#073159] hover:underline font-medium pt-2"
                >
                  View All Patients →
                </button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400 text-sm">
                No recent patients
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm md:text-base">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Notice Board
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
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {change}
           </span>
           <span className="text-xs text-gray-400">{subtext || "vs last week"}</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}