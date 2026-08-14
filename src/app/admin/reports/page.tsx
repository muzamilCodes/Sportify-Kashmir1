"use client";

import { useEffect, useState } from "react";
import { BarChart3, Users, DollarSign, Download, Loader2, Package, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryReport {
  category: string;
  revenue: number;
  itemsSold: number;
}

interface TopProduct {
  _id: string;
  name: string;
  totalRevenue: number;
  quantitySold: number;
}

interface ReportsData {
  totalSales: number;
  newCustomers: number;
  totalCustomers: number;
  conversionRate: number;
  categorySales: CategoryReport[];
  topProducts: TopProduct[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportsData>({
    totalSales: 0,
    newCustomers: 0,
    totalCustomers: 0,
    conversionRate: 0,
    categorySales: [],
    topProducts: [],
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load reports");
      }
    } catch (error) {
      console.error("Reports fetch error:", error);
      toast.error("Error loading analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Metric,Value\n";
      csvContent += `Total Sales Revenue,INR ${data.totalSales}\n`;
      csvContent += `New Customers (30 Days),${data.newCustomers}\n`;
      csvContent += `Total Registered Customers,${data.totalCustomers}\n`;
      csvContent += `Conversion Rate,${data.conversionRate}%\n\n`;

      csvContent += "Category,Revenue (INR),Items Sold\n";
      data.categorySales.forEach((c) => {
        csvContent += `"${c.category}",${c.revenue},${c.itemsSold}\n`;
      });

      csvContent += "\nTop Product,Revenue (INR),Quantity Sold\n";
      data.topProducts.forEach((p) => {
        csvContent += `"${p.name}",${p.totalRevenue},${p.quantitySold}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Sportify_Analytics_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Analytics CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-3" />
        <p className="text-gray-500 font-medium">Generating live analytics & reports...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1 font-medium">Real-time revenue performance, category breakdowns, and top products.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
          >
            <Download size={18} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
              <DollarSign size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">Total Store Sales</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{data.totalSales.toLocaleString("en-IN")}</h3>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
              Calculated from all paid orders
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Users size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">New Customers (30 Days)</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.newCustomers}</h3>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
              Out of {data.totalCustomers} total registered users
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
              <BarChart3 size={24} />
            </div>
            <p className="text-gray-500 font-medium mb-1">Order Conversion Rate</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.conversionRate}%</h3>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
              Paid orders per registered customer
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Sales by Category & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Revenue by Category</h2>
              <p className="text-xs text-gray-500">Live breakdown of earnings per category</p>
            </div>
          </div>

          {data.categorySales.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No sales recorded per category yet.</p>
          ) : (
            <div className="space-y-4">
              {data.categorySales.map((cat, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{cat.category}</h4>
                    <p className="text-xs text-gray-500">{cat.itemsSold} items sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 text-base">₹{cat.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
              <p className="text-xs text-gray-500">Most popular products by sales quantity</p>
            </div>
          </div>

          {data.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">No top products data available yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((prod, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-purple-100 text-purple-700 font-extrabold rounded-lg flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{prod.name || "Product"}</h4>
                      <p className="text-xs text-gray-500">{prod.quantitySold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-gray-900 text-base">₹{prod.totalRevenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
