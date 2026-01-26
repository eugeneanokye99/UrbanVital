import { useNavigate } from "react-router-dom";
import { Package, FlaskConical, ArrowRight } from "lucide-react";

export default function AdminInventoryHub() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#073159] mb-3">Inventory Management</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Select a department to manage stock levels, track expiration dates, and update pricing.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        
        {/* Pharmacy Card */}
        <div 
          onClick={() => navigate("/admin/pharmacy-inventory")}
          className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-md">
              <Package size={40} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#073159]">Pharmacy Stock</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Manage drugs, tablets, syrups, and medical consumables. Track batches and expiry dates.
            </p>
            
            <span className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
              Open Inventory <ArrowRight size={16} />
            </span>
          </div>
        </div>

        {/* Lab Card */}
        <div 
          onClick={() => navigate("/admin/lab-inventory")}
          className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 shadow-md">
              <FlaskConical size={40} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-[#073159]">Lab Inventory</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Manage reagents, test kits, glassware, and laboratory equipment. Monitor usage levels.
            </p>
            
            <span className="flex items-center gap-2 text-sm font-bold text-purple-600 group-hover:gap-3 transition-all">
              Open Inventory <ArrowRight size={16} />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}