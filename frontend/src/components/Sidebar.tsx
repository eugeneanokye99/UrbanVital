import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/api";
import { useState } from "react";
// Make sure logo import path is correct
import logo from "../assets/urbanvital-logo.png"; 

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/admin" },
    { icon: <Users size={20} />, label: "Patients", path: "/admin/patients" },
    { icon: <Stethoscope size={20} />, label: "Staff", path: "/admin/staff" },
    { icon: <Package size={20} />, label: "Inventory", path: "/admin/inventory" },
    { icon: <Receipt size={20} />, label: "Billing", path: "/admin/billing" },
    { icon: <ClipboardList size={20} />, label: "Register", path: "/admin/register" },
    { icon: <Settings size={20} />, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen 
          bg-primary text-white 
          shadow-xl md:shadow-none flex flex-col justify-between transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopExpanded ? "md:w-64" : "md:w-20"}
        `}
      >
        {/* Header: Logo & Toggles */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-white/10">
          
          {/* Logo Area */}
          <div className={`flex items-center gap-3 overflow-hidden ${!isDesktopExpanded && "md:justify-center w-full"}`}>
            <div className="bg-white p-1.5 rounded-lg shrink-0">
                 <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            
            <div className={`transition-opacity duration-200 ${!isDesktopExpanded ? "md:hidden" : "block"}`}>
              <h2 className="font-bold text-white text-lg leading-none">
                UrbanVital
              </h2>
              <span className="text-[10px] font-medium text-white/70">Health Consult</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-white/70 hover:bg-white/10 rounded-md"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className="hidden md:flex p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            {isDesktopExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 mt-4 px-3 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`
                      relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? "bg-white/20 text-white font-semibold shadow-inner" 
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                      }
                      ${!isDesktopExpanded ? "md:justify-center" : ""}
                    `}
                  >
                    {/* Icon */}
                    <span className={`shrink-0 ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      !isDesktopExpanded ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
                    }`}>
                      {item.label}
                    </span>

                    {/* Active Indicator Strip */}
                    {isActive && (
                      <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full hidden md:block" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full p-2.5 rounded-xl transition-colors
              text-red-200 hover:bg-red-500/20 hover:text-white
              ${!isDesktopExpanded ? "md:justify-center" : ""}
            `}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                !isDesktopExpanded ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
            }`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}