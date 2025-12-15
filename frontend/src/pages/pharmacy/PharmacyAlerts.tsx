import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  X,
  CheckCircle,
  Clock,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function PharmacyAlerts() {
  const navigate = useNavigate();
  
  // 1. Get Live Alerts from Context
  const { generatedAlerts, setGeneratedAlerts } = useOutletContext<any>();
  
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [localAlerts, setLocalAlerts] = useState<any[]>([]);

  // Sync with global alerts when they change
  useEffect(() => {
      setLocalAlerts(generatedAlerts);
  }, [generatedAlerts]);

  // --- Handlers ---

  const handleDismiss = (id: string) => {
      // Remove locally and update context (in a real app, update DB)
      const updated = localAlerts.filter(a => a.id !== id);
      setLocalAlerts(updated);
      setGeneratedAlerts(updated); 
      toast.success("Alert dismissed");
  };

  const handleResolve = (alert: any) => {
      if (alert.type === "stock" || alert.type === "expiry") {
          navigate("/pharmacy/pharmacyinventory", { 
              state: { highlight: alert.title } 
          });
      } else if (alert.type === "payment") {
          navigate("/pharmacy/pharmacydashboard", { 
              state: { highlight: alert.message } 
          });
      }
  };

  // --- Filtering Logic ---
  const filteredAlerts = localAlerts.filter(a => {
      const matchesTab = activeTab === "all" ? true : a.type === activeTab;
      const matchesSearch = 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.message.toLowerCase().includes(search.toLowerCase());
      
      return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Pharmacy Alerts
            </h1>
            <p className="text-sm text-gray-500">Action items requiring attention.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto max-w-full no-scrollbar">
            {['all', 'expiry', 'stock', 'payment'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${
                        activeTab === tab ? 'bg-[#073159] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
          <Search className="text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="flex-1 outline-none text-sm bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
              </button>
          )}
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 gap-4">
          {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert: any) => (
                  <div key={alert.id} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform hover:-translate-y-1 ${
                      alert.priority === 'high' ? 'border-red-500' : alert.priority === 'medium' ? 'border-orange-500' : 'border-blue-500'
                  }`}>
                      
                      {/* Icon */}
                      <div className={`p-3 rounded-full flex-shrink-0 ${
                          alert.type === 'expiry' ? 'bg-orange-100 text-orange-600' :
                          alert.type === 'payment' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                          {alert.type === 'expiry' ? <Calendar size={20} /> : 
                           alert.type === 'payment' ? <CreditCard size={20} /> : 
                           <AlertTriangle size={20} />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                          <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-800">{alert.title}</h3>
                              {alert.priority === 'high' && (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Critical</span>
                              )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <Clock size={12} /> {alert.date}
                          </p>
                      </div>

                      {/* Action */}
                      <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <button 
                            onClick={() => handleDismiss(alert.id)}
                            className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-xl text-gray-500 text-xs font-bold hover:bg-gray-50 transition-colors"
                          >
                            Dismiss
                          </button>
                          <button 
                            onClick={() => handleResolve(alert)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-[#073159] text-white rounded-xl text-xs font-bold hover:bg-[#062a4d] transition-all shadow-sm active:scale-95"
                          >
                              Resolve
                          </button>
                      </div>

                  </div>
              ))
          ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <CheckCircle size={48} className="mx-auto text-green-200 mb-4" />
                  <p className="text-gray-400 font-medium">All clear! No alerts found.</p>
              </div>
          )}
      </div>

    </div>
  );
}