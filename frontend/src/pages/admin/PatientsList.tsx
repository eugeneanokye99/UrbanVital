import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  FileText, 
  Users,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import AdminNavbar from "../../components/AdminNavbar";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminPatientsList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Mock Data with varied flags
  const patients = Array.from({ length: 16 }, (_, i) => {
    const flags = ["Allergy", "Diabetes", "Hypertension", "None", "Asthma"];
    const randomFlag = flags[i % 5];
    
    return {
      no: i + 1,
      mrn: `UV-2025-04${20 + i}`,
      name: i % 2 === 0 ? "Williams Boampong" : "Sarah Mensah",
      phone: "054 673 2719",
      flag: randomFlag,
      registeredDate: "Oct 24, 2024"
    };
  });

  const filteredPatients = patients.filter(
    (p) =>
      (filter === "All" || p.flag === filter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.mrn.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper for Badge Colors
  const getFlagStyle = (flag: string) => {
    switch (flag) {
      case "Allergy": return "bg-red-100 text-red-700 border-red-200";
      case "Diabetes": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Hypertension": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Asthma": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#073159] flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#073159]" />
                  Patient Directory
                </h1>
                <p className="text-gray-500 mt-1">
                  Manage patient records, medical history, and account status.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-lg shadow-blue-900/20 font-medium text-sm">
                  <Plus size={18} />
                  Add New Patient
                </button>
              </div>
            </div>

            {/* Controls Section (Search & Filter) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by Name, MRN or Phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition duration-150 ease-in-out sm:text-sm"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-48">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-500" />
                    </div>
                    <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="block w-full pl-10 pr-8 py-2.5 text-base border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] sm:text-sm rounded-lg cursor-pointer bg-white text-gray-700 shadow-sm appearance-none"
                    >
                    <option value="All">All Conditions</option>
                    <option value="Allergy">Allergy</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma</option>
                    </select>
                     {/* Chevron */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Patient Details
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        MRN
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Medical Flags
                      </th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr 
                          key={patient.mrn} 
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {/* Smart Avatar */}
                              <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm mr-3 shadow-md">
                                {patient.name.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{patient.name}</div>
                                <div className="text-xs text-gray-500">Reg: {patient.registeredDate}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-[#073159] bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                              {patient.mrn}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                            {patient.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.flag !== "None" ? (
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getFlagStyle(patient.flag)}`}>
                                {patient.flag}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs px-2">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                                title="Edit Patient"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                title="Delete Record"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-50 p-4 rounded-full mb-3">
                                <FileText className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">No patients found</p>
                            <p className="text-sm">We couldn't find any patient matching your search.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPatients.length}</span> of <span className="font-medium">{patients.length}</span> results
                </span>
                <div className="flex gap-2">
                   <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors" disabled>Previous</button>
                   <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">Next</button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}