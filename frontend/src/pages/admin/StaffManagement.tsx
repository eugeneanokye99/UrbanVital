import { useState } from "react";
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
  Edit
} from "lucide-react";

export default function AdminStaff() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Mock Staff Data
  const staffList = [
    { id: 1, name: "Dr. William Asante", role: "Clinician", email: "w.asante@urbanvital.com", phone: "054 111 2222", status: "Active", department: "General OP" },
    { id: 2, name: "Sarah Mensah", role: "Lab Technician", email: "s.mensah@urbanvital.com", phone: "020 333 4444", status: "Active", department: "Laboratory" },
    { id: 3, name: "John Doe", role: "Pharmacist", email: "j.doe@urbanvital.com", phone: "055 555 6666", status: "On Leave", department: "Pharmacy" },
    { id: 4, name: "Ama Osei", role: "Cashier", email: "a.osei@urbanvital.com", phone: "024 999 8888", status: "Active", department: "Finance" },
    { id: 5, name: "Kwame Boateng", role: "Clinician", email: "k.boateng@urbanvital.com", phone: "050 000 1111", status: "Suspended", department: "Specialist" },
  ];

  // Filter Logic
  const filteredStaff = staffList.filter(staff => {
    const matchesRole = roleFilter === "All" || staff.role === roleFilter;
    const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase()) || staff.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
            Staff Directory
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Manage user access, roles, and account status.</p>
        </div>
        <button 
          onClick={() => navigate("/admin/register")}
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
                  <p className="text-2xl font-bold text-gray-800">{staffList.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Shield size={20} /></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Active Now</p>
                  <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20} /></div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
              <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">On Leave</p>
                  <p className="text-2xl font-bold text-orange-600">1</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><XCircle size={20} /></div>
          </div>
      </div>

      {/* Controls: Stack on Mobile */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search staff by name or email..." 
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
              className="w-full md:w-48 p-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-[#073159] cursor-pointer"
           >
              <option value="All">All Roles</option>
              <option value="Clinician">Clinicians</option>
              <option value="Lab Technician">Lab Technicians</option>
              <option value="Pharmacist">Pharmacists</option>
              <option value="Cashier">Cashiers</option>
           </select>
        </div>
      </div>

      {/* Staff Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Horizontal Scroll for Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-[#073159] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {staff.name.charAt(0)}
                       </div>
                       <span className="font-bold text-gray-800">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <p className="font-medium text-[#073159]">{staff.role}</p>
                     <p className="text-xs text-gray-500">{staff.department}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-gray-600 text-xs">
                          <Mail size={12} /> {staff.email}
                        </span>
                        <span className="flex items-center gap-2 text-gray-600 text-xs">
                          <Phone size={12} /> {staff.phone}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        staff.status === "Active" ? "bg-green-100 text-green-700" :
                        staff.status === "Suspended" ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                     }`}>
                        {staff.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[#073159] hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                           <Edit size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="More Options">
                           <MoreVertical size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}