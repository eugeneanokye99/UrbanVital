import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  TestTube, 
  Microscope, 
  ClipboardList, 
  LogOut, 
  BookOpenText,
  X 
} from "lucide-react";
import { logoutUser } from "../services/api";
import logo from "../assets/urbanvital-logo.png";

// Define Props
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LabSidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const menuItems = [
    { path: "/lab/labdashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { path: "/lab/labqueue", label: "Test Queue", icon: <TestTube size={20} /> },
    { path: "/lab/labentry", label: "Result Entry", icon: <Microscope size={20} /> },
    { path: "/lab/labresults", label: "Completed Results", icon: <ClipboardList size={20} /> },
    { path: "/lab/labinventory", label: "Inventory", icon: <BookOpenText size={20} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <aside 
        // Force background color via inline style to ensure theme applies immediately
        style={{ backgroundColor: 'var(--primary)' }}
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 h-full flex flex-col shadow-2xl 
          transition-transform duration-300 ease-in-out font-sans
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        
        {/* --- Logo Section --- */}
        <div className="h-20 md:h-24 flex items-center justify-between border-b border-white/10 p-4">
          <div className="bg-white/95 p-2 rounded-xl w-32 md:w-full h-10 md:h-full flex items-center justify-center shadow-lg">
             <img src={logo} alt="UrbanVital" className="h-full w-auto object-contain" />
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onClose} 
            className="md:hidden p-2 text-white/70 hover:text-white bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Role Badge --- */}
        <div className="px-6 py-4">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3 border border-white/5 backdrop-blur-sm">
             {/* Fixed: Changed bg-purple-500/20 to bg-white/20 and text-purple-300 to text-white */}
             <div className="p-2 bg-white/20 rounded-full text-white">
                <Microscope size={18} />
             </div>
             <div>
                <p className="text-white text-xs font-bold uppercase tracking-wider">Laboratory</p>
                {/* Fixed: Changed text-blue-200 to text-white/70 */}
                <p className="text-white/70 text-[10px]">Technician Panel</p>
             </div>
          </div>
        </div>

        {/* --- Navigation --- */}
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
                    // Fixed: Changed text-blue-100/70 to text-white/70
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative group ${
                      isActive
                        ? "text-white bg-white/10 shadow-inner"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      // Fixed: Changed bg-purple-400 to bg-white
                      <div className="absolute left-2 w-1 h-6 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                    )}
                    
                    {/* Fixed: Changed text-purple-400 to text-white */}
                    <span className={`ml-2 ${isActive ? "text-white" : "group-hover:text-white"}`}>
                      {item.icon}
                    </span>
                    
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* --- Logout --- */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            // Fixed: Changed text-red-300 to text-red-100/text-white
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-100 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout System</span>
          </button>
        </div>
      </aside>
    </>
  );
}