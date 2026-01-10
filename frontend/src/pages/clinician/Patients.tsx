import { useState, useEffect } from "react";
import { Search, Eye, Stethoscope, Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPatients } from "../../services/api";

export default function ClinicianPatients() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await fetchPatients({ search });
      setPatients(data.results || data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPatients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Helper function
  const handlePatientClick = (patient: any) => {
    navigate(`/clinician/patient-details?id=${patient.id}`, { state: { patient } });
  };

  return (

    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Users className="w-6 h-6 md:w-7 md:h-7" /> Patient Directory
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name or MRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#073159] text-sm transition-all"
            />
          </div>
        </div>

        {/* List Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Responsive Scroll Wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Last Visit</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Condition</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <Loader2 className="w-8 h-8 text-[#073159] animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : patients.length > 0 ? (
                  patients.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div
                          onClick={() => handlePatientClick(p)}
                          className="font-bold text-[#073159] cursor-pointer hover:underline hover:text-blue-600 transition-colors text-base"
                        >
                          {p.name || `${p.first_name} ${p.last_name}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.mrn} • {p.age} Yrs • {p.gender}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.last_visit ? new Date(p.last_visit).toLocaleDateString() : "Never"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.medical_flags ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"
                          }`}>
                          {p.medical_flags || "No Flags"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePatientClick(p)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View History"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/clinician/consulting?patient=${p.id}`)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#073159] text-white text-xs md:text-sm rounded-lg hover:bg-[#062a4d] shadow-sm transition-transform active:scale-95"
                          >
                            <Stethoscope size={16} /> Consult
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      No patients found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

  );
}