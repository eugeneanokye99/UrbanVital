import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  UserCog,FileText,
  X
} from "lucide-react";
import { logoutUser } from "../services/api";
import logo from "../assets/urbanvital-logo.png";

// 2. Define props for mobile control
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Analytics", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/patients", label: "Patients", icon: <Users size={20} /> },
    { path: "/admin/inventory", label: "Inventory", icon: <Package size={20} /> },
    { path: "/admin/finance", label: "Finance & Revenue", icon: <CreditCard size={20} /> },
    { path: "/admin/lab-records", label: "Lab Records", icon: <FileText size={20} /> },
    { path: "/admin/staff", label: "Staff Management", icon: <UserCog size={20} /> },
    { path: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
    
  ];

  return (
    <>
      {/* 3. Mobile Backdrop (Click to close) */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* 4. Sidebar Container */}
      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#073159] h-full flex flex-col shadow-2xl 
          transition-transform duration-300 ease-in-out font-sans
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        
        {/* --- Logo Section --- */}
        <div className="h-20 md:h-24 flex items-center justify-between border-b border-white/10 p-4">
          <div className="bg-white/95 p-2 rounded-xl w-32 md:w-full h-10 md:h-full flex items-center justify-center shadow-lg">
             <img src={logo} alt="UrbanVital" className="h-full w-auto object-contain" />
          </div>
          
          {/* 5. Mobile Close Button */}
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-white/70 hover:text-white bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Admin Badge --- */}
        <div className="px-6 py-4">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 border border-white/5 backdrop-blur-sm">
             <div className="p-2 bg-blue-500/20 rounded-full text-blue-200">
                <ShieldCheck size={18} />
             </div>
             <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">Admin Panel</p>
                <p className="text-blue-200 text-[10px]">Superuser Access</p>
             </div>
          </div>
        </div>

        {/* --- Navigation --- */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                        navigate(item.path);
                        if(onClose) onClose(); // Close on mobile when link clicked
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative group ${
                      isActive
                        ? "text-white bg-white/10 shadow-inner"
                        : "text-blue-100/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                    )}
                    
                    <span className={`ml-2 ${isActive ? "text-green-400" : "group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    
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
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout System</span>
          </button>
          <p className="text-center text-[10px] text-blue-300/40 mt-4">
            v1.0.4 • UrbanVital Health
          </p>
        </div>
      </aside>
    </>
  );
}