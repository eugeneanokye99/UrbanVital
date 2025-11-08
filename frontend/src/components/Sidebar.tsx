import {
  LayoutDashboard,
  Users,
  UserPlus,
  Package,
  Receipt,
  Settings,
  LogOut,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { useState } from "react";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#f7f7f7] h-screen flex flex-col justify-between transition-all duration-300 shadow-md`}
    >
      {/* Logo and toggle */}
      <div className="flex items-center justify-between px-4 pt-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <img
              src="/urbanvital-logo.png"
              alt="UrbanVital"
              className="w-8 h-8"
            />
            <h2 className="font-bold text-[#023047] text-lg leading-tight">
              UrbanVital
              <span className="block text-xs font-medium text-gray-500">
                Health Consult
              </span>
            </h2>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-500 hover:text-teal-600"
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 px-4">
        <ul className="space-y-2 text-[#023047]">
          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            onClick={() => navigate("/admin")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Patients"
            onClick={() => navigate("/admin/patients")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<Stethoscope size={18} />}
            label="Staff"
            onClick={() => navigate("/admin/staff")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<Package size={18} />}
            label="Inventory"
            onClick={() => navigate("/admin/inventory")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<Receipt size={18} />}
            label="Billing"
            onClick={() => navigate("/admin/billing")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<ClipboardList size={18} />}
            label="Register"
            onClick={() => navigate("/admin/register")}
            isOpen={isOpen}
          />
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            onClick={() => navigate("/admin/settings")}
            isOpen={isOpen}
          />
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 p-2 rounded-md hover:bg-red-100 text-red-600 font-medium"
        >
          <LogOut size={18} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isOpen: boolean;
}

function SidebarItem({ icon, label, onClick, isOpen }: SidebarItemProps) {
  return (
    <li
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-[#e0f2f1] transition-colors"
    >
      {icon}
      {isOpen && <span className="font-medium text-[15px]">{label}</span>}
    </li>
  );
}
