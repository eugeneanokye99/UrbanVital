import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search,Filter,UserPlus, MoreVertical, Mail,Phone,Shield, CheckCircle,  XCircle,
  Edit,
  Loader2,
  Trash2,
  Ban,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  fetchAllStaff, 
  fetchStaffStats, 
  deleteStaff, 
  updateStaffStatus, 
  resetStaffPassword,
  updateStaff // Ensure this is exported from your API service
} from "../../services/api"; 

export default function AdminStaff() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({
    total_staff: 0,
    active_count: 0,
    inactive_count: 0, 
    role_counts: {}
  });

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- MODAL STATES ---
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // New: Edit Modal State
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null); // Shared for both modals
  
  // Password State
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(""); 
  const [isProcessing, setIsProcessing] = useState(false); // General loading state for modals

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Data
  const loadStaffData = async () => {
    const t0 = performance.now();
    try {
      setLoading(true);
      const staffData = await fetchAllStaff({
        search: search || undefined,
        role: roleFilter !== "All" ? roleFilter : undefined
      });
      const statsData = await fetchStaffStats();
      // Fix: count active/inactive by is_active
      const staffListArr = staffData.staff || [];
      setStaffList(staffListArr);
      const total = staffListArr.length;
      const active = staffListArr.filter((s:any) => s.is_active).length;
      const inactive = staffListArr.filter((s:any) => !s.is_active).length;
      setStats({
        total_staff: total,
        active_count: active,
        inactive_count: inactive,
        role_counts: statsData.role_counts || {}
      });
    } catch (error: any) {
      console.error("Error loading staff data:", error);
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load staff data";
      toast.error(message);
    } finally {
      setLoading(false);
      const t1 = performance.now();
      if (t1 - t0 > 800) {
        console.warn(`Staff data load took ${t1 - t0} ms`);
      }
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => { loadStaffData(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [search, roleFilter]);

  // --- Handlers ---

  const handleToggleMenu = (id: number) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // 1. DELETE
  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this staff account?")) return;
    try {
      await deleteStaff(id);
      toast.success("Account deleted");
      loadStaffData(); 
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete account";
      toast.error(message);
    }
    setActiveMenuId(null);
  };

  // 2. STATUS TOGGLE
  const handleToggleStatus = async (staff: any) => {
    const newStatus = !staff.is_active;
    const action = newStatus ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} ${staff.username}?`)) return;

    try {
      await updateStaffStatus(staff.id, newStatus ? "active" : "suspended");
      toast.success(`Account ${action}ed`);
      loadStaffData(); 
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${action} account`;
      toast.error(message);
    }
    setActiveMenuId(null);
  };

  // 3. EDIT PROFILE (Opens Modal)
  const handleEditAction = (staff: any) => {
    setSelectedStaff(staff);
    setEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsProcessing(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updateData = {
        username: String(formData.get("username")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        role: String(formData.get("role"))
      };
      await updateStaff(selectedStaff.id, updateData);
      toast.success("Profile updated successfully");
      setEditModalOpen(false);
      // Reload all staff data to reflect changes
      loadStaffData();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. PASSWORD RESET
  const handlePasswordAction = (staff: any) => {
    setSelectedStaff(staff);
    setNewPassword(""); 
    setShowPassword(false);
    setPasswordModalOpen(true);
    setActiveMenuId(null);
  };

  const handleResetPassword = async () => {
      if (!newPassword) return toast.error("Enter a password");
      setIsProcessing(true);
      try {
          await resetStaffPassword(selectedStaff.id, newPassword);
          toast.success("Password updated");
          setPasswordModalOpen(false);
      } catch (error: any) {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update password";
        toast.error(message);
      }
      finally { setIsProcessing(false); }
  };

  const generateRandomPassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
      let pass = "";
      for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      setNewPassword(pass);
      setShowPassword(true); 
  };

  const availableRoles = ["All", "Doctor", "Nurse", "Pharmacist", "Lab Technician", "Receptionist"];

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 min-h-screen pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Staff Directory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {loading ? "Loading..." : `Managing ${stats.total_staff} staff members`}
          </p>
        </div>
        <button 
          onClick={() => navigate("/admin/register")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-[#073159] text-white rounded-xl hover:bg-[#062a4d] transition-colors shadow-lg font-medium text-sm"
        >
          <UserPlus size={18} /> <span>Add New Staff</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Total Staff</p>
                <p className="text-2xl font-bold text-gray-800">
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.total_staff}
                </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Shield size={20} /></div>
         </div>
         
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Active</p>
                <p className="text-2xl font-bold text-green-600">
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.active_count}
                </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
         </div>
         
         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-xs text-gray-500 font-bold uppercase">Suspended / Inactive</p>
                <p className="text-2xl font-bold text-orange-600">
                    {loading ? <Loader2 className="animate-spin h-6 w-6" /> : stats.inactive_count}
                </p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><XCircle size={20} /></div>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by username or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-gray-400 hidden md:block" size={20} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 p-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#073159]"
          >
            {availableRoles.map((role) => <option key={role} value={role}>{role === "All" ? "All Roles" : role}</option>)}
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
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
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm">
                        {staff.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block">{staff.username}</span>
                        <span className="text-xs text-gray-500">ID: {staff.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#073159]">{staff.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-gray-600 text-xs"><Mail size={12} /> {staff.email}</span>
                      <span className="flex items-center gap-2 text-gray-600 text-xs"><Phone size={12} /> {staff.phone || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${staff.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {staff.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                        onClick={() => handleToggleMenu(staff.id)}
                        className="p-2 text-gray-400 hover:text-[#073159] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {/* Action Menu Dropdown */}
                    {activeMenuId === staff.id && (
                        <div ref={menuRef} className="absolute right-8 top-8 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                            <button 
                                onClick={() => handleEditAction(staff)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit size={16} /> Edit Profile
                            </button>
                            <button 
                                onClick={() => handlePasswordAction(staff)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Key size={16} /> Reset Password
                            </button>
                            <button 
                                onClick={() => handleToggleStatus(staff)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 ${staff.is_active ? "text-orange-600" : "text-green-600"}`}
                            >
                                {staff.is_active ? <><Ban size={16} /> Suspend Account</> : <><CheckCircle size={16} /> Activate Account</>}
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button 
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Permanently
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EDIT PROFILE MODAL --- */}
      {editModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b flex justify-between items-center bg-[#073159] text-white">
                    <h3 className="font-bold flex items-center gap-2"><User size={18} /> Edit Profile</h3>
                    <button onClick={() => setEditModalOpen(false)}><X size={20}/></button>
                </div>
                <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Username / Full Name</label>
                        <input name="username" defaultValue={selectedStaff.username} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                        <input name="email" type="email" defaultValue={selectedStaff.email} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                        <input name="phone" defaultValue={selectedStaff.phone} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                        <select name="role" defaultValue={selectedStaff.role} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]">
                            {availableRoles.filter(r => r !== "All").map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={() => setEditModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2">
                            {isProcessing && <Loader2 className="animate-spin" size={18}/>} Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- PASSWORD RESET MODAL --- */}
      {passwordModalOpen && selectedStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-6 bg-[#073159] text-white">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                          <Key size={20} /> Reset Password
                      </h3>
                      <p className="text-blue-200 text-sm mt-1">Set new credentials for {selectedStaff.username}</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
                          <span className="font-bold">Note:</span> Setting a new password will invalidate the user's current session.
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">New Password</label>
                          <div className="relative">
                              <input 
                                  type={showPassword ? "text" : "password"} 
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white focus:border-[#073159] outline-none pr-10 font-mono text-gray-800"
                                  placeholder="Enter new password"
                              />
                              <button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                              >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                          </div>
                      </div>

                      <button 
                          onClick={generateRandomPassword}
                          className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline w-fit"
                      >
                          <RefreshCw size={14} /> Generate Secure Password
                      </button>

                      <div className="flex gap-3 pt-2">
                          <button 
                              onClick={() => setPasswordModalOpen(false)}
                              className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleResetPassword}
                              disabled={isProcessing || !newPassword}
                              className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
                          >
                              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}