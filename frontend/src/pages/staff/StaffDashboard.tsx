import { useEffect, useState } from "react";
import { 
  Filter, 
  Download, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Activity,
  Calendar,
  DollarSign
} from "lucide-react";
import { fetchUserProfile } from "../../services/api";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);

  // Mock Data for Alerts
  const [recentActivity] = useState([
    { id: 1, title: "Drug Expiry Warning", message: "3 batches of Amoxicillin expire in < 7 days.", type: "critical" },
    { id: 2, title: "Low Stock Alert", message: "Paracetamol inventory below reorder level (15 units).", type: "warning" },
    { id: 3, title: "System Update", message: "Maintenance scheduled for Sunday 2:00 AM.", type: "info" },
  ]);

  // Chart Data
  const weeklyData = [
    { day: "Mon", value: 825 },
    { day: "Tue", value: 2514 },
    { day: "Wed", value: 1200 },
    { day: "Thu", value: 800 },
    { day: "Fri", value: 789 },
    { day: "Sat", value: 2854 },
    { day: "Sun", value: 2200 },
  ];

  const monthlyData = [
    { month: "Jan", values: [12, 18, 15, 20] },
    { month: "Feb", values: [15, 22, 18, 24] },
    { month: "Mar", values: [18, 14, 20, 16] },
    { month: "Apr", values: [16, 20, 18, 22] },
    { month: "May", values: [20, 25, 22, 26] },
    { month: "Jun", values: [22, 18, 20, 16] },
  ];

  const maxWeekly = Math.max(...weeklyData.map((d) => d.value));

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);

  const exportDashboardData = () => {
    const data = {
      user: user?.username,
      recentActivity,
      weeklyStats: weeklyData,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `UrbanVital_Report_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

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
                  Dashboard Overview
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
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  <Filter size={18} />
                  <span>Filter</span>
                </button>
                <button 
                  onClick={exportDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors shadow-md hover:shadow-lg"
                >
                  <Download size={18} />
                  <span>Export Report</span>
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
              />
              <MetricCard 
                title="Revenue (Week)" 
                value="GHS 12,450" 
                change="+5.2%" 
                positive={true} 
                icon={<DollarSign className="w-6 h-6 text-green-600" />} 
                color="bg-green-50"
              />
              <MetricCard 
                title="Pending Alerts" 
                value="3" 
                change="Urgent" 
                positive={false} 
                icon={<AlertTriangle className="w-6 h-6 text-orange-600" />} 
                color="bg-orange-50"
              />
            </div>

            {/* --- Charts Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Weekly Revenue Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#073159]" />
                    Weekly Revenue
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500">Last 7 Days</span>
                </div>
                
                <div className="w-full overflow-hidden">
                  <svg viewBox="0 0 600 220" className="w-full h-full">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="50" y1={40 + i * 40}
                        x2="580" y2={40 + i * 40}
                        stroke="#f3f4f6" strokeWidth="1"
                      />
                    ))}
                    
                    {/* Line Path */}
                    <path
                      d={weeklyData.map((d, i) => {
                          const x = 80 + i * 80;
                          const y = 200 - (d.value / maxWeekly) * 140;
                          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                      fill="none"
                      stroke="#073159"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-md"
                    />

                    {/* Dots & Labels */}
                    {weeklyData.map((d, i) => {
                      const x = 80 + i * 80;
                      const y = 200 - (d.value / maxWeekly) * 140;
                      return (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="6" className="fill-white stroke-[#073159] stroke-2 group-hover:r-8 transition-all" />
                          {/* Tooltip on hover (simple SVG implementation) */}
                          <rect x={x - 20} y={y - 35} width="40" height="25" rx="4" fill="#1f2937" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          <text x={x} y={y - 18} fontSize="10" fill="white" textAnchor="middle" className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                            {d.value}
                          </text>
                          
                          {/* X-Axis Labels */}
                          <text x={x} y="215" fontSize="12" fill="#9ca3af" textAnchor="middle" fontWeight="500">
                            {d.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Monthly Visits Bar Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#073159]" />
                    Monthly Visits
                  </h3>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500">2025</span>
                </div>

                <div className="w-full overflow-hidden">
                   <svg viewBox="0 0 600 220" className="w-full h-full">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="50" y1={40 + i * 40}
                        x2="580" y2={40 + i * 40}
                        stroke="#f3f4f6" strokeWidth="1"
                      />
                    ))}

                    {/* Bars */}
                    {monthlyData.map((month, i) =>
                      month.values.map((val, j) => {
                        const x = 80 + i * 85 + j * 15;
                        const height = (val / 30) * 160;
                        const y = 200 - height;
                        const colors = ["#073159", "#3b82f6", "#93c5fd", "#e0f2fe"]; // Blue shades
                        return (
                          <rect 
                            key={`${i}-${j}`} 
                            x={x} y={y} 
                            width="10" height={height} 
                            fill={colors[j]} 
                            rx="2"
                            className="hover:opacity-80 transition-opacity"
                          />
                        );
                      })
                    )}

                    {/* X-Axis Labels */}
                    {monthlyData.map((month, i) => (
                      <text
                        key={i}
                        x={80 + i * 85 + 25}
                        y="215"
                        fontSize="12"
                        fill="#9ca3af"
                        textAnchor="middle"
                        fontWeight="500"
                      >
                        {month.month}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* --- Alerts & Notifications --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                System Alerts & Notifications
              </h3>
              
              <div className="space-y-3">
                {recentActivity.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-500' : 
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-500' : 
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-100 text-red-600' : 
                      alert.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <h4 className={`font-semibold text-sm ${
                         alert.type === 'critical' ? 'text-red-800' : 
                         alert.type === 'warning' ? 'text-orange-800' : 
                         'text-blue-800'
                      }`}>
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                    <button className="ml-auto text-xs font-semibold underline text-gray-500 hover:text-gray-800">
                      View
                    </button>
                  </div>
                ))}
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
}

function MetricCard({ icon, title, value, change, positive, color }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#073159]">{value}</h3>
        <div className="flex items-center mt-2 gap-2">
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
             {change}
           </span>
           <span className="text-xs text-gray-400">vs last week</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}