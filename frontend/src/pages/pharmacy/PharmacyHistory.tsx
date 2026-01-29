import { useState, useEffect, useMemo } from "react";
import {
    History, Search, Download, Calendar, X, TrendingUp, BarChart3, PieChart, List
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fetchPharmacySalesHistory } from "../../services/api";

// Helper to group by date
const groupByDate = (data: any[]) => {
    return data.reduce((groups: any, item: any) => {
        const date = item.date;
        if (!groups[date]) groups[date] = [];
        groups[date].push(item);
        return groups;
    }, {});
};

export default function PharmacyHistory() {
    const { globalSearch } = useOutletContext<{ globalSearch: string }>();

    const [localSearch, setLocalSearch] = useState(globalSearch);
    const [dateFilter, setDateFilter] = useState("");
    const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { setLocalSearch(globalSearch); }, [globalSearch]);

    // Load pharmacy sales history
    useEffect(() => {
        loadSalesHistory();
    }, []);

    const loadSalesHistory = async () => {
        setLoading(true);
        try {
            const data = await fetchPharmacySalesHistory();
            setSales(data || []);
        } catch (error) {
            console.error('Error loading sales history:', error);
            toast.error('Failed to load sales history');
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC ---
    const filteredHistory = useMemo(() => {
        return (sales || []).filter(sale => {
            const searchLower = localSearch.toLowerCase();
            const matchesSearch =
                sale.patient.toLowerCase().includes(searchLower) ||
                sale.id.toLowerCase().includes(searchLower) ||
                sale.items.toLowerCase().includes(searchLower);

            const matchesDate = dateFilter ? sale.date === dateFilter : true;
            return matchesSearch && matchesDate;
        });
    }, [sales, localSearch, dateFilter]);

    // --- ANALYTICS LOGIC ---
    const analytics = useMemo(() => {
        const totalSales = filteredHistory.reduce((sum, item) => sum + Number(item.amount), 0);
        const totalTxns = filteredHistory.length;

        // 1. Calculate Top Items
        const itemCounts: Record<string, number> = {};
        filteredHistory.forEach(sale => {
            const items = sale.items.split(',').map((i: string) => i.trim());
            items.forEach((i: string) => {
                itemCounts[i] = (itemCounts[i] || 0) + 1;
            });
        });

        const topItems = Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => ({
                name,
                count,
                percentage: totalTxns > 0 ? (count / totalTxns) * 100 : 0
            }));

        // 2. Calculate Payment Methods
        const methods: Record<string, number> = {};
        filteredHistory.forEach(sale => {
            methods[sale.method] = (methods[sale.method] || 0) + 1;
        });
        const methodStats = Object.entries(methods).map(([name, count]) => ({
            name, count, percentage: (count / totalTxns) * 100
        }));

        return { totalSales, totalTxns, topItems, methodStats };
    }, [filteredHistory]);

    const groupedHistory = useMemo(() => groupByDate(filteredHistory), [filteredHistory]);

    const handleExport = () => {
        if (filteredHistory.length === 0) return toast.error("No data to export");
        const headers = ["ID", "Date", "Time", "Patient", "Items", "Amount", "Method", "Pharmacist"];
        const csvRows = filteredHistory.map(s => [s.id, s.date, s.time, `"${s.patient}"`, `"${s.items}"`, s.amount, s.method, s.pharmacist].join(","));
        const csvString = [headers.join(","), ...csvRows].join("\n");
        const url = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Pharmacy_Sales_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        toast.success("Download started");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* 1. Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#073159] flex items-center gap-2">
                        <History className="w-6 h-6 sm:w-7 sm:h-7" />
                        Sales History & Audit
                    </h1>
                    <p className="text-sm text-gray-500">Track dispensed medication and revenue.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "list" ? "bg-[#073159] text-white shadow-lg" : "bg-white text-gray-600 border"}`}>Transaction Log</button>
                    <button onClick={() => setActiveTab("analytics")} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "analytics" ? "bg-[#073159] text-white shadow-lg" : "bg-white text-gray-600 border"}`}>Analytics</button>
                </div>
            </div>

            {/* 2. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue</p>
                        <h3 className="text-2xl font-extrabold text-[#073159]">₵{analytics.totalSales.toFixed(2)}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Transactions</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{analytics.totalTxns}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><History size={24} /></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Top Product</p>
                        <h3 className="text-lg font-bold text-gray-800 truncate max-w-[150px]">{analytics.topItems[0]?.name || "N/A"}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><BarChart3 size={24} /></div>
                </div>
            </div>

            {/* 3. Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search receipt #, patient, or drug..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#073159] outline-none text-sm"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
                        <input type="date" className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-sm outline-none cursor-pointer" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                        {dateFilter && <button onClick={() => setDateFilter("")} className="absolute right-2 top-2.5 text-gray-400 hover:text-red-500"><X size={14} /></button>}
                    </div>
                    <button onClick={handleExport} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 text-sm whitespace-nowrap"><Download size={16} /> Export</button>
                </div>
            </div>

            {/* 4. Content Area */}
            {activeTab === "list" ? (
                // --- TRANSACTION LOG VIEW ---
                <div className="space-y-6">
                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                            <History size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500">No records found matching your filters.</p>
                        </div>
                    ) : (
                        Object.entries(groupedHistory).map(([date, items]: [string, any]) => (
                            <div key={date} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                        <Calendar size={16} className="text-[#073159]" /> {date}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-medium">{items.length} Transactions</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-6 py-3">Receipt ID</th>
                                                <th className="px-6 py-3">Time</th>
                                                <th className="px-6 py-3">Patient</th>
                                                <th className="px-6 py-3">Items</th>
                                                <th className="px-6 py-3">Total</th>
                                                <th className="px-6 py-3">Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((sale: any) => (
                                                <tr key={sale.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-[#073159] font-bold text-xs">{sale.id}</td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs">{sale.time}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{sale.patient}</td>
                                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px] text-xs">{sale.items}</td>
                                                    <td className="px-6 py-4 font-bold text-[#073159]">₵{sale.amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${sale.method === "Cash" ? "bg-green-50 text-green-700 border-green-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                                                            {sale.method}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // --- ANALYTICS VIEW ---
                <div className="space-y-6">

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Top 5 Products Bar Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-[#073159] flex items-center gap-2 mb-6">
                                <BarChart3 size={20} /> Top 5 Best Sellers
                            </h3>
                            <div className="space-y-4">
                                {analytics.topItems.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between text-xs mb-1.5 font-medium">
                                            <span className="text-gray-700 group-hover:text-[#073159] transition-colors">{item.name}</span>
                                            <span className="text-gray-500">{item.count} units</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#073159] rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${item.percentage * 2}%` }} // Scale up for visual effect
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Method Distribution */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-[#073159] flex items-center gap-2 mb-6">
                                <PieChart size={20} /> Sales by Payment Method
                            </h3>
                            <div className="space-y-4">
                                {analytics.methodStats.map((method, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                            {Math.round(method.percentage)}%
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-bold text-gray-800">{method.name}</span>
                                                <span className="text-xs text-gray-500">{method.count} txns</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${idx % 2 === 0 ? "bg-green-500" : "bg-purple-500"}`}
                                                    style={{ width: `${method.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-[#073159] flex items-center gap-2">
                                <List size={20} /> Product Performance Report
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 w-16 text-center">Rank</th>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4 text-center">Units Sold</th>
                                        <th className="px-6 py-4 text-right">Contribution</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {analytics.topItems.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx < 3 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                            <td className="px-6 py-4 text-center font-mono text-gray-600">{item.count}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="text-xs font-bold text-gray-500">{item.percentage.toFixed(1)}%</span>
                                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500" style={{ width: `${item.percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.topItems.length === 0 && (
                                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">No sales data available.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}