    import { useEffect, useState } from "react";
    import { fetchUserProfile } from "../../services/api";
    import StaffNavbar from "../../components/StaffNavbar";
    import StaffSidebar from "../../components/StaffSidebar";
    import { HugeiconsIcon } from "@hugeicons/react";
    import {
      Analytics03Icon,
      InvoiceIcon,
      UserMultipleIcon,
      MedicineBottle02Icon,
      Alert01FreeIcons, PrinterIcon, FilterHorizontalIcon, CheckListIcon
    } from "@hugeicons/core-free-icons";
    import "./StaffDashboard.css";
    
    export default function StaffDashboard() {
      const [user, setUser] = useState<any>(null);

    
      const [recentActivity] = useState([
        { id: 1, action: "3 drugs expire in <7 days [View]", status: "unread" },
        { id: 2, action: "Paracetamol stockout risk [Reorder]", status: "unread" },
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
    
      const monthlyData = [
        { month: "Jan", values: [12, 18, 15, 20] },
        { month: "Feb", values: [15, 22, 18, 24] },
        { month: "Mar", values: [18, 14, 20, 16] },
        { month: "Apr", values: [16, 20, 18, 22] },
        { month: "May", values: [20, 25, 22, 26] },
        { month: "Jun", values: [22, 18, 20, 16] },
      ];
    
      useEffect(() => {
        fetchUserProfile()
          .then((data) => setUser(data))
          .catch(() => console.error("Failed to fetch user"));
      }, []);
    
      const exportDashboardData = () => {
        const data = {
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
    
      const maxWeekly = Math.max(...weeklyData.map((d) => d.value));
    
      return (
        <div className="dashboard-container">
          <StaffSidebar />
          <div className="dashboard-main">
            <StaffNavbar />

            <main className="dashboard-content">
              {/* Header */}
              <div className="dashboard-header">
                <div className="header-left">
                  <h2 className="dashboard-date">
                    Mon,{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </h2>
                  {user && <p className="welcome-text">Welcome back, {user.username} 👋</p>}
                </div>
                <div className="header-right">
                  <span className="today-label">Today</span>
                <button className="date-btn">
                  <HugeiconsIcon icon={FilterHorizontalIcon} size={20} />
                  Filter
                </button>
                </div>
              </div>
    
    
              {/* Charts Section */}
              <div className="charts-grid">
                {/* Weekly Revenue Chart */}
                <div className="chart-card">
                  <h3 className="chart-title">Weekly Revenue</h3>
                  <svg width="100%" height="200" viewBox="0 0 600 200">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="50"
                        y1={40 + i * 40}
                        x2="580"
                        y2={40 + i * 40}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    {weeklyData.map((d, i) => {
                      const x = 80 + i * 80;
                      const y = 180 - (d.value / maxWeekly) * 140;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="#7c3aed" />
                          <text x={x} y={y - 15} fontSize="12" fill="#6b7280" textAnchor="middle">
                            {d.value}
                          </text>
                        </g>
                      );
                    })}
                    <path
                      d={weeklyData
                        .map((d, i) => {
                          const x = 80 + i * 80;
                          const y = 180 - (d.value / maxWeekly) * 140;
                          return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />
                    {weeklyData.map((d, i) => (
                      <text
                        key={i}
                        x={80 + i * 80}
                        y="195"
                        fontSize="12"
                        fill="#9ca3af"
                        textAnchor="middle"
                      >
                        {d.day}
                      </text>
                    ))}
                  </svg>
                </div>
    
                {/* Monthly Visits Chart */}
                <div className="chart-card">
                  <h3 className="chart-title">Monthly Visits</h3>
                  <svg width="100%" height="200" viewBox="0 0 600 200">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="50"
                        y1={40 + i * 40}
                        x2="580"
                        y2={40 + i * 40}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    {monthlyData.map((month, i) =>
                      month.values.map((val, j) => {
                        const x = 80 + i * 85 + j * 15;
                        const height = (val / 30) * 140;
                        const y = 180 - height;
                        const colors = ["#f59e0b", "#7c3aed", "#ec4899", "#8b5cf6"];
                        return <rect key={`${i}-${j}`} x={x} y={y} width="12" height={height} fill={colors[j]} rx="2" />;
                      })
                    )}
                    {monthlyData.map((month, i) => (
                      <text
                        key={i}
                        x={80 + i * 85 + 30}
                        y="195"
                        fontSize="12"
                        fill="#9ca3af"
                        textAnchor="middle"
                      >
                        {month.month}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
    
              {/* Alerts Section */}
              <div className="alerts-section">
                <div className="alert-card">
                  <div className="alert-header">
                    <HugeiconsIcon icon={Alert01FreeIcons} size={22} />
                    <h3>Alerts</h3>
                  </div>
                  <div className="alert-list">
                    {recentActivity.map((alert) => (
                      <div key={alert.id} className="alert-item">
                        <div className="alert-pill">{alert.action}</div>
                        <span className="alert-status">{alert.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
    
                {/* Empty Placeholder Card */}
                <div className="alert-card empty-card"></div>
              </div>
    
              {/* Export Button */}
              <button onClick={exportDashboardData} className="print-button">
                <HugeiconsIcon icon={PrinterIcon} size={20} />
                Export Dashboard
              </button>
            </main>
          </div>
        </div>
      );
    }
    
    interface MetricCardProps {
      icon: React.ReactNode;
      title: string;
      value: string;
      change?: string;
      positive?: boolean;
    }
    
    function MetricCard({ icon, title, value, change, positive }: MetricCardProps) {
      return (
        <div className="metric-card">
          <div className="metric-icon">{icon}</div>
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">{value}</div>
          {change && <span className={`metric-change ${positive ? "positive" : "negative"}`}>{change}</span>}
        </div>
      );
    }
    