import { Search, Bell, ChevronDown, FlaskConical } from "lucide-react";

export default function LabNavbar() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 h-20 flex items-center justify-between px-4 md:px-8 shadow-sm">
      
      <div className="flex-1 max-w-xl">
        <div className="relative">
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

      <div className="flex items-center gap-6 ml-4">
        <button className="relative p-2 text-gray-400 hover:text-[#073159] transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer group border-l border-gray-100 pl-6">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-800 group-hover:text-[#073159]">Alex Mensah</p>
            <p className="text-xs text-gray-500">Senior Lab Tech</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shadow-sm border border-purple-200">
            <FlaskConical size={18} />
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}