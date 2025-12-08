import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
  // State to control the mobile sidebar
  // Default is false (closed) on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar: Controlled by state */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Navbar: Has the Hamburger button to open sidebar */}
        <AdminNavbar 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        {/* This renders the child route (Dashboard, Patients, etc.) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           <Outlet />
        </main>
        
      </div>
    </div>
  );
}