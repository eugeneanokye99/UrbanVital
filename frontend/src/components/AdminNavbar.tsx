import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { 
  Search, 
  Menu, 
  Bell, 
  X,
  ArrowLeft,
  User 
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { fetchNotifications } from '../services/notifications';

interface AdminNavbarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function AdminNavbar({ onMenuClick, onSearch }: AdminNavbarProps) {
  const navigate = useNavigate(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, loading } = useUser();
  // Poll notifications for unread count (only if admin)
  useEffect(() => {
    if (loading) return;
    if (user?.role !== 'admin') return;
    let interval: any;
    const loadUnread = async () => {
      try {
        const notifs = await fetchNotifications();
        setUnreadCount(notifs.filter((n: any) => !n.is_read).length);
      } catch {}
    };
    loadUnread();
    interval = setInterval(loadUnread, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [user, loading]);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  // --- Mobile Search View ---
  if (isMobileSearchOpen) {
    return (
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-20 flex items-center px-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
        <button 
          onClick={() => setIsMobileSearchOpen(false)}
          className="p-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="relative flex-1">
          <input
            autoFocus
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            // Fixed: Removed opacity modifier '/20' to ensure ring color shows up
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50 text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => {
                  setSearchQuery("");
                  if (onSearch) onSearch("");
              }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>
    );
  }

  // --- Standard View ---
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-8 shadow-sm transition-all">
      
      {/* --- Left Side --- */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients, doctors, or records..."
            value={searchQuery}
            onChange={handleSearchChange}
            // Fixed: changed ring-primary/20 to ring-primary (solid) or just border-primary
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 sm:text-sm"
          />
        </div>
      </div>

      {/* --- Right Side --- */}
      <div className="flex items-center gap-2 md:gap-6">
        
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full md:hidden"
        >
          <Search size={24} />
        </button>

        <div className="flex items-center border-r border-gray-100 pr-2 md:pr-6">
          <button 
            onClick={() => navigate("/admin/notifications")} 
            // Fixed: Changed hover:bg-blue-50 to hover:bg-gray-100 to be theme-neutral
            className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-all relative"
          >
            <Bell size={20} />
            {/* Notification Dot */}
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 cursor-pointer group pl-2">
          <div className="text-right hidden md:block">
            {loading ? (
                // Loading Skeleton for Name
                <div className="flex flex-col items-end gap-1">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-2 w-16 bg-gray-100 rounded animate-pulse"></div>
                </div>
            ) : (
                <>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                      {user?.first_name 
                        ? `${user.first_name} ${user.last_name || ''}` 
                        : user?.username || "Administrator"
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "System Admin"}
                    </p>
                </>
            )}
          </div>

          <div className="relative">
            {/* Fixed: 
               1. Removed 'ring-blue-100' -> changed to 'ring-gray-200' 
               2. Ensure bg-primary uses the variable correctly
            */}
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-md ring-2 ring-white group-hover:ring-gray-200 transition-all overflow-hidden">
                {user?.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-sm">
                        {user?.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
                    </span>
                )}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

        </div>

      </div>
    </header>
  );
}