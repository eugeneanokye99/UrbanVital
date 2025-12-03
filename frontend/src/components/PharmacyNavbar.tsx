import { Search, Bell, ChevronDown, Pill } from "lucide-react";

export default function PharmacyNavbar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
      
      {/* --- Left: Search --- */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search drug inventory or prescription ID..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] outline-none transition-all sm:text-sm"
          />
        </div>
      </div>

      {/* --- Right: Actions & Profile --- */}
      <div className="flex items-center gap-6 ml-4">
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-[#073159] transition-colors">
          <Bell size={22} />
          {/* Red dot for low stock alerts */}
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer group border-l border-gray-100 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-[#073159]">Pharm. John Doe</p>
            <p className="text-xs text-gray-500">Head Pharmacist</p>
          </div>
          
          <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm border border-teal-200 group-hover:bg-[#073159] group-hover:text-white transition-all">
            <Pill size={18} />
          </div>
          
          <ChevronDown size={16} className="text-gray-400 group-hover:text-[#073159] transition-colors" />
        </div>
      </div>
    </header>
  );
}