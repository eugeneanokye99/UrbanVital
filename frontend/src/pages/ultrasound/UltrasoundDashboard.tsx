import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Waves, 
  Activity, 
  Clock, 
  CheckCircle, 
  Users,
  Loader2
} from "lucide-react";
import { fetchUltrasoundStats, fetchUltrasoundEquipment } from "../../services/api";
import toast from "react-hot-toast";

export default function UltrasoundDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [equipment, setEquipment] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, equipmentData] = await Promise.all([
        fetchUltrasoundStats(),
        fetchUltrasoundEquipment()
      ]);
      setStats(statsData);
      setEquipment(equipmentData?.results || equipmentData || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
      </div>
    );
  }

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
        <StatCard 
          label="Pending Scans" 
          value={stats?.pending_orders || 0} 
          icon={<Clock size={20} />} 
          color="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          label="In Progress" 
          value={stats?.in_progress || 0} 
          icon={<Activity size={20} />} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          label="Completed Today" 
          value={stats?.completed_today || 0} 
          icon={<CheckCircle size={20} />} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          label="Total Patients" 
          value={stats?.today_scans || 0} 
          icon={<Users size={20} />} 
          color="bg-indigo-50 text-indigo-600" 
        />
      </div>

      {/* Machine Status & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Machine Status Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Waves size={20} className="text-indigo-600" /> Equipment Status
            </h3>
            <div className="space-y-4">
                {equipment.length > 0 ? (
                  equipment.map((item: any) => (
                    <div 
                      key={item.id}
                      className={`flex justify-between items-center p-3 rounded-xl border ${
                        item.status === 'Operational' 
                          ? 'bg-green-50 border-green-100' 
                          : item.status === 'Maintenance'
                          ? 'bg-yellow-50 border-yellow-100'
                          : 'bg-red-50 border-red-100'
                      }`}
                    >
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className={`text-xs font-bold bg-white px-2 py-1 rounded ${
                          item.status === 'Operational' 
                            ? 'text-green-600' 
                            : item.status === 'Maintenance'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {item.status}
                        </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Waves size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No equipment registered</p>
                  </div>
                )}
            </div>
        </div>

        {/* Up Next Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800">Up Next</h3>
            </div>
            {stats?.recent_completed && stats.recent_completed.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[500px]">
                      <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                          <tr>
                              <th className="px-6 py-3">Scan Number</th>
                              <th className="px-6 py-3">Patient</th>
                              <th className="px-6 py-3">Scan Type</th>
                              <th className="px-6 py-3 text-right">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {stats.recent_completed.slice(0, 5).map((scan: any) => (
                            <tr key={scan.id} className="hover:bg-indigo-50/30">
                                <td className="px-6 py-4 font-mono text-gray-500">{scan.scan_number}</td>
                                <td className="px-6 py-4 font-bold text-[#073159]">{scan.patient_name}</td>
                                <td className="px-6 py-4">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                    {scan.scan_type}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-green-600 font-bold text-xs">{scan.status}</span>
                                </td>
                            </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Activity size={48} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">No recent scans</p>
                <p className="text-xs mt-1">Completed scans will appear here</p>
              </div>
            )}
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