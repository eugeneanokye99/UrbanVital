import { useState, useEffect } from "react";
import { 
  Search, 
  FlaskConical, 
  Menu, 
  X, 
  ArrowLeft,
} from "lucide-react";
import { fetchUserProfile } from "../services/api";

interface LabNavbarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function LabNavbar({ onMenuClick, onSearch }: LabNavbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUser, setLoadingUser] = useState(true); // Added loading state

  // Fetch Logged-in User
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  // --- Mobile Search Overlay ---
  if (isMobileSearchOpen) {
    return (
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 md:h-20 flex items-center px-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
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
            placeholder="Search Lab ID, MRN..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50 text-base"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button 
            onClick={() => {
              setSearchQuery("");
              if (onSearch) onSearch("");
              setIsMobileSearchOpen(false);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </header>
    );
  }

  // --- Standard View ---
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm transition-all">
      
      {/* --- Left Side: Mobile Menu & Search --- */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Sidebar Toggle */}
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
            placeholder="Search Lab ID, MRN, or Test Name..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all sm:text-sm"
            value={searchQuery}
            onChange={handleSearchChange}
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
          <Search size={22} />
        </button>

        {/* User Profile Display */}
        <div className="flex items-center gap-3 cursor-pointer group border-l border-gray-100 pl-2 md:pl-6">
          <div className="text-right hidden md:block">
            {loadingUser ? (
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
                        : user?.username || "Lab Technician"
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || "Laboratory Panel"}
                    </p>
                </>
            )}
          </div>
          
          <div className="relative">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm border border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-all overflow-hidden">
                {user?.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-sm">
                        {user?.username ? user.username.charAt(0).toUpperCase() : <FlaskConical size={18} />}
                    </span>
                )}
            </div>
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          
        </div>
      </div>
    </header>
  );
}