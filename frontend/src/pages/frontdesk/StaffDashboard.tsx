import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity,
  Calendar,
  DollarSign,
  UserPlus,
  Clock} from "lucide-react";
import { fetchUserProfile } from "../../services/api";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Mock Data: Recent Check-ins (The Queue)
  const recentCheckIns = [
    { id: 1, name: "Williams Boampong", time: "10:30 AM", type: "New Visit", status: "Waiting", doctor: "Dr. Asante" },
    { id: 2, name: "Sarah Mensah", time: "10:15 AM", type: "Review", status: "In Consult", doctor: "Dr. Asante" },
    { id: 3, name: "Emmanuel Osei", time: "09:45 AM", type: "Lab Only", status: "Labs", doctor: "-" },
    { id: 4, name: "Ama Kyei", time: "09:00 AM", type: "New Visit", status: "Completed", doctor: "Dr. Mensah" },
  ];

  // Mock Data: Front Desk Alerts
  const [recentActivity] = useState([
    { id: 1, title: "Insurance Portal", message: "NHIS Portal is experiencing downtime.", type: "warning" },
    { id: 2, title: "Doctor Schedule", message: "Dr. Mensah will be 30 mins late.", type: "info" },
  ]);

  // Chart Data (Revenue)
  const weeklyData = [
    { day: "Mon", value: 825 },
    { day: "Tue", value: 2514 },
    { day: "Wed", value: 1200 },
    { day: "Thu", value: 800 },
    { day: "Fri", value: 789 },
    { day: "Sat", value: 2854 },
    { day: "Sun", value: 2200 },
  ];

  const maxWeekly = Math.max(...weeklyData.map((d) => d.value));

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);


  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#073159]">
                  Front Desk Overview
                </h2>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
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

              <div className="flex gap-3">
                <button 
                  onClick={() => navigate("/frontdesk/registerpatient")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors shadow-md hover:shadow-lg"
                >
                  <UserPlus size={18} />
                  <span>Register Patient</span>
                </button>
              </div>
            </div>

            {/* --- Quick Stats Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Patients Today" 
                value="124" 
                change="+12%" 
                positive={true} 
                icon={<Users className="w-6 h-6 text-blue-600" />} 
                color="bg-blue-50"
                onClick={() => navigate("/staff/patients")}
              />
              <MetricCard 
                title="Waiting Queue" 
                value="8" 
                change="Active" 
                positive={false} 
                icon={<Clock className="w-6 h-6 text-orange-600" />} 
                color="bg-orange-50"
                subtext="Avg wait: 12m"
              />
              <MetricCard 
                title="Cash Collected" 
                value="GHS 4,250" 
                change="Today" 
                positive={true} 
                icon={<DollarSign className="w-6 h-6 text-green-600" />} 
                color="bg-green-50"
                onClick={() => navigate("/admin/billing")}
              />
            </div>

            {/* --- Charts & Queue Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (2 spans): Live Queue */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#073159]" />
                    Recent Check-ins
                  </h3>
                  <button className="text-sm text-blue-600 hover:underline">View Full List</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                      <tr>
                        <th className="px-6 py-4">Time</th>
                        <th className="px-6 py-4">Patient Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Doctor</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {recentCheckIns.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-gray-500">{item.time}</td>
                          <td className="px-6 py-4 font-bold text-[#073159]">{item.name}</td>
                          <td className="px-6 py-4 text-gray-600">{item.type}</td>
                          <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.status === "Waiting" ? "bg-orange-100 text-orange-700" :
                              item.status === "In Consult" ? "bg-blue-100 text-blue-700" :
                              item.status === "Labs" ? "bg-purple-100 text-purple-700" :
                              "bg-green-100 text-green-700"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (1 span): Revenue & Alerts */}
              <div className="space-y-8">
                
                {/* Mini Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">Weekly Revenue</h3>
                    <TrendingUp size={18} className="text-green-500" />
                  </div>
                  <div className="h-32 w-full">
                    <svg viewBox="0 0 300 100" className="w-full h-full">
                      <path
                        d={`M 0 100 ` + weeklyData.map((d, i) => {
                            const x = (i / (weeklyData.length - 1)) * 300;
                            const y = 100 - (d.value / maxWeekly) * 80;
                            return `L ${x} ${y}`;
                          }).join(" ") + ` L 300 100 Z`}
                        fill="#073159"
                        opacity="0.1"
                      />
                      <path
                        d={weeklyData.map((d, i) => {
                            const x = (i / (weeklyData.length - 1)) * 300;
                            const y = 100 - (d.value / maxWeekly) * 80;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          }).join(" ")}
                        fill="none"
                        stroke="#073159"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>Mon</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
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
        </main>
      </div>
    </div>
  );
}

// --- Internal Sub-component for Stats ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  color: string;
  subtext?: string;
  onClick?: () => void;
}

function MetricCard({ icon, title, value, change, positive, color, subtext, onClick }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#073159]">{value}</h3>
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