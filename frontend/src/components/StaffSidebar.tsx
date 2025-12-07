import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CreditCard, 
  LogOut, UserCheck,
  Stethoscope 
} from "lucide-react";
import { logoutUser } from "../services/api";
import logo from "../assets/urbanvital-logo.png";

export default function StaffSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const menuItems = [
    { path: "/frontdesk/staffdashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/frontdesk/checkin", label: "Check In", icon: <UserCheck size={20} /> }, 
    { path: "/frontdesk/patients", label: "Patients List", icon: <Users size={20} /> },
    { path: "/frontdesk/registerpatient", label: "Register Patient", icon: <UserPlus size={20} /> },
    { path: "/frontdesk/billings", label: "Billing", icon: <CreditCard size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#073159] h-full flex flex-col shadow-2xl transition-all duration-300 font-sans">
      
      {/* --- Logo Section --- */}
      <div className="h-24 flex items-center justify-center border-b border-white/10 p-4">
        <div className="bg-white/95 p-2 rounded-xl w-full h-full flex items-center justify-center shadow-lg">
            <img
            src={logo}
            alt="UrbanVital"
            className="h-full w-auto object-contain"
            />
        </div>
      </div>

      {/* --- Staff Badge --- */}
      <div className="px-6 py-4">
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 border border-white/5 backdrop-blur-sm">
            <div className="p-2 bg-green-500/20 rounded-full text-green-300">
                <Stethoscope size={18} />
            </div>
            <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">Staff Portal</p>
                <p className="text-blue-200 text-[10px]">Medical Access</p>
            </div>
        </div>
      </div>

      {/* --- Navigation --- */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all duration-200 relative group ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-blue-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                  )}
                  
                  {/* Icon */}
                  <span className={`${isActive ? "text-green-400" : "group-hover:text-white"}`}>
                    {item.icon}
                  </span>
                  
                  {/* Label */}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* --- Bottom Section (Logout) --- */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/80 rounded-xl transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout System</span>
        </button>
        <p className="text-center text-[10px] text-blue-300/40 mt-4">
          UrbanVital • Staff Panel
        </p>
      </div>
    </aside>
  );
}