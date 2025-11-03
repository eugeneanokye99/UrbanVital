import { useEffect, useState } from "react";
import { fetchUserProfile } from "../../services/api";
import AdminNavbar from "../../components/Navbar";
import AdminSidebar from "../../components/Sidebar";
import DashboardCard from "../../components/DashboardCard";
import {
  Users,
  FlaskConical,
  Pill,
  DollarSign,
  Download,
  TrendingUp,
  Activity,
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState({
    revenue: 8900,
    outstanding: 2500,
    lowStock: 8,
  });

  const [recentActivity] = useState([
    { id: 1, action: "Registered new Clinician", time: "2 mins ago" },
    { id: 2, action: "Processed 4 lab results", time: "1 hour ago" },
    { id: 3, action: "Updated patient billing info", time: "3 hours ago" },
  ]);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);

  // --- Export Dashboard Data ---
  const exportDashboardData = () => {
    const data = {
      analytics,
      recentActivity,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `UrbanVital_Admin_Report_${new Date()
      .toISOString()
      .split("T")[0]}.json`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
              {user && (
                <p className="text-gray-500 text-sm mt-1">
                  Welcome, {user.username} 👋
                </p>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={exportDashboardData}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Download size={18} />
              Export Data
            </button>
          </div>

          {/* --- Summary Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Registered Users"
              value="24"
              icon={<Users size={28} />}
              color="border-blue-500"
            />
            <DashboardCard
              title="Lab Requests"
              value="12"
              icon={<FlaskConical size={28} />}
              color="border-purple-500"
            />
            <DashboardCard
              title="Prescriptions"
              value="45"
              icon={<Pill size={28} />}
              color="border-green-500"
            />
            <DashboardCard
              title="Revenue (₵)"
              value={analytics.revenue}
              icon={<DollarSign size={28} />}
              color="border-yellow-500"
            />
          </div>

          {/* --- Analytics Section --- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <TrendingUp size={18} /> Billing & Payments
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Total Revenue</span>
                  <span className="font-medium text-green-600">
                    ₵{analytics.revenue.toLocaleString()}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Outstanding Balances</span>
                  <span className="font-medium text-red-500">
                    ₵{analytics.outstanding.toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
                <ClipboardList size={18} /> Financial Overview
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Total Revenue</span>
                  <span>₵{analytics.revenue}</span>
                </li>
                <li className="flex justify-between">
                  <span>Outstanding Balances</span>
                  <span>₵{analytics.outstanding}</span>
                </li>
                <li className="flex justify-between">
                  <span>Low Stock Items</span>
                  <span>{analytics.lowStock}</span>
                </li>
              </ul>
            </div>
          </section>

          {/* --- Mini Charts Area (Placeholder for Recharts later) --- */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5 h-60 flex flex-col justify-center items-center text-gray-400 border border-dashed">
              <FileSpreadsheet size={32} />
              <p className="mt-2 text-sm">Revenue Trend Chart (Coming soon)</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 h-60 flex flex-col justify-center items-center text-gray-400 border border-dashed">
              <Activity size={32} />
              <p className="mt-2 text-sm">Service Distribution Chart (Coming soon)</p>
            </div>
          </section>

          {/* --- Recent Activity --- */}
          <section className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <Activity size={18} /> Recent Activity
            </h3>
            <ul className="divide-y text-sm">
              {recentActivity.map((act) => (
                <li key={act.id} className="py-2 flex justify-between">
                  <span>{act.action}</span>
                  <span className="text-gray-500 text-xs">{act.time}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* --- Quick Actions --- */}
          <section className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <PlusCircle size={18} /> Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Register Staff
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
                View Billing
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                View Lab Reports
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600">
                View Prescriptions
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
