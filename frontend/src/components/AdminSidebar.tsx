
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser } from "../services/api";
import logo from "../assets/urbanvital-logo.png";
import "./AdminSidebar.css";
import { Analytics01Icon, InvoiceIcon, PackageIcon, UserGroupIcon, UserMultipleIcon, ClipboardIcon, Settings02Icon, UserAdd01Icon, CheckListIcon, DocumentValidationIcon, Analytics02FreeIcons, Analytics03Icon, Login03Icon, Logout04FreeIcons } from '@hugeicons/core-free-icons';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="UrbanVital Health Consult"
          className="logo-image"
        />
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <SidebarItem
            icon={<HugeiconsIcon icon={Analytics03Icon} size={25} />}
            label="Analytics"
            onClick={() => navigate("/admin")}
            isActive={isActive("/admin")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={UserAdd01Icon} size={25} />}
            label="Patients"
            onClick={() => navigate("/admin/patients")}
            isActive={isActive("/admin/patients")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={UserGroupIcon} size={25} />}
            label="Staff"
            onClick={() => navigate("/admin/staff")}
            isActive={isActive("/admin/staff")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={CheckListIcon} size={25} />}
            label="Inventory"
            onClick={() => navigate("/admin/inventory")}
            isActive={isActive("/admin/inventory")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={InvoiceIcon} size={25} />}
            label="Billing"
            onClick={() => navigate("/admin/billing")}
            isActive={isActive("/admin/billing")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={DocumentValidationIcon} size={25} />}
            label="Register Staff"
            onClick={() => navigate("/admin/register")}
            isActive={isActive("/admin/register")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={Settings02Icon} size={25} />}
            label="Settings"
            onClick={() => navigate("/admin/settings")}
            isActive={isActive("/admin/settings")}
          />
          <SidebarItem
            icon={<HugeiconsIcon icon={Logout04FreeIcons} size={40} color='#ba0909ff' />}
            label="Logout"
            onClick={handleLogout}
            isActive={false}
          />
        </ul>
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

function SidebarItem({ icon, label, onClick, isActive }: SidebarItemProps) {
  return (
    <li
      onClick={onClick}
      className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
    >
      <span className="sidebar-item-icon">{icon}</span>
      <span className="sidebar-item-label">{label}</span>
    </li>
  );
}