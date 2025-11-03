import { LayoutDashboard, UserPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-6 text-gray-700">Menu</h2>
        <ul className="space-y-3">
          <li
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </li>

          <li
            onClick={() => navigate("/admin/register")}
            className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100"
          >
            <UserPlus size={18} />
            <span>Register User</span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-2 rounded-md hover:bg-red-100 text-red-600 font-medium"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
