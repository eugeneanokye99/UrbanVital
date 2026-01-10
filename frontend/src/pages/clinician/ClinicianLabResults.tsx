import { useState, useMemo, useEffect } from "react";
import {
  TestTube,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Info,
  Loader2,
  Filter
} from "lucide-react";
import { fetchLabResults, fetchLabStats, fetchLabResult } from "../../services/api";

export default function ClinicianLabResults() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const resultsData = await fetchLabResults();
      const statsData = await fetchLabStats();

      const resultsList = resultsData.results || resultsData;
      setResults(resultsList);
      setStats(statsData);

      if (resultsList.length > 0) {
        setSelectedResultId(resultsList[0].id);
      }
    } catch (error) {
      console.error("Failed to load lab data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedResultId) {
      setLoadingDetail(true);
      fetchLabResult(selectedResultId)
        .then(data => setSelectedResult(data))
        .catch(err => console.error("Failed to fetch detail", err))
        .finally(() => setLoadingDetail(false));
    }
  }, [selectedResultId]);

  // --- FILTER LOGIC ---
  const filteredResults = useMemo(() => {
    return results.filter(item => {
      const matchesTab = activeTab === "all" ? true : item.status === activeTab;
      const matchesSearch =
        item.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patient_mrn?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [results, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#073159] animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium tracking-wide">Loading Lab Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">

        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Orders Today" value={stats?.orders_today?.toString() || "0"} icon={<TestTube size={20} />} color="bg-blue-50 text-blue-600" />
          <StatCard label="Pending Lab" value={stats?.pending_count?.toString() || "0"} icon={<Clock size={20} />} color="bg-orange-50 text-orange-600" />
          <StatCard label="Sample Collected" value={stats?.sample_collected_count?.toString() || "0"} icon={<AlertTriangle size={20} />} color="bg-red-50 text-red-600" />
          <StatCard label="Completed Today" value={stats?.completed_today?.toString() || "0"} icon={<CheckCircle size={20} />} color="bg-green-50 text-green-600" />
        </div>

        {/* Desktop Split View */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">

          {/* Results Sidebar */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-[400px] lg:h-auto">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {['all', 'Preliminary', 'Final', 'Corrected'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap uppercase tracking-wider transition-all ${activeTab === tab ? "bg-[#073159] text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedResultId(item.id)}
                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50/50 ${selectedResultId === item.id ? "bg-blue-50 border-l-4 border-l-[#073159]" : "border-l-4 border-l-transparent"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-gray-800">{item.patient_name}</h4>
                      <span className="text-[10px] text-gray-400 font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {item.tests?.map((t: any) => t.test_name).join(", ")}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} abnormal={item.abnormal_flags?.length > 0} />
                      <span className="text-[10px] font-mono text-gray-400">{item.patient_mrn}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="text-gray-300" size={24} />
                  </div>
                  <p className="text-sm text-gray-400">No results found</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed View */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {loadingDetail ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#073159] animate-spin" />
              </div>
            ) : selectedResult ? (
              <>
                <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50/30 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#073159] text-white flex items-center justify-center font-bold text-lg shadow-lg rotate-3 flex-shrink-0">
                      {selectedResult.patient_name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-[#073159]">{selectedResult.patient_name}</h2>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><FileText size={12} /> {selectedResult.patient_mrn}</span>
                        <span>•</span>
                        <span>Lab #ORD-{selectedResult.order_id}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-[#073159] hover:text-[#073159] transition-all shadow-sm">
                    <Download size={14} /> Download PDF
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b border-gray-50 pb-6">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-800">
                        {selectedResult.tests?.map((t: any) => t.test_name).join(" & ")}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">
                          {selectedResult.status}
                        </span>
                        <p className="text-xs text-gray-400">Validated: {new Date(selectedResult.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500">Performed by</p>
                      <p className="text-sm font-bold text-gray-700">{selectedResult.performed_by_name}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto mb-8">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Analytical Parameter</th>
                          <th className="px-6 py-4 text-center">Measured Result</th>
                          <th className="px-6 py-4 text-center">Reference Interval</th>
                          <th className="px-6 py-4 text-center">Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {Array.isArray(selectedResult.results_data) ? (
                          selectedResult.results_data.map((param: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-5 font-semibold text-gray-700">
                                {param.name}
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className={`text-base font-bold ${param.flag === "High" ? "text-red-600" :
                                  param.flag === "Low" ? "text-orange-500" :
                                    "text-gray-900"
                                  }`}>
                                  {param.value}
                                </span>
                                <span className="text-[10px] text-gray-400 ml-1 font-medium">{param.unit}</span>
                              </td>
                              <td className="px-6 py-5 text-center text-gray-500 font-mono text-xs">
                                {param.reference_range || (param.min !== undefined && `${param.min} - ${param.max}`)}
                              </td>
                              <td className="px-6 py-5 text-center">
                                {param.flag === "High" && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-full"><TrendingUp size={12} /> HIGH</span>}
                                {param.flag === "Low" && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded-full"><TrendingDown size={12} /> LOW</span>}
                                {!param.flag && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full"><CheckCircle size={12} /> NORMAL</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                              Analytical data format not recognized or empty.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedResult.interpretation && (
                    <div className={`p-6 border rounded-2xl flex gap-4 ${selectedResult.abnormal_flags?.length > 0 ? "bg-red-50/50 border-red-100" : "bg-blue-50/50 border-blue-100"
                      }`}>
                      <Info size={24} className={`shrink-0 ${selectedResult.abnormal_flags?.length > 0 ? "text-red-500" : "text-blue-500"
                        }`} />
                      <div>
                        <h4 className="font-bold text-sm text-gray-800 mb-1">Clinical Interpretation:</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedResult.interpretation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/20">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 text-gray-300">
                  <Filter size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-700">No selection</h3>
                <p className="text-sm text-gray-500 max-w-xs">Please select a laboratory report from the directory to view detailed analytical results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
      <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${color}`}>{icon}</div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h3>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{label}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status, abnormal }: { status: string, abnormal?: boolean }) {
  if (abnormal || status === "Critical") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
        <AlertTriangle size={10} /> {status === "Critical" ? "Critical" : "Abnormal"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
      <CheckCircle size={10} /> {status}
    </span>
  );
}