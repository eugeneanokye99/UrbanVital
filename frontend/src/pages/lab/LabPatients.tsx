import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Users, 
  Eye, 
  Droplet, 
  Dna
} from "lucide-react";

export default function LabPatientList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Mock Patient Database
  const patients = [
    { mrn: "UV-2025-0421", name: "Williams Boampong", age: 23, gender: "Male", bloodGroup: "O+", genotype: "AA", lastVisit: "24 Oct 2025" },
    { mrn: "UV-2025-0422", name: "Sarah Mensah", age: 45, gender: "Female", bloodGroup: "AB-", genotype: "AS", lastVisit: "22 Oct 2025" },
    { mrn: "UV-2025-0423", name: "Emmanuel Osei", age: 31, gender: "Male", bloodGroup: "--", genotype: "--", lastVisit: "20 Oct 2025" },
  ];

  const handleViewProfile = (patient: any) => {
    navigate("/lab/patient-profile", { state: { patient } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      
      {/* Header: Stack on Mobile, Row on Desktop */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#073159] flex items-center gap-2">
          <Users className="w-6 h-6 md:w-8 md:h-8 text-[#073159]" />
          Lab Patient Database
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Search and manage patient laboratory records and history.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Name or MRN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:border-[#073159] outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Table with Horizontal Scroll for Mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Patient Info</th>
                <th className="px-6 py-4">Blood Group</th>
                <th className="px-6 py-4">Genotype</th>
                <th className="px-6 py-4">Last Lab Visit</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr 
                  key={p.mrn} 
                  onClick={() => handleViewProfile(p)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#073159] group-hover:text-blue-600 transition-colors">
                        {p.name}
                    </div>
                    <div className="text-xs text-gray-500">{p.mrn} • {p.gender}, {p.age}y</div>
                  </td>
                  <td className="px-6 py-4">
                    {p.bloodGroup !== "--" ? (
                        <span className="flex items-center gap-1 font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit text-xs">
                            <Droplet size={10} /> {p.bloodGroup}
                        </span>
                    ) : <span className="text-gray-400 text-xs">Not Recorded</span>}
                  </td>
                  <td className="px-6 py-4">
                    {p.genotype !== "--" ? (
                        <span className="flex items-center gap-1 font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit text-xs">
                            <Dna size={10} /> {p.genotype}
                        </span>
                    ) : <span className="text-gray-400 text-xs">Not Recorded</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.lastVisit}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-[#073159] p-2 hover:bg-gray-100 rounded-full transition-all">
                        <Eye size={20} />
                    </button>
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