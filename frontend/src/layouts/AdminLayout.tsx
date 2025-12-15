import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  // State to control the mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 1. Lifted Search State
  const [globalSearch, setGlobalSearch] = useState("");

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar: Controlled by state */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Navbar: Pass the search setter */}
        <AdminNavbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onSearch={(query) => setGlobalSearch(query)} 
        />

        {/* This renders the child route (Dashboard, Patients, etc.) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           {/* 2. Pass the search value to children via Context */}
           <Outlet context={{ globalSearch, setGlobalSearch }} />
        </main>
        
      </div>
    </div>
  );
}