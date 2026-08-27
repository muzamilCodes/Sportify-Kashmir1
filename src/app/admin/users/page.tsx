"use client";

import { Edit, Filter, Search, Trash2, UserCheck, UserX, CreditCard, QrCode, Landmark, Eye, X, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SavedCard {
  _id: string;
  cardHolder: string;
  cardNumber: string;
  rawLast4?: string;
  expiryDate: string;
  cardType: string;
  bankName: string;
  createdAt: string;
}

interface SavedUpi {
  _id: string;
  vpa: string;
  name?: string;
  provider?: string;
  createdAt: string;
}

interface SavedBankAccount {
  _id: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  createdAt: string;
}

interface WalletTransaction {
  _id?: string;
  title: string;
  type: "credit" | "debit";
  amount: number;
  date: string;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt: string;
  savedCards?: SavedCard[];
  savedUpi?: SavedUpi[];
  savedBankAccounts?: SavedBankAccount[];
  walletBalance?: number;
  walletTransactions?: WalletTransaction[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUserPayments, setSelectedUserPayments] = useState<User | null>(null);

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.mobile && user.mobile.includes(searchTerm)),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => (user.isAdmin ? "admin" : "user") === roleFilter,
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh list
        setShowDeleteConfirm(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string, active: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: active }),
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          `User ${active ? "activated" : "deactivated"} successfully`,
        );
        fetchUsers(); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const roles = ["all", ...new Set(users.map((u) => (u.isAdmin ? "admin" : "user")))];

  // Total accounts stats
  const totalCardsSubmitted = users.reduce((acc, u) => acc + (u.savedCards?.length || 0), 0);
  const totalUpiSubmitted = users.reduce((acc, u) => acc + (u.savedUpi?.length || 0), 0);
  const totalBanksSubmitted = users.reduce((acc, u) => acc + (u.savedBankAccounts?.length || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management &amp; Accounts</h1>
          <p className="text-gray-600">View registered users, submitted ATM cards, UPI IDs &amp; Bank details</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Athletes</p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {filteredUsers.length}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Submitted ATM Cards</p>
              <p className="text-2xl font-black text-orange-600 mt-1">
                {totalCardsSubmitted}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <CreditCard size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Linked UPI IDs</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {totalUpiSubmitted}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <QrCode size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Linked Bank A/Cs</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {totalBanksSubmitted}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Landmark size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by username, email or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-xl text-xs"
            >
              <option value="all">All Roles</option>
              {roles
                .filter((role) => role !== "all")
                .map((role) => (
                  <option key={role} value={role}>
                    {role.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 text-xs font-semibold">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">User &amp; Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Submitted Payment Accounts</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const cardCount = user.savedCards?.length || 0;
                  const upiCount = user.savedUpi?.length || 0;
                  const bankCount = user.savedBankAccounts?.length || 0;
                  const totalAccounts = cardCount + upiCount + bankCount;

                  return (
                    <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* User Info */}
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {user.mobile && (
                            <p className="text-[11px] font-mono text-gray-400 mt-0.5">📞 {user.mobile}</p>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                            (user.isAdmin ? "admin" : "user") === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.isAdmin ? "admin" : "user"}
                        </span>
                      </td>

                      {/* Submitted Payment Accounts Badges */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {totalAccounts === 0 ? (
                            <span className="text-[11px] text-gray-400 font-medium">None added</span>
                          ) : (
                            <>
                              {cardCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                                  <CreditCard size={11} />
                                  <span>{cardCount} Card{cardCount > 1 ? "s" : ""}</span>
                                </span>
                              )}
                              {upiCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                                  <QrCode size={11} />
                                  <span>{upiCount} UPI</span>
                                </span>
                              )}
                              {bankCount > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                                  <Landmark size={11} />
                                  <span>{bankCount} Bank</span>
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black">
                                <Wallet size={11} />
                                <span>₹{(user.walletBalance ?? 500).toLocaleString("en-IN")}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              user.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          ></div>
                          <span className="text-xs font-semibold">
                            {(user.isActive ?? true) ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="p-4">
                        <span className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Payment Accounts */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserPayments(user)}
                            className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 bg-blue-50/50 border border-blue-200 transition cursor-pointer"
                            title="View Submitted Payment & Account Details"
                          >
                            <CreditCard size={16} />
                          </button>

                          {/* Toggle Status */}
                          <button
                            onClick={() =>
                              handleToggleStatus(user._id, !(user.isActive ?? true))
                            }
                            className={`p-2 rounded-xl border ${
                              (user.isActive ?? true)
                                ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                                : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                            }`}
                            title={(user.isActive ?? true) ? "Deactivate" : "Activate"}
                          >
                            {(user.isActive ?? true) ? (
                              <UserX size={16} />
                            ) : (
                              <UserCheck size={16} />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setShowDeleteConfirm(user._id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ADMIN VIEW: USER SUBMITTED PAYMENT & BANK DETAILS MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {selectedUserPayments && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div
            className="bg-white text-gray-900 rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200 max-h-[85vh] overflow-y-auto space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">
                    {selectedUserPayments.username}&apos;s Payment &amp; Account Details
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                    {selectedUserPayments.isAdmin ? "Admin" : "Athlete"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Email: {selectedUserPayments.email} • Phone: {selectedUserPayments.mobile || "Not provided"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserPayments(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Section 1: ATM / Debit & Credit Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <CreditCard size={15} className="text-orange-600" />
                <span>Submitted ATM &amp; Debit Cards ({selectedUserPayments.savedCards?.length || 0})</span>
              </h4>

              {!selectedUserPayments.savedCards || selectedUserPayments.savedCards.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                  No ATM or cards submitted by this user.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUserPayments.savedCards.map((card) => (
                    <div
                      key={card._id}
                      className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-sm border border-zinc-700 space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-orange-400">{card.bankName}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-zinc-300 uppercase">
                          {card.cardType}
                        </span>
                      </div>
                      <p className="font-mono text-sm tracking-widest font-bold text-zinc-100">
                        {card.cardNumber}
                      </p>
                      <div className="flex justify-between items-center text-[11px] text-zinc-400 pt-1 border-t border-zinc-700">
                        <span>Holder: <strong className="text-white uppercase">{card.cardHolder}</strong></span>
                        <span>Exp: <strong className="text-white">{card.expiryDate}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Linked UPI IDs */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <QrCode size={15} className="text-emerald-600" />
                <span>Linked UPI IDs ({selectedUserPayments.savedUpi?.length || 0})</span>
              </h4>

              {!selectedUserPayments.savedUpi || selectedUserPayments.savedUpi.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                  No UPI ID linked by this user.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedUserPayments.savedUpi.map((upi) => (
                    <div
                      key={upi._id}
                      className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          UPI
                        </div>
                        <div>
                          <p className="font-mono font-bold text-xs text-gray-900">{upi.vpa}</p>
                          <p className="text-[10px] text-gray-500">{upi.provider || "UPI"} • Linked</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Bank Account Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Landmark size={15} className="text-blue-600" />
                <span>Bank Account Details ({selectedUserPayments.savedBankAccounts?.length || 0})</span>
              </h4>

              {!selectedUserPayments.savedBankAccounts || selectedUserPayments.savedBankAccounts.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                  No bank account added by this user.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedUserPayments.savedBankAccounts.map((bank) => (
                    <div
                      key={bank._id}
                      className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                          <Landmark size={14} className="text-blue-600" />
                          <span>{bank.bankName}</span>
                        </h5>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {bank.branchName || "Branch"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-blue-200/60">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Account Holder</span>
                          <span className="font-bold text-gray-900 uppercase">{bank.accountHolder}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Account Number</span>
                          <span className="font-mono font-bold text-gray-900">{bank.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">IFSC Code</span>
                          <span className="font-mono font-bold text-emerald-700">{bank.ifscCode}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">Status</span>
                          <span className="font-bold text-emerald-700">Active Direct Transfer ✅</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Sportify Wallet Balance & Transaction Activity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Wallet size={15} className="text-emerald-600" />
                  <span>Sportify Pay Wallet &amp; Ledger</span>
                </h4>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Balance: ₹{(selectedUserPayments.walletBalance ?? 500).toLocaleString("en-IN")}
                </span>
              </div>

              {!selectedUserPayments.walletTransactions || selectedUserPayments.walletTransactions.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                  No wallet transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedUserPayments.walletTransactions.map((tx, idx) => (
                    <div
                      key={tx._id || idx}
                      className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-xs text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{tx.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {tx.date} • {tx.paymentMethod || "Direct Transfer"} • <span className="text-emerald-600 font-bold">{tx.status}</span>
                        </p>
                      </div>
                      <span
                        className={`font-black text-xs ${
                          tx.type === "credit" ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedUserPayments(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-black mb-2 text-gray-900">
              Confirm Delete User
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove their orders and saved payment accounts.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border border-gray-300 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

