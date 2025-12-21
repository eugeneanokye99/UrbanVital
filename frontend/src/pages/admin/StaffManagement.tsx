import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle, 
  XCircle,
  Edit,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchAllStaff, fetchStaffStats } from "../../services/api"; 

export default function AdminStaff() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_staff: 0,
    active_count: 0,
    role_counts: {}
  });

  // Fetch staff data on component mount and when filters change
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff list with filters
        const staffData = await fetchAllStaff({
          search: search || undefined,
          role: roleFilter !== "All" ? roleFilter : undefined
        });
        console.log(staffData)
        
        // Fetch staff statistics
        const statsData = await fetchStaffStats();
        
        setStaffList(staffData.staff || []);
        setStats({
          total_staff: statsData.total_staff || 0,
          active_count: staffData.active_count || 0,
          role_counts: statsData.role_counts || {}
        });
      } catch (error: any) {
        console.error("Error loading staff data:", error);
        toast.error("Failed to load staff data");
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      loadStaffData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, roleFilter]);

  // Calculate on leave count (assuming all non-active are on leave for now)
  // You might need to adjust this based on your actual status field
  const onLeaveCount = 0

  // Get unique roles from staff list for filter dropdown
  const availableRoles = ["All", ...Array.from(new Set(staffList.map(staff => staff.role)))].filter(Boolean);

  const handleAddStaff = () => {
    navigate("/admin/register");
  };

  const handleEditStaff = (staffId: number) => {
    navigate(`/admin/staff/edit/${staffId}`);
  };

  const handleMoreOptions = (staff: any) => {
    // Implement dropdown menu with more options
    console.log("More options for:", staff);
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  // Get status display and color
  const getStatusInfo = (staff: any) => {
    // Since your DB doesn't have a status field, we can derive it from is_active
    // or create a computed status based on other fields
    if (staff.is_active === false) {
      return { text: "Inactive", color: "bg-red-100 text-red-700" };
    }
    // You might need to add a status field to your StaffProfile model
    return { text: "Active", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Staff Directory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {loading ? "Loading staff data..." : `Managing ${stats.total_staff} staff members`}
          </p>
        </div>
        <button 
          onClick={handleAddStaff}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-lg shadow-blue-900/20 font-medium text-sm active:scale-95 transform"
        >
          <UserPlus size={18} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Stats Row: 1 col mobile -> 3 cols desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total Staff</p>
            <p className="text-2xl font-bold text-gray-800">
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.total_staff}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Shield size={20} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.active_count}
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <CheckCircle size={20} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Inactive</p>
            <p className="text-2xl font-bold text-orange-600">
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : onLeaveCount}
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Controls: Stack on Mobile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-400 hidden md:block" size={20} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 p-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#073159] cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role === "All" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#073159]" />
            <span className="ml-3 text-gray-500">Loading staff data...</span>
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">
              {search || roleFilter !== "All" 
                ? "No staff members found matching your criteria." 
                : "No staff members registered yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {staffList.map((staff) => {
                  const statusInfo = getStatusInfo(staff);
                  return (
                    <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {staff.username?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 block">
                              {staff.username || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              ID: {staff.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#073159]">{staff.role || "Not assigned"}</p>
                        <p className="text-xs text-gray-500">
                          Created by: {staff.created_by_user || "System"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-gray-600 text-xs">
                            <Mail size={12} /> {staff.email || "No email"}
                          </span>
                          <span className="flex items-center gap-2 text-gray-600 text-xs">
                            <Phone size={12} /> {formatPhone(staff.phone)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditStaff(staff.id)}
                            className="p-2 text-gray-400 hover:text-[#073159] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleMoreOptions(staff)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More Options"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer info */}
      {!loading && staffList.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {staffList.length} of {stats.total_staff} staff members
        </div>
      )}
    </div>
  );
}