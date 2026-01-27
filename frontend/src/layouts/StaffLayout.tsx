import { useState } from "react";
import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/PhlebotomistSidebar";
import StaffNavbar from "../components/PhlebotomistNavbar";

export default function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Pass state to Sidebar */}
      <StaffSidebar
        {...({ isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) } as any)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Pass toggle function to Navbar */}
        <StaffNavbar
          {...({ onMenuClick: () => setIsSidebarOpen(true) } as any)}
        />

        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           <Outlet />
        </main>
        
      </div>
    </div>
  );
}