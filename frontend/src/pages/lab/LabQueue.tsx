import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { 
  TestTube, 
  Droplet, 
  FileText,
  CheckCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LabTestQueue() {
  const navigate = useNavigate();
  // 1. Get search query from the Layout
  const { globalSearch } = useOutletContext<{ globalSearch: string }>();
  
  const [filter, setFilter] = useState("Pending");

  // 2. State for Queue (so we can update statuses locally)
  const [queue, setQueue] = useState([
    { id: 1, patient: "Williams Boampong", mrn: "UV-2025-0421", test: "Full Blood Count", status: "Pending Sample", doctor: "Dr. Asante" },
    { id: 2, patient: "Sarah Mensah", mrn: "UV-2025-0422", test: "Malaria RDT", status: "Processing", doctor: "Dr. Asante" },
    { id: 3, patient: "Emmanuel Osei", mrn: "UV-2025-0423", test: "Lipid Profile", status: "Result Ready", doctor: "Dr. Mensah" },
    { id: 4, patient: "Ama Kyei", mrn: "UV-2025-0424", test: "H. Pylori", status: "Pending Sample", doctor: "Dr. Mensah" },
  ]);

  // 3. Smart Filtering (Status Tab + Search Bar)
  const filteredQueue = queue.filter(item => {
    // Step 1: Filter by Tab (Pending/Processing/Completed)
    let statusMatch = false;
    if (filter === "Pending") statusMatch = item.status === "Pending Sample";
    else if (filter === "Processing") statusMatch = item.status === "Processing";
    else if (filter === "Completed") statusMatch = item.status === "Result Ready";
    else statusMatch = true; // "All" case if needed

    // Step 2: Filter by Search Text (Name or MRN)
    const searchMatch = 
      item.patient.toLowerCase().includes(globalSearch.toLowerCase()) || 
      item.mrn.toLowerCase().includes(globalSearch.toLowerCase()) ||
      item.test.toLowerCase().includes(globalSearch.toLowerCase());

    return statusMatch && searchMatch;
  });

  // --- Handlers ---

  const handleCollect = (id: number, patientName: string) => {
    // Simulate collecting sample -> Move to Processing
    setQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: "Processing" } : item
    ));
    toast.success(`Sample collected for ${patientName}`);
  };

  const handleEnterResult = (item: any) => {
    // Navigate to Entry page with patient/test data
    navigate("/lab/labentry", { 
        state: { 
            patient: { name: item.patient, id: item.mrn },
            testToSelect: item.test 
        } 
    });
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Test Queue</h1>
        
        {/* Filter Tabs */}
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
                        <p className="font-bold text-[#073159]">{item.patient}</p>
                        <p className="text-xs text-gray-500">{item.mrn}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-medium text-xs border border-blue-100 whitespace-nowrap">
                          {item.test}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        
                        {/* 1. Pending -> Collect Action */}
                        {item.status === "Pending Sample" && (
                          <button 
                            onClick={() => handleCollect(item.id, item.patient)}
                            className="bg-[#073159] text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#062a4d] flex items-center gap-2 ml-auto transition-transform active:scale-95"
                          >
                            <Droplet size={14} /> Collect
                          </button>
                        )}

                        {/* 2. Processing -> Result Action */}
                        {item.status === "Processing" && (
                          <button 
                            onClick={() => handleEnterResult(item)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-purple-700 flex items-center gap-2 ml-auto transition-transform active:scale-95"
                          >
                            <TestTube size={14} /> Result
                          </button>
                        )}

                        {/* 3. Completed -> View Report Action */}
                        {item.status === "Result Ready" && (
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
  if (status === "Pending Sample") return <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap">Waiting Sample</span>;
  if (status === "Processing") return <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">In Lab</span>;
  return <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full whitespace-nowrap flex items-center w-fit gap-1"><CheckCircle size={12}/> Ready</span>;
}