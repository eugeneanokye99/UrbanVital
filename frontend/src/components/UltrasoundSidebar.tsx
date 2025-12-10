import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Waves, // Good icon for Ultrasound
  FileImage, 
  History, 
  LogOut, 
  X,
  Settings
} from "lucide-react";
import { logoutUser } from "../services/api";
import logo from "../assets/urbanvital-logo.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function UltrasoundSidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/ultrasound/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/ultrasound/worklist", label: "Scan Worklist", icon: <Waves size={20} /> },
    { path: "/ultrasound/reports", label: "Report Entry", icon: <FileImage size={20} /> },
    { path: "/ultrasound/history", label: "Scan History", icon: <History size={20} /> },
    { path: "/ultrasound/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      <aside 
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#073159] h-full flex flex-col shadow-2xl 
          transition-transform duration-300 ease-in-out font-sans
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-20 md:h-24 flex items-center justify-between border-b border-white/10 p-4">
          <div className="bg-white/95 p-2 rounded-xl w-32 md:w-full h-10 md:h-full flex items-center justify-center shadow-lg">
             <img src={logo} alt="UrbanVital" className="h-full w-auto object-contain" />
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-white/70 hover:text-white bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 border border-white/5 backdrop-blur-sm">
             <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-300">
                <Waves size={18} />
             </div>
             <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">Radiology</p>
                <p className="text-blue-200 text-[10px]">Ultrasound Unit</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                        navigate(item.path);
                        if(onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative group ${
                      isActive
                        ? "text-white bg-white/10 shadow-inner"
                        : "text-blue-100/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && <div className="absolute left-2 w-1 h-6 rounded-full bg-indigo-400"></div>}
                    <span className={`ml-2 ${isActive ? "text-indigo-400" : "group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logoutUser(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all">
            <LogOut size={20} />
            <span>Logout System</span>
          </button>
        </div>
      </aside>
    </>
  );
}