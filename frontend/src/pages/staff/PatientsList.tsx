import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Users,
} from "lucide-react";
import StaffNavbar from "../../components/StaffNavbar";
import StaffSidebar from "../../components/StaffSidebar";
import { fetchPatients } from "../../services/api";
import toast from "react-hot-toast";

type Patient = {
  id: number;
  mrn: string;
  name: string;
  phone?: string;
  flags?: string | null;
  // any other fields returned by your serializer
};

export default function PatientsList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await fetchPatients();
      // If backend returns paginated object, use data.results
      const list: Patient[] = Array.isArray(data) ? data : data.results ?? [];
      setPatients(list);
    } catch (err: any) {
      console.error("Failed to load patients", err);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  // derive unique flags for filter dropdown
  const flagOptions = useMemo(() => {
    const s = new Set<string>();
    patients.forEach((p) => {
      const f = p.flags ?? "None";
      s.add(f || "None");
    });
    return Array.from(s);
  }, [patients]);

  const filteredPatients = patients.filter(
    (p) =>
      (filter === "All" || (p.flags ?? "None") === filter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase()))
  );

  const getFlagStyle = (flag: string) => {
    switch (flag) {
      case "Allergy":
        return "bg-red-100 text-red-700 border-red-200";
      case "Diabetes":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Hypertension":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:block">
        <StaffSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StaffNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#073159] flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#073159]" />
                  Patients List
                </h1>
                <p className="text-gray-500 mt-1">Manage patient records and view history.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600">
                  <span className="font-bold text-[#073159]">{filteredPatients.length}</span> Patients Found
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name or MRN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition duration-150 ease-in-out sm:text-sm"
                />
              </div>

              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-500" />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] sm:text-sm rounded-lg cursor-pointer bg-white text-gray-700 shadow-sm appearance-none"
                >
                  <option value="All">All Conditions</option>
                  {flagOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">MRN / ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Flags</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="text-gray-500">Loading patients...</div>
                        </td>
                      </tr>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient, index) => (
                        <tr key={patient.mrn ?? patient.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm font-medium text-[#073159] bg-blue-50 px-2 py-1 rounded">{patient.mrn}</span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-[#073159] font-bold text-xs mr-3 border border-blue-200">
                                {patient.name?.charAt(0) ?? "?"}
                              </div>
                              <div className="text-sm font-semibold text-gray-900">{patient.name}</div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{patient.phone || "-"}</td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.flags ? (
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getFlagStyle(patient.flags)}`}>{patient.flags}</span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button title="View Details" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye size={18} />
                              </button>
                              <button title="More Options" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No patients found</p>
                            <p className="text-sm">Try adjusting your search or filter.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPatients.length}</span> of <span className="font-medium">{patients.length}</span> results
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
