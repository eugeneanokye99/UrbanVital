import { useState } from "react";
import { Outlet } from "react-router-dom";
import ClinicianSidebar from "../components/ClinicianSidebar";
import ClinicianNavbar from "../components/ClinicianNavbar";

export default function ClinicianLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Pass state to Sidebar */}
      <ClinicianSidebar
        {...({ isOpen: isSidebarOpen, onClose: () => setIsSidebarOpen(false) } as any)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Pass toggle function to Navbar */}
        <ClinicianNavbar
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