import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Waves, Loader2, AlertCircle, Plus, X } from "lucide-react";
import { 
  fetchUltrasoundWorklist, 
  fetchPatients, 
  createUltrasoundOrder 
} from "../../services/api";
import { useDebounce } from "../../hooks/useDebounce";
import toast from "react-hot-toast";

export default function UltrasoundWorklist() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [inProgressScans, setInProgressScans] = useState<any[]>([]);
  
  // New Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const debouncedPatientSearch = useDebounce(patientSearchQuery, 300);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [orderForm, setOrderForm] = useState({
    scan_type: "Abdominal",
    urgency: "Normal",
    clinical_indication: "",
    special_instructions: ""
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    loadWorklistData();
  }, []);

  useEffect(() => {
    if (showNewOrderModal && debouncedPatientSearch) {
      searchPatients();
    }
  }, [debouncedPatientSearch, showNewOrderModal]);

  const loadWorklistData = async () => {
    try {
      setLoading(true);
      const data = await fetchUltrasoundWorklist();
      setPendingOrders(data.pending_orders || []);
      setInProgressScans(data.in_progress_scans || []);
    } catch (error) {
      console.error("Error loading worklist:", error);
      toast.error("Failed to load worklist");
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async () => {
    try {
      setLoadingPatients(true);
      const data = await fetchPatients({ search: debouncedPatientSearch });
      setPatients(data.results || []);
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Failed to search patients");
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (!orderForm.clinical_indication.trim()) {
      toast.error("Please enter clinical indication");
      return;
    }

    try {
      setSubmittingOrder(true);
      await createUltrasoundOrder({
        patient: selectedPatient.id,
        scan_type: orderForm.scan_type,
        urgency: orderForm.urgency,
        clinical_indication: orderForm.clinical_indication,
        special_instructions: orderForm.special_instructions || undefined
      });
      toast.success("Ultrasound order created successfully");
      setShowNewOrderModal(false);
      resetOrderForm();
      await loadWorklistData();
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast.error(error?.response?.data?.detail || "Failed to create order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const resetOrderForm = () => {
    setSelectedPatient(null);
    setPatientSearchQuery("");
    setPatients([]);
    setOrderForm({
      scan_type: "Abdominal",
      urgency: "Normal",
      clinical_indication: "",
      special_instructions: ""
    });
  };

  const filteredData = filter === "Pending" ? pendingOrders : inProgressScans;
  
  const searchedData = filteredData.filter((item: any) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      item.patient_name?.toLowerCase().includes(searchLower) ||
      item.patient_mrn?.toLowerCase().includes(searchLower) ||
      item.scan_type?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#073159]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <h1 className="text-xl md:text-2xl font-bold text-[#073159]">Scan Worklist</h1>
         <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-md"
            >
              <Plus size={18} /> New Order
            </button>
            <div className="flex bg-white p-1 rounded-lg border border-gray-200">
              {['Pending', 'In Progress'].map(f => (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f ? 'bg-[#073159] text-white' : 'text-gray-500'}`}
                  >
                      {f}
                  </button>
              ))}
            </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search patient..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none text-sm" 
                />
            </div>
         </div>
         <div className="overflow-x-auto">
            {searchedData.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[800px]">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                      <tr>
                          <th className="px-6 py-4">Patient</th>
                          <th className="px-6 py-4">Scan Requested</th>
                          <th className="px-6 py-4">
                            {filter === "Pending" ? "Referring Doctor" : "Performed By"}
                          </th>
                          <th className="px-6 py-4">
                            {filter === "Pending" ? "Urgency" : "Status"}
                          </th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {searchedData.map((item: any) => (
                          <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4">
                                  <p className="font-bold text-[#073159]">{item.patient_name}</p>
                                  <p className="text-xs text-gray-500">{item.patient_mrn}</p>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 text-xs font-bold">
                                      {item.scan_type}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {filter === "Pending" ? item.ordered_by_name : item.performed_by_name}
                              </td>
                              <td className="px-6 py-4">
                                  {filter === "Pending" ? (
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                      item.urgency === 'Urgent' || item.urgency === 'Emergency' 
                                        ? 'bg-red-100 text-red-600' 
                                        : 'bg-green-100 text-green-600'
                                    }`}>
                                        {item.urgency}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-600">
                                      {item.status}
                                    </span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => navigate("/ultrasound/reports", { state: { order: item } })}
                                    className="bg-[#073159] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#062a4d] flex items-center gap-2 ml-auto w-fit"
                                  >
                                      <Waves size={14} /> {filter === "Pending" ? "Process" : "View"}
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <AlertCircle size={48} className="mb-4 opacity-50" />
                <p className="text-base font-medium mb-1">No {filter.toLowerCase()} scans found</p>
                <p className="text-sm">
                  {searchQuery 
                    ? "Try adjusting your search" 
                    : filter === "Pending" 
                      ? "All scan orders have been processed" 
                      : "No scans currently in progress"
                  }
                </p>
              </div>
            )}
         </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-[#073159]">Create Ultrasound Order</h2>
              <button
                onClick={() => {
                  setShowNewOrderModal(false);
                  resetOrderForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Patient *
                </label>
                {!selectedPatient ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search by name, MRN, or phone..."
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#073159] outline-none"
                      />
                    </div>
                    
                    {loadingPatients && (
                      <div className="mt-2 flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[#073159]" />
                      </div>
                    )}

                    {!loadingPatients && patients.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                        {patients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => setSelectedPatient(patient)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                          >
                            <p className="font-bold text-gray-800">{patient.name}</p>
                            <p className="text-xs text-gray-500">
                              MRN: {patient.mrn} • {patient.gender} • {patient.phone}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {!loadingPatients && debouncedPatientSearch && patients.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500 text-center py-4">
                        No patients found. Try a different search term.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-[#073159]">{selectedPatient.name}</p>
                      <p className="text-xs text-gray-600">
                        MRN: {selectedPatient.mrn} • {selectedPatient.gender} • {selectedPatient.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Scan Type *
                  </label>
                  <select
                    value={orderForm.scan_type}
                    onChange={(e) => setOrderForm({...orderForm, scan_type: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#073159] outline-none"
                  >
                    <option value="Obstetric (1st Trimester)">Obstetric (1st Trimester)</option>
                    <option value="Obstetric (2nd Trimester)">Obstetric (2nd Trimester)</option>
                    <option value="Obstetric (3rd Trimester)">Obstetric (3rd Trimester)</option>
                    <option value="Abdominal">Abdominal</option>
                    <option value="Pelvic">Pelvic</option>
                    <option value="Thyroid">Thyroid</option>
                    <option value="Breast">Breast</option>
                    <option value="Renal/KUB">Renal/KUB</option>
                    <option value="Prostate">Prostate</option>
                    <option value="Scrotal">Scrotal</option>
                    <option value="Musculoskeletal">Musculoskeletal</option>
                    <option value="Doppler Study">Doppler Study</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Urgency *
                  </label>
                  <select
                    value={orderForm.urgency}
                    onChange={(e) => setOrderForm({...orderForm, urgency: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-[#073159] outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Clinical Indication *
                </label>
                <textarea
                  value={orderForm.clinical_indication}
                  onChange={(e) => setOrderForm({...orderForm, clinical_indication: e.target.value})}
                  placeholder="Reason for ultrasound scan..."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#073159] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={orderForm.special_instructions}
                  onChange={(e) => setOrderForm({...orderForm, special_instructions: e.target.value})}
                  placeholder="Any special instructions or notes..."
                  rows={2}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#073159] outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setShowNewOrderModal(false);
                  resetOrderForm();
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={submittingOrder || !selectedPatient}
                className="px-6 py-2.5 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] disabled:opacity-50 flex items-center gap-2"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}