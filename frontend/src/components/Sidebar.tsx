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

interface AdminSidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for Desktop Collapse (w-64 vs w-20)
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
      {/* --- Mobile Overlay (Backdrop) --- */}
      {/* Only visible on mobile when sidebar is open */}
      <div 
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* --- Sidebar Container --- */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen bg-[#f7f7f7] border-r border-gray-200 shadow-xl md:shadow-none flex flex-col justify-between transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopExpanded ? "md:w-64" : "md:w-20"}
        `}
      >
        {/* Header: Logo & Toggles */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
          
          {/* Logo Area */}
          <div className={`flex items-center gap-3 overflow-hidden ${!isDesktopExpanded && "md:justify-center w-full"}`}>
            <img
              src="/urbanvital-logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            {/* Show Text only if Mobile OR Desktop is Expanded */}
            <div className={`transition-opacity duration-200 ${!isDesktopExpanded ? "md:hidden" : "block"}`}>
              <h2 className="font-bold text-[#023047] text-lg leading-none">
                UrbanVital
              </h2>
              <span className="text-[10px] font-medium text-gray-500">Health Consult</span>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded-md"
          >
            <X size={20} />
          </button>

          {/* Desktop Collapse Button */}
          {/* Hidden on mobile */}
          <button
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            className="hidden md:flex p-1.5 text-gray-400 hover:text-teal-600 hover:bg-gray-200 rounded-md transition-colors"
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
                      setMobileOpen(false); // Close sidebar on mobile after click
                    }}
                    className={`
                      relative flex items-center w-full p-3 rounded-xl transition-all duration-200 group
                      ${isActive 
                        ? "bg-teal-50 text-teal-700 font-semibold" 
                        : "text-gray-600 hover:bg-white hover:text-teal-600 hover:shadow-sm"
                      }
                      ${!isDesktopExpanded ? "md:justify-center" : ""}
                    `}
                  >
                    {/* Icon */}
                    <span className={`shrink-0 ${isActive ? "text-teal-600" : "text-gray-400 group-hover:text-teal-500"}`}>
                      {item.icon}
                    </span>

                    {/* Label - Hidden when collapsed on desktop */}
                    <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      !isDesktopExpanded ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
                    }`}>
                      {item.label}
                    </span>

                    {/* Active Indicator Strip (Optional Design Touch) */}
                    {isActive && (
                      <div className="absolute right-0 w-1 h-8 bg-teal-600 rounded-l-full hidden md:block" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200/50">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full p-2.5 rounded-xl transition-colors
              text-red-500 hover:bg-red-50 hover:text-red-600
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