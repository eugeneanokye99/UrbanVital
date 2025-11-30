import { useState, useEffect } from "react";
import { 
  Search, 
  Menu, 
  Bell, 
  Settings, 
  ChevronDown 
} from "lucide-react";
import { fetchUserProfile } from "../services/api";

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-8 shadow-sm transition-all">
      
      {/* --- Left Side: Mobile Menu & Search --- */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle (Visible only on small screens) */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients, doctors, or records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition-all duration-200 sm:text-sm"
          />
        </div>
      </div>

      {/* --- Right Side: Actions & Profile --- */}
      <div className="flex items-center gap-4 md:gap-6">
        
        {/* Quick Action Icons */}
        <div className="flex items-center gap-2 border-r border-gray-100 pr-4 md:pr-6">
          <button className="p-2 text-gray-400 hover:text-[#073159] hover:bg-blue-50 rounded-full transition-all relative">
            <Bell size={20} />
            {/* Notification Dot */}
            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-[#073159] hover:bg-blue-50 rounded-full transition-all hidden sm:block">
            <Settings size={20} />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-[#073159] transition-colors">
              {user ? user.username : "Dr. Kofi Asante"}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>

          <div className="relative">
            {/* Avatar Circle */}
            <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
              {user?.username ? user.username.charAt(0) : "A"}
            </div>
            
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <ChevronDown size={16} className="text-gray-400 group-hover:text-[#073159] transition-colors" />
        </div>

      </div>
    </header>
  );
}