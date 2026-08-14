"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Calendar, Trash2, Loader2, X, Check, Power } from "lucide-react";
import toast from "react-hot-toast";

interface Coupon {
  _id: string;
  code: string;
  discountType: "Percentage" | "Fixed Amount";
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "Percentage",
    discountValue: "",
    minOrderValue: "0",
    expiryDate: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupon/all`);
      const result = await response.json();
      if (result.success && result.data) {
        setCoupons(result.data);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      toast.error("Code, discount value, and expiry date are required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupon/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: formData.code,
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          minOrderValue: Number(formData.minOrderValue || 0),
          expiryDate: formData.expiryDate,
        }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Coupon created successfully!");
        setShowAddModal(false);
        setFormData({
          code: "",
          discountType: "Percentage",
          discountValue: "",
          minOrderValue: "0",
          expiryDate: "",
        });
        fetchCoupons();
      } else {
        toast.error(result.message || "Failed to create coupon");
      }
    } catch (error) {
      console.error("Add coupon error:", error);
      toast.error("Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupon/toggle/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        fetchCoupons();
      } else {
        toast.error(result.message || "Failed to update coupon status");
      }
    } catch (error) {
      toast.error("Failed to update coupon status");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupon/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } else {
        toast.error(result.message || "Failed to delete coupon");
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coupons & Offers</h1>
          <p className="text-gray-500 mt-1 font-medium">Create and manage live discount codes for your store.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No coupons available</h3>
            <p className="text-gray-500 max-w-sm mx-auto text-sm mb-4">
              Click the button above to create your first store promotional coupon.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Coupon Code</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Discount</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Min Order</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Expiry Date</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                          <Ticket size={18} />
                        </div>
                        <span className="font-bold text-gray-900 tracking-wider font-mono">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{coupon.discountType}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">₹{coupon.minOrderValue || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} /> {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon._id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                          coupon.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Power size={12} />
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        disabled={deletingId === coupon._id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete coupon"
                      >
                        {deletingId === coupon._id ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Create New Coupon</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full p-3 border rounded-xl font-mono uppercase font-bold text-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={formData.discountType === "Percentage" ? "10" : "500"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full p-3 border rounded-xl font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  className="w-full p-3 border rounded-xl font-bold focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full p-3 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" /> Create Coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
