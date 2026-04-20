"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  SlidersHorizontal,
  RefreshCw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface RefundItem {
  _id: string;
  orderId?: {
    _id: string;
    orderId?: string;
    orderValue?: number;
    orderStatus?: string;
    paymentMethod?: string;
  };
  paymentId?: {
    amount: number;
    currency: string;
    status: string;
    method: string;
  };
  userId?: {
    username?: string;
    email?: string;
    mobile?: string;
  };
  amount: number;
  currency: string;
  reason: string;
  notes?: string;
  status: "requested" | "processing" | "processed" | "failed" | "cancelled";
  approvedBy?: {
    username?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<RefundItem["status"], string> = {
  requested: "Requested",
  processing: "Processing",
  processed: "Processed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const statusStyles: Record<RefundItem["status"], string> = {
  requested: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  processed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusOptions = ["all", "requested", "processing", "processed", "failed", "cancelled"];

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refund/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (result.success) {
        setRefunds(result.data || []);
      } else {
        toast.error(result.message || "Could not load refunds");
        setRefunds([]);
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast.error("Failed to load refunds");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  const updateRefundStatus = async (refundId: string, status: RefundItem["status"]) => {
    try {
      setUpdatingId(refundId);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/refund/update-status/${refundId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const result = await response.json();

      if (result.success) {
        toast.success("Refund status updated");
        setRefunds((prev) => prev.map((item) => (item._id === refundId ? result.data : item)));
      } else {
        toast.error(result.message || "Failed to update refund");
      }
    } catch (error) {
      console.error("Error updating refund status:", error);
      toast.error("Failed to update refund status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        refund._id.toLowerCase().includes(searchLower) ||
        refund.orderId?.orderId?.toLowerCase().includes(searchLower) ||
        refund.userId?.username?.toLowerCase().includes(searchLower) ||
        refund.userId?.email?.toLowerCase().includes(searchLower) ||
        refund.reason.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [refunds, searchTerm, statusFilter]);

  const formatCurrency = (amount: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency === "INR" ? "INR" : currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Refunds</h1>
          <p className="text-gray-600">Review refund requests and manage refund status from one place.</p>
        </div>
        <button
          type="button"
          onClick={fetchRefunds}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total refunds</p>
            <p className="mt-3 text-3xl font-semibold text-blue-700">{refunds.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Requested</p>
            <p className="mt-3 text-3xl font-semibold text-orange-600">
              {refunds.filter((refund) => refund.status === "requested").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Processed</p>
            <p className="mt-3 text-3xl font-semibold text-green-600">
              {refunds.filter((refund) => refund.status === "processed").length}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-blue-700 text-sm font-semibold uppercase tracking-[0.18em] mb-3">
            <RefreshCw className="w-4 h-4" />
            Refund Guide
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">What does refund status mean?</h2>
          <p className="text-sm leading-6 text-slate-700">
            Refunds are customer requests to return the order amount. Use the status actions to track each request clearly.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• requested: customer has opened a refund request.</li>
            <li>• processing: refund is under admin review.</li>
            <li>• processed: refund completed successfully.</li>
            <li>• failed / cancelled: refund will not be completed.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search refunds, orders, users or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : statusLabels[option as RefundItem["status"]]}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden md:flex items-end justify-end">
            <button
              type="button"
              onClick={fetchRefunds}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Reload
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[260px] px-6 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="text-center px-6 py-16 text-gray-600">
            No refunds found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-4">Refund</th>
                  <th className="px-4 py-4">Order</th>
                  <th className="px-4 py-4">Customer</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Reason</th>
                  <th className="px-4 py-4">Requested</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {refund._id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="mb-1 text-sm font-medium text-gray-800">
                        #{refund.orderId?.orderId || refund.orderId?._id?.slice(0, 8) || "—"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {refund.orderId?.orderStatus || "Unknown"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="font-medium text-gray-900">
                        {refund.userId?.username || refund.userId?.email || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">{refund.userId?.email || refund.userId?.mobile || "—"}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-900">
                      {formatCurrency(refund.amount, refund.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[refund.status]}`}>
                        {statusLabels[refund.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 max-w-[220px] truncate">
                      {refund.reason}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(refund.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        {(refund.status === "requested" || refund.status === "processing") && (
                          <>
                            <button
                              type="button"
                              disabled={!!updatingId}
                              onClick={() => updateRefundStatus(refund._id, "processing")}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                              {updatingId === refund._id ? "Updating..." : "Mark Processing"}
                            </button>
                            <button
                              type="button"
                              disabled={!!updatingId}
                              onClick={() => updateRefundStatus(refund._id, "processed")}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                            >
                              {updatingId === refund._id ? "Updating..." : "Mark Processed"}
                            </button>
                            <button
                              type="button"
                              disabled={!!updatingId}
                              onClick={() => updateRefundStatus(refund._id, "cancelled")}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                            >
                              {updatingId === refund._id ? "Updating..." : "Cancel"}
                            </button>
                          </>
                        )}
                        {refund.status === "failed" && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                            <XCircle className="h-4 w-4" /> Failed
                          </div>
                        )}
                        {refund.status === "processed" && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-4 w-4" /> Completed
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
