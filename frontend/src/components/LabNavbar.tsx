import { useState } from "react";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  FlaskConical, 
  Menu, 
  X, 
  ArrowLeft 
} from "lucide-react";

interface LabNavbarProps {
  onMenuClick?: () => void;
}

export default function LabNavbar({ onMenuClick }: LabNavbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#073159] focus:ring-2 focus:ring-[#073159]/20 outline-none bg-gray-50 text-base"
          />
          <button 
            onClick={() => setIsMobileSearchOpen(false)}
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
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] outline-none transition-all sm:text-sm"
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

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-[#073159] hover:bg-purple-50 rounded-full transition-all">
          <Bell size={22} />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Profile Section */}
        <div className="flex items-center gap-3 cursor-pointer group border-l border-gray-100 pl-2 md:pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-[#073159]">Alex Mensah</p>
            <p className="text-xs text-gray-500">Senior Lab Tech</p>
          </div>
          
          <div className="relative">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm border border-purple-200 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FlaskConical size={18} />
            </div>
            {/* Online Dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}