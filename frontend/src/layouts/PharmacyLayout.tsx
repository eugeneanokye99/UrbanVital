import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import PharmacySidebar from "../components/PharmacySidebar";
import PharmacyNavbar from "../components/PharmacyNavbar";

// Initial Mock Inventory
const INITIAL_INVENTORY_DATA = [
  { id: 1, name: "Paracetamol 500mg", category: "Analgesic", stock: 450, minLevel: 100, price: 1.50, expiry: "2026-05-20", batch: "BATCH-001" },
  { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 12, minLevel: 50, price: 15.00, expiry: "2025-12-10", batch: "BATCH-099" },
  { id: 3, name: "Artemether-Lum.", category: "Antimalarial", stock: 80, minLevel: 30, price: 35.00, expiry: "2024-02-15", batch: "BATCH-X12" }, 
  { id: 4, name: "Ciprofloxacin", category: "Antibiotic", stock: 0, minLevel: 20, price: 12.50, expiry: "2025-08-01", batch: "BATCH-882" },
  { id: 5, name: "Multivitamin Syrup", category: "Supplement", stock: 200, minLevel: 50, price: 25.00, expiry: "2026-01-01", batch: "BATCH-777" },
];

export default function PharmacyLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  
  // --- SHARED STATE ---
  const [settings, setSettings] = useState({
    lowStockThreshold: 20,
    expiryWarning: true,
    emailReport: false
  });

  const [sales, setSales] = useState([
    { id: "RX-1001", date: "24 Oct 2025", time: "10:45 AM", patient: "Williams Boampong", items: "Paracetamol, Amoxicillin", amount: 45.00, method: "Cash", pharmacist: "John Doe" },
  ]);

  const [inventory, setInventory] = useState(INITIAL_INVENTORY_DATA);
  const [generatedAlerts, setGeneratedAlerts] = useState<any[]>([]);

  // --- ALERT GENERATION LOGIC ---
  useEffect(() => {
    const newAlerts: any[] = [];

    // Check Inventory against Threshold
    inventory.forEach(item => {
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

    // Add a mock payment alert
    newAlerts.push({ 
        id: "pay-1", 
        type: "payment", 
        title: "Unpaid Prescription", 
        message: "Sarah Mensah", 
        date: "Today", 
        priority: "medium" 
    });

    setGeneratedAlerts(newAlerts);
  }, [settings.lowStockThreshold, inventory]); 

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <PharmacySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Navbar */}
        <PharmacyNavbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearch={(query) => setGlobalSearch(query)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
           {/* SINGLE OUTLET WITH UNIFIED CONTEXT */}
           <Outlet context={{ 
               globalSearch, 
               setGlobalSearch,
               sales, 
               setSales, 
               inventory, 
               setInventory,
               settings, 
               setSettings, 
               generatedAlerts,
               setGeneratedAlerts
           }} />
        </main>
      </div>
    </div>
  );
}