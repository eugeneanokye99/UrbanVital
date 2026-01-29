import { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import {
    Pill,
    CheckCircle,
    Clock,
    Eye,
    DollarSign,
    TrendingUp,
    Loader2,
    User,
    Stethoscope,
    BarChart3,
    ArrowRight,
    Calendar
} from "lucide-react";
import { fetchPrescriptionQueue, fetchPharmacyStats } from "../../services/api";
import { toast } from "react-hot-toast";

export default function PharmacyDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { globalSearch } = useOutletContext<{ globalSearch: string }>();

    const [activeTab, setActiveTab] = useState("pending");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    // Data States
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
    const [topDrugs, setTopDrugs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Load Data
    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch prescriptions from consultations
            const prescriptionsData = await fetchPrescriptionQueue();
            setPrescriptions(prescriptionsData || []);

            // Fetch pharmacy stats from backend
            const statsData = await fetchPharmacyStats();
            setStats({
                today: statsData.today_revenue || 0,
                week: statsData.week_revenue || 0,
                total: statsData.total_revenue || 0
            });
            setTopDrugs(statsData.top_drugs || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.highlight) {
            const itemToHighlight = prescriptions.find(p =>
                p.patient_name?.toLowerCase().includes(location.state.highlight.toLowerCase())
            );

            if (itemToHighlight) {
                setActiveTab(itemToHighlight.status === "Paid" ? "history" : "pending");
                setHighlightedId(itemToHighlight.id);
                setTimeout(() => setHighlightedId(null), 3000);
            }
        }
    }, [location.state, prescriptions]);

    const filteredList = prescriptions.filter(p => {
        const matchesTab = activeTab === "pending" ? p.status === "Pending" : p.status === "Paid";
        const searchLower = globalSearch.toLowerCase();
        const matchesSearch =
            (p.patient_name || "").toLowerCase().includes(searchLower) ||
            (p.doctor_name || "").toLowerCase().includes(searchLower) ||
            p.id.toString().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const handleProcessSale = (rx: any) => {
        navigate("/pharmacy/pharmacypos", {
            state: {
                invoiceId: rx.id,
                patientId: rx.patient_id_number,
                items: rx.items
            }
        });
    };

    const formatMoney = (amount: number) => `₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* --- TOP ROW: STATS & ANALYTICS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

                {/* Pharmacy Revenue Card */}
                <div className="bg-gradient-to-br from-[#073159] to-[#0a4378] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/10 flex flex-col justify-between h-[130px] relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110">
                        <DollarSign size={80} />
                    </div>
                    <div>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <TrendingUp size={14} /> Today's Revenue
                        </p>
                        <h2 className="text-3xl font-extrabold tracking-tight">{formatMoney(stats.today)}</h2>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs bg-white/10 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                        <Calendar size={12} />
                        <span>Weekly: {formatMoney(stats.week)}</span>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px] relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-5 transform translate-x-4 -translate-y-4">
                        <TrendingUp size={80} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <TrendingUp size={14} className="text-green-600" /> Total Revenue
                        </p>
                        <h2 className="text-3xl font-extrabold text-green-600">{formatMoney(stats.total)}</h2>
                    </div>
                    <p className="text-xs text-gray-500 font-bold bg-green-50 w-fit px-2 py-1 rounded-lg">
                        Lifetime Sales
                    </p>
                </div>

                {/* Queue Status Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-[130px]">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                            <Clock size={14} /> Pending Queue
                        </p>
                        <h2 className="text-3xl font-extrabold text-[#073159]">
                            {prescriptions.filter(p => p.status === 'Pending').length}
                        </h2>
                    </div>
                    <p className="text-xs text-orange-500 font-bold bg-orange-50 w-fit px-2 py-1 rounded-lg">
                        Waiting for dispensing
                    </p>
                </div>

                {/* Top Selling Drugs List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[276px] md:h-[130px] lg:h-[130px] xl:h-[276px]">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-[#073159] flex items-center gap-2">
                            <BarChart3 size={18} /> Top 5 Selling Products
                        </h3>
                        {/* --- NAVIGATION LINK --- */}
                        <button
                            onClick={() => navigate("/pharmacy/pharmacyhistory")}
                            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View Full Report <ArrowRight size={12} />
                        </button>
                    </div>
                    <div className="p-5 flex-1 overflow-y-auto">
                        <div className="space-y-4">
                            {topDrugs.map((drug, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-bold text-gray-700">{drug.name}</span>
                                            <span className="text-xs font-medium text-gray-500">{drug.count} units</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${index === 0 ? 'bg-[#073159]' : 'bg-blue-400'}`}
                                                style={{ width: `${drug.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PRESCRIPTIONS QUEUE --- */}
            <div>
                <div className="flex w-full sm:w-auto bg-gray-100 p-1 rounded-xl shadow-inner border border-gray-200 max-w-md mb-6">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "pending" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Pending Queue ({prescriptions.filter(p => p.status === 'Pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "history" ? "bg-white text-[#073159] shadow-sm" : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Completed History
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-[#073159]" /><p className="mt-2 text-gray-500">Loading data...</p></div>
                ) : filteredList.length === 0 ? (
                    <div className="text-center py-20 opacity-50 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Pill size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">No prescriptions found.</p>
                        <p className="text-sm text-gray-400">Waiting for doctors to send new requests.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredList.map((rx) => {
                            const isHighlighted = rx.id === highlightedId;
                            return (
                                <div
                                    key={rx.id}
                                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-all duration-500 ${isHighlighted
                                        ? "border-yellow-400 ring-2 ring-yellow-200 bg-yellow-50 transform scale-[1.02]"
                                        : "border-gray-100 hover:shadow-md hover:border-blue-200"
                                        }`}
                                >
                                    {/* Card Header */}
                                    <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-blue-100 text-blue-700 p-2 rounded-xl"><User size={20} /></div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{rx.patient_name}</h3>
                                                    <p className="text-xs text-gray-500 font-mono">ID: {rx.patient_id_number}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${rx.status === 'Paid' ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}>
                                                {rx.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                                            <Stethoscope size={14} className="text-gray-400" />
                                            <span>Prescribed by: <span className="font-bold text-[#073159]">{rx.doctor_name}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Clock size={14} />
                                            <span>{new Date(rx.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                        </div>
                                    </div>

                                    {/* Drug List Preview */}
                                    <div className="p-5 flex-1 bg-white">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-wide flex items-center gap-1">
                                            <Pill size={12} /> Medication List
                                        </p>
                                        <ul className="space-y-3">
                                            {rx.items.slice(0, 3).map((item: any, i: number) => (
                                                <li key={i} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-1 last:border-0 last:pb-0">
                                                    <span className="font-medium text-gray-700 truncate max-w-[180px]">{item.description}</span>
                                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                                                </li>
                                            ))}
                                            {rx.items.length > 3 && (
                                                <li className="text-xs text-blue-500 font-bold pl-1 pt-1 italic">
                                                    +{rx.items.length - 3} more medications...
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Total Bill</p>
                                            <p className="text-xl font-extrabold text-[#073159]">{formatMoney(rx.total_amount)}</p>
                                        </div>

                                        {activeTab === "pending" ? (
                                            <button
                                                onClick={() => handleProcessSale(rx)}
                                                className="bg-[#073159] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#062a4d] flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95 transition-all"
                                            >
                                                <Eye size={18} /> Process Sale
                                            </button>
                                        ) : (
                                            <button disabled className="text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-default">
                                                <CheckCircle size={16} /> Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}