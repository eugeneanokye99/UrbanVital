import { useState, useEffect } from "react";
import { 
  Search, 
  Menu, 
  Bell, 
  Settings, 
  ChevronDown,
  User,
  ArrowLeft,
  X 
} from "lucide-react";
import { fetchUserProfile } from "../services/api";

interface StaffNavbarProps {
  onMenuClick?: () => void;
}

export default function StaffNavbar({ onMenuClick }: StaffNavbarProps) {
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUser(data))
      .catch(() => console.error("Failed to fetch user"));
  }, []);

  // --- Mobile Search Overlay ---
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
            placeholder="Search patient MRN, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#073159] focus:ring-2 focus:ring-[#073159]/20 outline-none bg-gray-50 text-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
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
      
      {/* --- Left Side: Mobile Menu & Search --- */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Toggle */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Desktop Search Bar */}
        <div className="relative w-full max-w-md hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patient MRN, name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition-all duration-200 sm:text-sm"
          />
        </div>
      </div>

      {/* --- Right Side: Actions & Profile --- */}
      <div className="flex items-center gap-2 md:gap-6">
        
        {/* Mobile Search Trigger */}
        <button 
          onClick={() => setIsMobileSearchOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full md:hidden"
        >
          <Search size={24} />
        </button>



        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-[#073159] transition-colors">
              {user ? user.username : "Agnes Asante"}
            </p>
            <p className="text-xs text-gray-500">Front Desk / Staff</p>
          </div>

          <div className="relative">
            {/* Avatar Circle */}
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-blue-50 text-[#073159] border border-blue-100 flex items-center justify-center font-bold text-xs md:text-sm shadow-sm group-hover:bg-[#073159] group-hover:text-white transition-all">
              {user?.username ? user.username.charAt(0) : <User size={18} />}
            </div>
            
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 md:h-3 md:w-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <ChevronDown size={16} className="text-gray-400 group-hover:text-[#073159] transition-colors hidden sm:block" />
        </div>

      </div>
    </header>
  );
}