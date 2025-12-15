import { useState } from "react";
import { Outlet } from "react-router-dom";
import LabSidebar from "../components/LabSidebar";
import LabNavbar from "../components/LabNavbar";

export default function LabLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState(""); // 1. Create Global Search State

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      <LabSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* 2. Pass the "Setter" to the Navbar so it can update the state */}
        <LabNavbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearch={(query) => setGlobalSearch(query)} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           {/* 3. Pass the "Value" to all child pages (Dashboard, Patients, etc.) */}
           <Outlet context={{ globalSearch }} />
        </main>
        
      </div>
    </div>
  );
}