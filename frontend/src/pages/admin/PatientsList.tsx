import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Users,
  Edit,
  Trash2,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { fetchPatients, deletePatient } from "../../services/api"; // Adjust import path

export default function AdminPatientsList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients on component mount
  useEffect(() => {
    getPatients();
  }, [search, filter]); // Add dependencies for search and filter

  const getPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      
      if (search) params.search = search;
      if (filter !== "All") params.flag = filter;
      
      const data = await fetchPatients(params);
      
      setPatients(data.results || []);
    } catch (error: any) {
      console.error("Error fetching patients:", error);
      setError("Failed to load patients. Please try again.");
      setPatients([]);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load patients";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientId: number) => {
    if (!window.confirm("Are you sure you want to delete this patient? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePatient(patientId);
      toast.success("Patient deleted successfully");
      
      // Update local state
      setPatients(prev => prev.filter(p => p.id !== patientId));
    } catch (error: any) {
      console.error("Error deleting patient:", error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete patient";
      toast.error(message);
    }
  };

  const handleEdit = (patient: any) => {
    // Navigate to edit page or open modal
    console.log("Edit patient:", patient);
  };

  const getFlagStyle = (flag: string) => {
    switch (flag) {
      case "Allergy": return "bg-red-100 text-red-700 border-red-200";
      case "Diabetes": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Hypertension": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Asthma": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Render individual flag badges
  const renderFlags = (patient: any) => {
    if (!patient.medical_flags || patient.medical_flags.length === 0) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    let flagsArray = patient.medical_flags;
    if (typeof patient.medical_flags === 'string') {
      try {
        // Try to parse if it's a JSON string
        flagsArray = JSON.parse(patient.medical_flags);
      } catch {
        // If not JSON, split by comma
        flagsArray = patient.medical_flags.split(',').map((flag: string) => flag.trim());
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

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get patient full name
  const getFullName = (patient: any) => {
    if (patient.first_name && patient.last_name) {
      return `${patient.first_name} ${patient.last_name}`;
    }
    return patient.name || "Unknown Patient";
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2 md:gap-3">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Patient Directory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {loading ? "Loading patients..." : `Managing ${patients.length} patient records`}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={getPatients}
            disabled={loading}
            className="bg-white border border-gray-200 text-[#073159] px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={getPatients}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
            >
              <Loader2 size={14} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* Controls Section */}
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
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] transition duration-150 ease-in-out text-sm disabled:opacity-50"
            disabled={loading}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-500" />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-10 pr-8 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#073159]/20 focus:border-[#073159] rounded-lg cursor-pointer bg-white text-gray-700 shadow-sm appearance-none disabled:opacity-50"
            disabled={loading}
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-[#073159] animate-spin mr-3" />
          <span className="text-lg text-gray-600">Loading patients...</span>
        </div>
      )}

      {/* Table Section */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    MRN
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Medical Flags
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* Smart Avatar */}
                          <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm mr-3 shadow-md">
                            {getFullName(patient).charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{getFullName(patient)}</div>
                            <div className="text-xs text-gray-500">
                              Reg: {formatDate(patient.created_at || patient.registeredDate)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold text-[#073159] bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                          {patient.mrn || `P-${patient.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">
                          {formatPhone(patient.phone)}
                        </div>
                        {patient.email && (
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">
                            {patient.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderFlags(patient)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Actions: Always visible on mobile, Hover-only on Desktop */}
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(patient)}
                            className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                            title="Edit Patient"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(patient.id)}
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
                        <p className="text-sm">
                          {search 
                            ? `No patients match "${search}"` 
                            : "No patients registered yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {patients.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{patients.length}</span> of <span className="font-medium">{patients.length}</span> results
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors" disabled>
                  Previous
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
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