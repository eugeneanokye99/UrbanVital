import { useState, useMemo, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  Search, Package, Plus, Edit, Trash2, X, Loader2, RefreshCw, FlaskConical, ArrowLeft, Layers, ChevronDown, ChevronRight, List,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
    fetchLabItems,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getStockStatusInfo,
    formatDate,
    fetchLabTests,
    createLabTest,
    updateLabTest,
    deleteLabTest
} from "../../services/api";

// --- Types ---
interface LabParameter {
  id: string;
  name: string;
  unit: string;
  refRange: string;
}

interface TestType {
  id: number;
  name: string;
  code: string;
  price: number;
  parameters: LabParameter[];
}



export default function AdminLabInventory() {
  const navigate = useNavigate();
  const { globalSearch, setGlobalSearch } = useOutletContext<{ globalSearch: string; setGlobalSearch: (s: string) => void }>();
  
  const [activeTab, setActiveTab] = useState<"inventory" | "tests">("inventory");
  const [localSearch, setLocalSearch] = useState(globalSearch);
  
  // Inventory State
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

    // Test Types State (from backend)
    const [testTypes, setTestTypes] = useState<TestType[]>([]);
    const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
    const [loadingTests, setLoadingTests] = useState(true);

    // Fetch test types from backend
    const loadTestTypes = async () => {
        setLoadingTests(true);
        try {
            const data = await fetchLabTests();
            setTestTypes((data?.results || data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                code: t.code,
                price: t.price || 0,
                parameters: Array.isArray(t.parameters) ? t.parameters : [],
            })));
        } catch (err: any) {
            toast.error("Failed to load test types");
        } finally {
            setLoadingTests(false);
        }
    };

    useEffect(() => { loadTestTypes(); }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null); // Shared for both Inventory & Tests
    const [testForm, setTestForm] = useState<any>({ name: '', code: '', price: '', id: undefined });
  const [saving, setSaving] = useState(false);

  // Form State for Test Parameters
  const [tempParams, setTempParams] = useState<LabParameter[]>([]);

  useEffect(() => { setLocalSearch(globalSearch); }, [globalSearch]);
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLabItems();
      setInventory(data || []);
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load lab data";
            toast.error(message);
        }
    finally { setLoading(false); }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item: any) => item.name?.toLowerCase().includes(localSearch.toLowerCase()));
  }, [inventory, localSearch]);

  const filteredTests = useMemo(() => {
    return testTypes.filter((test) => 
        test.name.toLowerCase().includes(localSearch.toLowerCase()) || 
        test.code.toLowerCase().includes(localSearch.toLowerCase())
    );
  }, [testTypes, localSearch]);

  // --- Handlers ---

  // Open Modal logic
  const handleOpenModal = (item?: any) => {
      setEditingItem(item || null);
      if (activeTab === "tests") {
          if (item) {
              setTestForm({
                  id: item.id,
                  name: item.name,
                  code: item.code,
                  price: item.price,
              });
              setTempParams(Array.isArray(item.parameters) ? item.parameters : []);
          } else {
              setTestForm({ name: '', code: '', price: '', id: undefined });
              setTempParams([]);
          }
      }
      setIsModalOpen(true);
  };

  // Test Parameter Handlers
  const handleAddParameter = () => {
      setTempParams([...tempParams, { id: Date.now().toString(), name: "", unit: "", refRange: "" }]);
  };
  const handleParamChange = (id: string, field: keyof LabParameter, value: string) => {
      setTempParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const handleRemoveParam = (id: string) => {
      setTempParams(prev => prev.filter(p => p.id !== id));
  };

  // Save Inventory Item
    const handleSaveInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData(e.target as HTMLFormElement);
            const expiry = formData.get("expiry") ? String(formData.get("expiry")) : undefined;
            // Expiry date validation: must be today or future
            if (expiry) {
                const today = new Date();
                today.setHours(0,0,0,0);
                const expiryDate = new Date(expiry);
                if (expiryDate < today) {
                    toast.error("Expiry date cannot be in the past.");
                    setSaving(false);
                    return;
                }
            }
            const itemData: any = {
                name: String(formData.get("name")),
                department: "LAB", 
                current_stock: Number(formData.get("stock")),
                minimum_stock: Number(formData.get("minLevel")),
                unit_of_measure: String(formData.get("unit")),
                expiry_date: expiry,
                is_active: true
            };

            if (editingItem) {
                const updated = await updateInventoryItem(editingItem.id, itemData);
                setInventory(prev => prev.map(i => i.id === editingItem.id ? updated : i));
                toast.success("Lab item updated");
            } else {
                const created = await createInventoryItem(itemData);
                setInventory(prev => [...prev, created]);
                toast.success("New reagent/kit added");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                err?.message ||
                "Failed to save item";
            toast.error(message);
        } finally { setSaving(false); }
    };


    // Save Test Type (real API)
    const handleSaveTest = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const testData: any = {
            name: testForm.name,
            code: testForm.code,
            price: Number(testForm.price),
            parameters: tempParams.filter(p => p.name.trim() !== ""),
            is_active: true
        };
        try {
            if (testForm.id) {
                const updated = await updateLabTest(testForm.id, testData);
                setTestTypes(prev => prev.map(t => t.id === testForm.id ? updated : t));
                toast.success("Test type updated");
            } else {
                const created = await createLabTest(testData);
                setTestTypes(prev => [...prev, created]);
                toast.success("New test type added");
            }
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error("Failed to save test type");
        } finally {
            setSaving(false);
        }
    };
  
    const handleDelete = async (id: number, type: "inventory" | "test") => {
        if (!window.confirm("Delete this item?")) return;
        if (type === "inventory") {
            try {
                await deleteInventoryItem(id);
                setInventory(prev => prev.filter(i => i.id !== id));
                toast.success("Deleted");
            } catch (err: any) {
                const message =
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete";
                toast.error(message);
            }
        } else {
            try {
                await deleteLabTest(id);
                setTestTypes(prev => prev.filter(t => t.id !== id));
                toast.success("Test type deleted");
            } catch (err: any) {
                const message =
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete test type";
                toast.error(message);
            }
        }
    };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3">
            <button onClick={() => navigate("/admin/inventory")} className="mt-1 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back to Hub">
                <ArrowLeft size={24} />
            </button>
            <div>
            <h1 className="text-2xl font-bold text-[#073159] flex items-center gap-2">
                <FlaskConical className="w-8 h-8" /> Lab Management
            </h1>
            <p className="text-gray-500 mt-1">Manage laboratory inventory and configure test types.</p>
            </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-[#073159] flex items-center gap-2"><RefreshCw size={18} className={loading?"animate-spin":""} /> Refresh</button>
            <button 
                onClick={() => handleOpenModal()} 
                className="px-4 py-2 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex items-center gap-2 shadow-lg"
            >
                <Plus size={18} /> {activeTab === "inventory" ? "Add Stock Item" : "Create New Test"}
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab("inventory")} className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "inventory" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Package size={16} /> Stock Inventory
          </button>
          <button onClick={() => setActiveTab("tests")} className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === "tests" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Layers size={16} /> Test Types
          </button>
      </div>

      {/* --- CONTENT AREA --- */}
      {activeTab === "inventory" ? (
          // --- INVENTORY TABLE ---
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 justify-between bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" placeholder="Search reagents..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none" value={localSearch} onChange={e => {setLocalSearch(e.target.value); setGlobalSearch(e.target.value)}} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Stock Level</th>
                                <th className="px-6 py-4">Expiry</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading lab supplies...</td></tr> : 
                            filteredInventory.map((item) => (
                                <tr key={item.id} className="hover:bg-purple-50/30 group transition-colors">
                                    <td className="px-6 py-4"><div className="font-bold text-[#073159]">{item.name}</div><div className="text-xs text-gray-400">{item.item_id}</div></td>
                                    <td className="px-6 py-4"><span className="font-medium">{item.current_stock}</span> <span className="text-xs text-gray-500">{item.unit_of_measure}</span></td>
                                    <td className="px-6 py-4 font-mono text-gray-600">{formatDate(item.expiry_date)}</td>
                                    <td className="px-6 py-4 text-center"><StatusBadge status={getStockStatusInfo(item)} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16}/></button>
                                            <button onClick={() => handleDelete(item.id, "inventory")} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
          </div>
      ) : (
          // --- TEST TYPES TABLE WITH EXPANSION ---
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input type="text" placeholder="Search test types..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#073159] outline-none" value={localSearch} onChange={e => {setLocalSearch(e.target.value); setGlobalSearch(e.target.value)}} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-4 w-10"></th>
                                <th className="px-6 py-4">Test Code</th>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Parameters</th>
                                <th className="px-6 py-4">Price (GHS)</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                                                        {loadingTests ? (
                                                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading test types...</td></tr>
                                                        ) : filteredTests.map((test) => (
                                                            <>
                                                                {/* Main Row */}
                                                                <tr key={test.id} className={`hover:bg-blue-50/30 transition-colors ${expandedTestId === test.id ? "bg-blue-50/50" : ""}`}>
                                                                    <td className="px-6 py-4 cursor-pointer" onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}>
                                                                        {expandedTestId === test.id ? <ChevronDown size={18} className="text-[#073159]" /> : <ChevronRight size={18} className="text-gray-400" />}
                                                                    </td>
                                                                    <td className="px-6 py-4 font-mono text-gray-500 text-xs font-bold">{test.code}</td>
                                                                    <td className="px-6 py-4 font-bold text-[#073159]">{test.name}</td>
                                                                    <td className="px-6 py-4 text-gray-600">
                                                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{test.parameters.length} params</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 font-medium">{test.price ?? '0.00'}</td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <button onClick={() => handleOpenModal(test)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16}/></button>
                                                                            <button onClick={() => handleDelete(test.id, "test")} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                                {/* Expanded Detail Row */}
                                                                {expandedTestId === test.id && (
                                                                    <tr className="bg-gray-50/50">
                                                                        <td colSpan={6} className="p-0">
                                                                            <div className="p-6 pl-16 border-b border-gray-100">
                                                                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                                                                    <List size={14} /> Configuration for {test.name}
                                                                                </h4>
                                                                                <table className="w-full max-w-3xl text-sm border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                                                    <thead className="bg-gray-100 text-xs font-bold text-gray-600">
                                                                                        <tr>
                                                                                            <th className="px-4 py-2 border-r border-gray-200">Parameter Name</th>
                                                                                            <th className="px-4 py-2 border-r border-gray-200">Unit</th>
                                                                                            <th className="px-4 py-2">Reference Range</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-gray-100">
                                                                                        {test.parameters.length > 0 ? (
                                                                                            test.parameters.map((param: any) => (
                                                                                                <tr key={param.id}>
                                                                                                    <td className="px-4 py-2 font-medium text-gray-800 border-r border-gray-100">{param.name}</td>
                                                                                                    <td className="px-4 py-2 text-gray-600 border-r border-gray-100">{param.unit || "-"}</td>
                                                                                                    <td className="px-4 py-2 text-gray-600 font-mono text-xs">{param.refRange || "-"}</td>
                                                                                                </tr>
                                                                                            ))
                                                                                        ) : (
                                                                                            <tr>
                                                                                                <td colSpan={3} className="px-4 py-3 text-center text-gray-400 italic">No parameters configured.</td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ))}
                        </tbody>
                    </table>
                </div>
          </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b flex justify-between items-center bg-[#073159] text-white shrink-0">
                      <h3 className="font-bold">
                          {activeTab === "inventory" 
                            ? (editingItem ? "Edit Stock Item" : "Add Lab Stock") 
                            : (editingItem ? "Edit Test Configuration" : "Create New Test")}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
                  </div>
                  
                  {activeTab === "tests" ? (
                      // TEST TYPE FORM
                      <form onSubmit={handleSaveTest} className="flex flex-col h-full overflow-hidden">
                          <div className="p-6 space-y-6 overflow-y-auto flex-1">
                              {/* Test Details Fields */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="md:col-span-2">
                                      <label className="text-xs font-bold text-gray-500 uppercase">Test Name</label>
                                      <input name="testName" value={testForm.name} onChange={e => setTestForm((prev: any) => ({ ...prev, name: e.target.value }))} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" placeholder="e.g. Widal Test" required />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase">Test Code</label>
                                      <input name="testCode" value={testForm.code} onChange={e => setTestForm((prev: any) => ({ ...prev, code: e.target.value }))} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" placeholder="e.g. L-001" required />
                                  </div>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase">Price (GHS)</label>
                                  <input name="testPrice" type="number" step="0.01" value={testForm.price} onChange={e => setTestForm((prev: any) => ({ ...prev, price: e.target.value }))} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required />
                              </div>

                              {/* Parameters Section */}
                              <div className="border-t border-gray-100 pt-4">
                                  <div className="flex justify-between items-center mb-3">
                                      <label className="text-sm font-bold text-[#073159] uppercase">Test Parameters</label>
                                      <button type="button" onClick={handleAddParameter} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1">
                                          <Plus size={14} /> Add Param
                                      </button>
                                  </div>
                                  <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[300px] overflow-y-auto">
                                      {tempParams.length === 0 ? (
                                          <p className="text-center text-gray-400 text-sm italic py-4">No parameters added. Click 'Add Param'.</p>
                                      ) : (
                                          tempParams.map((param) => (
                                              <div key={param.id} className="flex gap-2 items-start">
                                                  <div className="flex-1"><input placeholder="Name" className="w-full p-2 border rounded-lg text-sm" value={param.name} onChange={(e) => handleParamChange(param.id, "name", e.target.value)}/></div>
                                                  <div className="w-24"><input placeholder="Unit" className="w-full p-2 border rounded-lg text-sm" value={param.unit} onChange={(e) => handleParamChange(param.id, "unit", e.target.value)}/></div>
                                                  <div className="w-32"><input placeholder="Ref Range" className="w-full p-2 border rounded-lg text-sm" value={param.refRange} onChange={(e) => handleParamChange(param.id, "refRange", e.target.value)}/></div>
                                                  <button type="button" onClick={() => handleRemoveParam(param.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                              </div>
                                          ))
                                      )}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
                              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                              <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2">
                                  {saving && <Loader2 className="animate-spin" size={18}/>} Save Configuration
                              </button>
                          </div>
                      </form>
                  ) : (
                      // INVENTORY ITEM FORM
                      <form onSubmit={handleSaveInventory} className="p-6 space-y-4">
                          <div><label className="text-xs font-bold text-gray-500 uppercase">Item Name</label><input name="name" defaultValue={editingItem?.name} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required /></div>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs font-bold text-gray-500 uppercase">Stock Level</label><input name="stock" type="number" defaultValue={editingItem?.current_stock} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required /></div>
                              <div><label className="text-xs font-bold text-gray-500 uppercase">Min Alert</label><input name="minLevel" type="number" defaultValue={editingItem?.minimum_stock} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" required /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-xs font-bold text-gray-500 uppercase">Unit</label><select name="unit" defaultValue={editingItem?.unit_of_measure || "KIT"} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]"><option value="KIT">Test Kit</option><option value="BTL">Bottle</option><option value="BOX">Box</option><option value="LTR">Liter</option></select></div>
                              <div><label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label><input name="expiry" type="date" defaultValue={editingItem?.expiry_date} className="w-full p-2.5 border rounded-xl bg-gray-50 outline-none focus:border-[#073159]" /></div>
                          </div>
                          <div className="pt-4 flex gap-3">
                              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                              <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#073159] text-white rounded-xl font-bold hover:bg-[#062a4d] flex justify-center items-center gap-2">{saving && <Loader2 className="animate-spin" size={18}/>} Save Item</button>
                          </div>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}

// Reused Helpers
function StatusBadge({ status }: any) { return <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>{status.text}</span>; }