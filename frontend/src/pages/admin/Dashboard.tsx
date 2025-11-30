import { useEffect, useState } from "react";
import { 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Download, 
  AlertTriangle, 
  Calendar,
  Activity,
  ArrowRight,
  Clock,
  Stethoscope,
  CreditCard,
  UserPlus,
  MoreHorizontal
} from "lucide-react";
import { fetchUserProfile } from "../../services/api";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  
  // Mock Data
  const [analytics] = useState({
    revenue: 8420,
    revenueChange: "+12%",
    patients: 48,
    patientsChange: "-10%",
    drugs: 48,
  });

  const [liveStats] = useState({
    waitingRoom: 12,
    doctorsActive: 3,
    triageQueue: 4
  });

  const [recentTransactions] = useState([
    { id: 101, patient: "Kwame O.", service: "General Consultation", amount: 150, status: "Paid", method: "Cash" },
    { id: 102, patient: "Ama S.", service: "Lab Test (Malaria)", amount: 80, status: "Pending", method: "Insurance" },
    { id: 103, patient: "John D.", service: "Pharmacy", amount: 240, status: "Paid", method: "MoMo" },
  ]);

  const [recentActivity] = useState([
    { id: 1, type: "warning", title: "Expiration Risk", message: "3 batches of Amoxicillin expire in < 7 days.", action: "View Batch" },
    { id: 2, type: "critical", title: "Stockout Alert", message: "Paracetamol inventory is critically low (10 units).", action: "Reorder" },
  ]);

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

  const exportDashboardData = () => {
    // Export logic here
    console.log("Exporting...");
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* --- Header & Quick Actions --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-[#073159]">
                  Admin Dashboard
                </h2>
                <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Clinic Open
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium text-sm">
                  <UserPlus size={18} />
                  Add Staff
                </button>
                <button 
                  onClick={exportDashboardData}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-lg shadow-blue-900/20 font-medium text-sm"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>

            {/* --- Clinic Pulse (Live Status) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10">
                   <p className="text-blue-100 text-sm font-medium mb-1">Patients Waiting</p>
                   <h3 className="text-3xl font-bold">{liveStats.waitingRoom}</h3>
                   <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                      <Clock size={12} /> Avg wait: 14 mins
                   </div>
                </div>
                <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Active Doctors</p>
                      <h3 className="text-2xl font-bold text-[#073159] mt-1">{liveStats.doctorsActive} <span className="text-sm text-gray-400 font-normal">/ 5</span></h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Stethoscope className="text-green-600 w-5 h-5" />
                    </div>
                 </div>
                 <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '60%' }}></div>
                 </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Triage Queue</p>
                      <h3 className="text-2xl font-bold text-[#073159] mt-1">{liveStats.triageQueue}</h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Activity className="text-orange-600 w-5 h-5" />
                    </div>
                 </div>
                 <p className="text-xs text-orange-600 mt-2 font-medium">Requires attention</p>
              </div>
            </div>

            {/* --- Key Financial Metrics --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Revenue" 
                value={`GH₵ ${analytics.revenue.toLocaleString()}`}
                change={analytics.revenueChange}
                positive={true}
                icon={<DollarSign className="w-6 h-6 text-green-600" />}
                color="bg-green-50"
              />
              <MetricCard 
                title="Total Visits" 
                value={analytics.patients.toString()}
                change={analytics.patientsChange}
                positive={false}
                icon={<Users className="w-6 h-6 text-blue-600" />}
                color="bg-blue-50"
              />
              <MetricCard 
                title="Inventory Count" 
                value={analytics.drugs.toString()}
                subtext="Stock Items"
                icon={<Package className="w-6 h-6 text-purple-600" />}
                color="bg-purple-50"
              />
            </div>

            {/* --- Main Content Grid --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Left Column: Charts (Span 2) */}
              <div className="xl:col-span-2 space-y-8">
                
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        Weekly Income
                      </h3>
                      <p className="text-sm text-gray-400">Cash vs Insurance</p>
                    </div>
                    <button className="text-gray-400 hover:text-[#073159]">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  
                  <div className="w-full h-64 overflow-hidden relative">
                    <svg viewBox="0 0 600 220" className="w-full h-full">
                      <defs>
                        <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#073159" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#073159" stopOpacity="0"/>
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line key={i} x1="0" y1={40 + i * 40} x2="600" y2={40 + i * 40} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
                      ))}
                      
                      {/* Area Fill */}
                      <path
                        d={`M 0 200 ` + weeklyData.map((d, i) => {
                            const x = (i / (weeklyData.length - 1)) * 600;
                            const y = 200 - (d.value / maxWeekly) * 140;
                            return `L ${x} ${y}`;
                          }).join(" ") + ` L 600 200 Z`}
                        fill="url(#gradientRevenue)"
                      />

                      {/* Line Path */}
                      <path
                        d={weeklyData.map((d, i) => {
                            const x = (i / (weeklyData.length - 1)) * 600;
                            const y = 200 - (d.value / maxWeekly) * 140;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          }).join(" ")}
                        fill="none"
                        stroke="#073159"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Interactive Dots */}
                      {weeklyData.map((d, i) => {
                        const x = (i / (weeklyData.length - 1)) * 600;
                        const y = 200 - (d.value / maxWeekly) * 140;
                        return (
                          <g key={i} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="6" className="fill-white stroke-[#073159] stroke-2 group-hover:scale-125 transition-transform" />
                            
                            {/* Tooltip */}
                            <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <rect x={x - 25} y={y - 40} width="50" height="25" rx="6" fill="#073159" />
                                <text x={x} y={y - 23} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">{d.value}</text>
                            </g>
                            
                            {/* X Labels */}
                            <text x={x} y="215" fontSize="12" fill="#9ca3af" textAnchor="middle">{d.day}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#073159]" />
                      Recent Transactions
                    </h3>
                    <button className="text-sm text-blue-600 hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Patient</th>
                          <th className="px-6 py-3 font-semibold">Service</th>
                          <th className="px-6 py-3 font-semibold">Amount</th>
                          <th className="px-6 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{tx.patient}</td>
                            <td className="px-6 py-4 text-gray-600">{tx.service}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">GH₵ {tx.amount}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                tx.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Alerts & Side Widgets (Span 1) */}
              <div className="space-y-8">
                
                {/* Alerts Widget */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Action Center
                    </h3>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                       {recentActivity.length}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-4 rounded-xl border border-l-4 transition-all hover:translate-x-1 ${
                          alert.type === 'critical' ? 'bg-red-50 border-red-200 border-l-red-500' : 
                          'bg-orange-50 border-orange-200 border-l-orange-500'
                        }`}
                      >
                        <h4 className="font-bold text-gray-800 text-sm mb-1">{alert.title}</h4>
                        <p className="text-xs text-gray-600 mb-3">{alert.message}</p>
                        <button className="text-xs font-bold text-[#073159] flex items-center gap-1 hover:gap-2 transition-all">
                          {alert.action} <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Staff List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                   <h3 className="font-bold text-gray-800 mb-4">On Duty Now</h3>
                   <div className="space-y-4">
                      {['Dr. Mensah', 'Nurse Sarah', 'Pharm. John'].map((name, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#073159] text-xs font-bold">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-500">{i === 0 ? 'Consultation 1' : i === 1 ? 'Triage' : 'Pharmacy'}</p>
                          </div>
                          <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
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

// --- Reusable Metric Card Component ---
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  color: string;
  subtext?: string;
}

function MetricCard({ icon, title, value, change, positive, color, subtext }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-[#073159]">{value}</h3>
        
        <div className="flex items-center mt-3 gap-2">
           {change ? (
             <>
               <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {positive ? <TrendingUp size={12}/> : <TrendingDown size={12} />}
                 {change}
               </span>
               <span className="text-xs text-gray-400">vs last month</span>
             </>
           ) : (
             <span className="text-xs text-gray-400">{subtext}</span>
           )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}