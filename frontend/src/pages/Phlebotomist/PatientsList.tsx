import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {   Search, Filter, FileText, Users, Plus, Loader2  } from "lucide-react";
import { fetchPatients } from "../../services/api"; 

export default function StaffPatientsList() {
  const navigate = useNavigate(); 
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients on component mount
  useEffect(() => {
    getPatients();
  }, []);

const getPatients = async () => {
  try {
    setLoading(true);
    const params: any = {};
    
    if (search) params.search = search;
    if (filter !== "All") params.flag = filter;
    
    const data = await fetchPatients(params);
    
    setPatients(data.results || []);
    // setTotalCount(data.count || 0);
  } catch (error) {
    console.error("Error fetching patients:", error);
    setError("Failed to load patients. Please try again.");
    setPatients([]);
  } finally {
    setLoading(false);
  }
};




  // Navigation Handler
  const handleViewPatient = (patient: any) => {
    navigate("/phlebotomist/patientdetail", { state: { patient } });
  };

  const getFlagStyle = (flag: string) => {
    switch (flag) {
      case "Allergy": return "bg-red-100 text-red-700 border-red-200";
      case "Diabetes": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Hypertension": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Render individual flag badges
  const renderFlags = (patient: any) => {
    if (!patient.flags || patient.flags.length === 0) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    let flagsArray = patient.flags;
    if (typeof patient.flags === 'string') {
      try {
        // Try to parse if it's a JSON string
        flagsArray = JSON.parse(patient.flags);
      } catch {
        // If not JSON, split by comma
        flagsArray = patient.flags.split(',').map((flag: string) => flag.trim());
      }
    }

    if (!Array.isArray(flagsArray) || flagsArray.length === 0) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {flagsArray.slice(0, 2).map((flag: string, index: number) => (
          <span
            key={index}
            className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full border ${getFlagStyle(flag)}`}
          >
            {flag}
          </span>
        ))}
        {flagsArray.length > 2 && (
          <span className="text-xs text-gray-500">+{flagsArray.length - 2}</span>
        )}
      </div>
    );
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    if (!phone) return "-";
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Format as Ghanaian number if starts with 0 or 233
    if (digits.startsWith('0') && digits.length === 10) {
      return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (digits.startsWith('233') && digits.length === 12) {
      const local = digits.slice(3);
      return `0${local.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
    }
    return phone;
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2 md:gap-3">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Patients List
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Manage patient records and view history.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm text-gray-600 font-medium">
            <span className="font-bold text-[#073159]">{patients.length}</span> Found
          </div>
          <button 
            onClick={() => navigate("/phlebotomist/registerpatient")}
            className="flex items-center gap-2 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors shadow-sm font-medium text-sm"
          >
            <Plus size={18} /> Register Patient
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name, MRN, or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition duration-150 ease-in-out text-sm"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] rounded-lg cursor-pointer bg-white text-gray-700 shadow-sm appearance-none"
          >
            <option value="All">All Conditions</option>
            <option value="Allergy">Allergy</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Hypertension">Hypertension</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-[#073159] animate-spin mr-3" />
          <span className="text-lg text-gray-600">Loading patients...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 font-medium mb-2">{error}</div>
          <button
            onClick={getPatients}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table Section */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">MRN / ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Flags</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id || patient.mrn} 
                      onClick={() => handleViewPatient(patient)}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-[#073159] bg-blue-50 px-2 py-1 rounded">
                          {patient.mrn || `P-${patient.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-[#073159] font-bold text-xs mr-3 border border-blue-200">
                            {patient.name?.charAt(0) || '?'}
                          </div>
                          <div className="text-sm font-bold text-[#073159] group-hover:text-blue-600 group-hover:underline transition-all">
                            {patient.name || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {formatPhone(patient.phone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderFlags(patient)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">

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
                        {patients.length === 0 && (
                          <button
                            onClick={() => navigate("/phlebotomist/registerpatient")}
                            className="mt-4 px-4 py-2 bg-[#073159] text-white rounded-lg hover:bg-[#062a4d] transition-colors text-sm font-medium"
                          >
                            Register First Patient
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination - You can implement real pagination later */}
          {patients.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 text-center sm:text-left">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{patients.length}</span> of <span className="font-medium">{patients.length}</span> patients
              </span>
              <div className="flex gap-2">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50" 
                  disabled
                >
                  Previous
                </button>
                <button 
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50"
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}