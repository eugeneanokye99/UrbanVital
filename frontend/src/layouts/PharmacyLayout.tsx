import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PharmacySidebar from "../components/PharmacySidebar";
import PharmacyNavbar from "../components/PharmacyNavbar";

// Initial Mock Inventory (Moved here so it's shared)
const INITIAL_INVENTORY = [
  { id: 1, name: "Paracetamol 500mg", stock: 450, minLevel: 100, expiry: "2026-05-20" },
  { id: 2, name: "Amoxicillin 500mg", stock: 12, minLevel: 50, expiry: "2025-12-10" }, // Low
  { id: 3, name: "Artemether-Lum.", stock: 80, minLevel: 30, expiry: "2024-02-15" }, 
  { id: 4, name: "Ciprofloxacin", stock: 0, minLevel: 20, expiry: "2025-08-01" }, // Empty
  { id: 5, name: "Multivitamin Syrup", stock: 200, minLevel: 50, expiry: "2026-01-01" },
];

export default function PharmacyLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  
  // --- 1. SHARED STATE ---
  const [settings, setSettings] = useState({
    lowStockThreshold: 20, // Default threshold
    expiryWarning: true,
    emailReport: false
  });

  const [generatedAlerts, setGeneratedAlerts] = useState<any[]>([]);

  // --- 2. ALERT GENERATION LOGIC ---
  useEffect(() => {
    const newAlerts = [];

    // Check Inventory against Threshold
    INITIAL_INVENTORY.forEach(item => {
      if (item.stock === 0) {
        newAlerts.push({
          id: `stock-${item.id}`,
          type: "stock",
          title: item.name,
          message: "Out of Stock! Immediate restock required.",
          date: "Today",
          priority: "high"
        });
      } else if (item.stock <= settings.lowStockThreshold) {
        newAlerts.push({
          id: `stock-${item.id}`,
          type: "stock",
          title: item.name,
          message: `Stock level (${item.stock}) is below threshold (${settings.lowStockThreshold}).`,
          date: "Today",
          priority: "medium"
        });
      }
    });

    // Add a mock payment alert just for demo
    newAlerts.push({ 
        id: "pay-1", 
        type: "payment", 
        title: "Unpaid Prescription", 
        message: "Sarah Mensah", 
        date: "Today", 
        priority: "medium" 
    });

    setGeneratedAlerts(newAlerts);
  }, [settings.lowStockThreshold]); // Re-run when threshold changes

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <PharmacySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <PharmacyNavbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearch={(query) => setGlobalSearch(query)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           {/* 3. Pass Settings & Alerts Down */}
           <Outlet context={{ 
               globalSearch, 
               settings, 
               setSettings, 
               generatedAlerts,
               setGeneratedAlerts // Allow alerts page to dismiss
           }} />
        </main>
      </div>
    </div>
  );
}