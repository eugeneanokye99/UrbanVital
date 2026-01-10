import { Menu, User, Search } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function ClinicianNavbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
      
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Simple Search (Hidden on small mobile) */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 w-64 lg:w-96">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search records..." className="bg-transparent outline-none text-sm w-full" />
        </div>
      </div>

      <div className="flex items-center gap-4">
 
        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold">
            <User size={18} />
        </div>
      </div>
    </header>
  );
}