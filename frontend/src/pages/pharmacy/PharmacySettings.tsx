import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Bell, 
  Save, 
  AlertTriangle
} from "lucide-react";

export default function PharmacySettings() {
  // 1. Consume Global Context
  const { settings, setSettings } = useOutletContext<any>();
  
  // Local state for form handling before saving
  const [localThreshold, setLocalThreshold] = useState(settings.lowStockThreshold);
  const [localExpiry, setLocalExpiry] = useState(settings.expiryWarning);
  const [localEmail, setLocalEmail] = useState(settings.emailReport);

  // Sync local state if global settings change elsewhere
  useEffect(() => {
      setLocalThreshold(settings.lowStockThreshold);
  }, [settings]);

  const handleSave = () => {
      // 2. Update Global State
      setSettings({
          ...settings,
          lowStockThreshold: localThreshold,
          expiryWarning: localExpiry,
          emailReport: localEmail
      });
      toast.success("Preferences saved & Alerts updated!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Notification Settings</h1>
      <p className="text-sm text-gray-500">Configure how and when you receive system alerts.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                <Bell size={24} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">Inventory Thresholds</h2>
                <p className="text-xs text-gray-500">Set limits for automatic stock warnings</p>
            </div>
        </div>

        <div className="space-y-8 max-w-lg">
            
            {/* Low Stock Warning */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-4">
                <AlertTriangle className="text-orange-500 flex-shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-orange-800 text-sm">Global Low Stock Level</h4>
                    <p className="text-xs text-orange-700 mt-1 mb-3">
                        Drugs falling below this quantity will automatically appear in the 'Alerts' dashboard.
                    </p>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="5" 
                            max="100" 
                            value={localThreshold} 
                            onChange={(e) => setLocalThreshold(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                        <div className="h-8 w-12 flex items-center justify-center bg-white border border-orange-200 rounded font-bold text-orange-700 text-sm shadow-sm">
                            {localThreshold}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Expiry Warning</p>
                        <p className="text-xs text-gray-500">Notify me 3 months before drugs expire</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={localExpiry}
                        onChange={(e) => setLocalExpiry(e.target.checked)}
                        className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300 cursor-pointer" 
                    />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                        <p className="font-bold text-gray-800 text-sm">Daily Email Report</p>
                        <p className="text-xs text-gray-500">Receive a summary of all alerts via email</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={localEmail}
                        onChange={(e) => setLocalEmail(e.target.checked)}
                        className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300 cursor-pointer" 
                    />
                </div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={handleSave}
                    className="bg-[#073159] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#062a4d] shadow-lg active:scale-95 transition-all w-full sm:w-auto"
                >
                    <Save size={18} /> Save Preferences
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}