import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  TestTube, 
  Droplet, 
  FileText,
  CheckCircle,
  Loader2,
  Plus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchLabWorklist, collectLabSample, startLabProcessing } from "../../services/api";

export default function LabTestQueue() {
  const navigate = useNavigate();
  const { globalSearch } = useOutletContext<{ globalSearch: string }>();
  
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [sampleCollected, setSampleCollected] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);

  useEffect(() => {
    loadWorklist();
  }, []);

  const loadWorklist = async () => {
    try {
      setLoading(true);
      const data = await fetchLabWorklist();
      setPendingOrders(data.pending_orders || []);
      setSampleCollected(data.sample_collected || []);
      setInProgress(data.in_progress || []);
    } catch (error) {
      console.error("Error loading worklist:", error);
      toast.error("Failed to load worklist");
    } finally {
      setLoading(false);
    }
  };

  // Get current orders based on filter
  const getCurrentOrders = () => {
    if (filter === "Pending") return pendingOrders;
    if (filter === "Processing") return [...sampleCollected, ...inProgress];
    if (filter === "Completed") return [];
    return [];
  };

  const filteredQueue = getCurrentOrders().filter(item => {
    const searchLower = globalSearch.toLowerCase();
    return (
      item.patient_name?.toLowerCase().includes(searchLower) ||
      item.patient_mrn?.toLowerCase().includes(searchLower) ||
      item.tests?.some((t: any) => t.test_name?.toLowerCase().includes(searchLower))
    );
  });

  // --- Handlers ---

  const handleCollect = async (id: number, patientName: string) => {
    try {
      await collectLabSample(id);
      toast.success(`Sample collected for ${patientName}`);
      await loadWorklist();
    } catch (error: any) {
      console.error("Error collecting sample:", error);
      toast.error(error?.response?.data?.detail || "Failed to collect sample");
    }
  };

  const handleEnterResult = async (item: any) => {
    try {
      await startLabProcessing(item.id);
      navigate("/lab/labentry", { 
          state: { 
              order: item,
              patient: { name: item.patient_name, mrn: item.patient_mrn },
          } 
      });
    } catch (error: any) {
      console.error("Error starting processing:", error);
      toast.error(error?.response?.data?.detail || "Failed to start processing");
    }
  };

  const handleViewReport = (item: any) => {
      // Mock result data for preview
      const mockResult = {
          id: `REQ-${item.id}`,
          test: item.test,
          date: new Date().toLocaleDateString(),
          time: "10:00 AM",
          result: "Normal (Mock)",
          tech: "Current User"
      };

      navigate("/lab/labresult-view", {
          state: {
              record: mockResult,
              patient: { name: item.patient, age: 30, gender: "Male", mrn: item.mrn }
          }
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Test Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pending lab requests and sample collection</p>
        </div>
        
        <button
          onClick={() => navigate("/lab/labentry")}
          className="bg-[#073159] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#062a4d] transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> New Lab Order
        </button>
      </div>

      {/* Filter Tabs - moved below header */}
      <div className="flex justify-start">
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
          {['Pending', 'Processing', 'Completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
                filter === f ? "bg-[#073159] text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Test Requested</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredQueue.length > 0 ? (
                  filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#073159]">{item.patient_name}</p>
                        <p className="text-xs text-gray-500">{item.patient_mrn}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tests?.slice(0, 2).map((t: any, idx: number) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium text-xs border border-blue-100 whitespace-nowrap">
                              {t.test_name}
                            </span>
                          ))}
                          {item.tests?.length > 2 && (
                            <span className="text-xs text-gray-500">+{item.tests.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.ordered_by_name}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        
                        {/* 1. Pending -> Collect Action */}
                        {item.status === "Pending" && (
                          <button 
                            onClick={() => handleCollect(item.id, item.patient_name)}
                            className="bg-[#073159] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#062a4d] flex items-center gap-2 ml-auto transition-transform active:scale-95"
                          >
                            <Droplet size={14} /> Collect
                          </button>
                        )}

                        {/* 2. Sample Collected or In Progress -> Result Action */}
                        {(item.status === "Sample Collected" || item.status === "In Progress") && (
                          <button 
                            onClick={() => handleEnterResult(item)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-purple-700 flex items-center gap-2 ml-auto transition-transform active:scale-95"
                          >
                            <TestTube size={14} /> Result
                          </button>
                        )}

                        {/* 3. Completed -> View Report Action */}
                        {item.status === "Completed" && (
                          <button 
                            onClick={() => handleViewReport(item)}
                            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-50 flex items-center gap-2 ml-auto transition-colors"
                          >
                            <FileText size={14} /> Report
                          </button>
                        )}

                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                          <p>No tests found in "{filter}" queue matching your search.</p>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Pending") return <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap">Waiting Sample</span>;
  if (status === "Sample Collected") return <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full whitespace-nowrap">Ready to Process</span>;
  if (status === "In Progress") return <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">In Lab</span>;
  if (status === "Completed") return <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap flex items-center w-fit gap-1"><CheckCircle size={12}/> Ready</span>;
  return <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{status}</span>;
}