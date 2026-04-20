"use client";

import {
  ArrowRight,
  CreditCard,
  Gift,
  History,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface EFund {
  id: string;
  name: string;
  description: string;
  balance: number;
  currency: string;
  type: "wallet" | "gift_card" | "reward";
  expiryDate?: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

// Demo e-funds data
const demoFunds: EFund[] = [
  {
    id: "1",
    name: "Main Wallet",
    description: "Your primary digital wallet for all transactions",
    balance: 2500,
    currency: "INR",
    type: "wallet",
    isActive: true,
  },
  {
    id: "2",
    name: "Sports Store Gift Card",
    description: "Gift card for sports equipment and apparel",
    balance: 1000,
    currency: "INR",
    type: "gift_card",
    expiryDate: "2024-12-31",
    isActive: true,
  },
  {
    id: "3",
    name: "Loyalty Rewards",
    description: "Points earned from purchases and referrals",
    balance: 500,
    currency: "PTS",
    type: "reward",
    isActive: true,
  },
];

// Demo transactions data
const demoTransactions: Transaction[] = [
  {
    id: "1",
    type: "debit",
    amount: 2999,
    description: "Nike Air Max 270 Purchase",
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: "2",
    type: "credit",
    amount: 500,
    description: "Referral Bonus",
    date: "2024-01-12",
    status: "completed",
  },
  {
    id: "3",
    type: "debit",
    amount: 1499,
    description: "Adidas Ultraboost 23",
    date: "2024-01-10",
    status: "completed",
  },
  {
    id: "4",
    type: "credit",
    amount: 100,
    description: "Cashback Reward",
    date: "2024-01-08",
    status: "completed",
  },
];

export default function EFundsPage() {
  const [selectedFund, setSelectedFund] = useState<EFund | null>(null);
  const [showAddFund, setShowAddFund] = useState(false);

  const totalBalance = demoFunds
    .filter((fund) => fund.currency === "INR")
    .reduce((sum, fund) => sum + fund.balance, 0);

  const getFundIcon = (type: string) => {
    switch (type) {
      case "wallet":
        return <Wallet className="w-6 h-6" />;
      case "gift_card":
        return <Gift className="w-6 h-6" />;
      case "reward":
        return <TrendingUp className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getFundColor = (type: string) => {
    switch (type) {
      case "wallet":
        return "bg-sport-blue";
      case "gift_card":
        return "bg-sport-green";
      case "reward":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              E-Funds & Wallets
            </h1>
            <p className="text-gray-600">
              Manage your digital funds and payment methods
            </p>
          </div>
          <button
            onClick={() => setShowAddFund(true)}
            className="flex items-center gap-2 bg-sport-blue text-white px-6 py-3 rounded-lg hover:bg-sport-blue/90"
          >
            <Plus className="w-5 h-5" />
            Add Fund
          </button>
        </div>

        {/* Balance Summary */}
        <div className="bg-gradient-to-r from-sport-blue to-sport-green text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Balance</h2>
              <p className="text-3xl font-bold">
                ₹{totalBalance.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Available Funds</p>
              <p className="text-lg">
                {demoFunds.filter((f) => f.isActive).length} Active
              </p>
            </div>
          </div>
        </div>

        {/* Funds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {demoFunds.map((fund) => (
            <div
              key={fund.id}
              className="bg-white rounded-xl shadow-lg border p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedFund(fund)}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getFundColor(fund.type)}`}
                >
                  {getFundIcon(fund.type)}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    fund.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {fund.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {fund.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{fund.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {fund.currency === "INR"
                      ? "₹"
                      : fund.currency === "PTS"
                        ? "PTS "
                        : "$"}
                    {fund.balance.toLocaleString()}
                  </p>
                  {fund.expiryDate && (
                    <p className="text-xs text-gray-500">
                      Expires: {new Date(fund.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Transactions
            </h2>
            <Link
              href="/transactions"
              className="text-sport-blue hover:text-sport-blue/80 text-sm font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {demoTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === "credit"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "credit" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount.toLocaleString()}
                  </p>
                  <p
                    className={`text-xs ${
                      transaction.status === "completed"
                        ? "text-green-600"
                        : transaction.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fund Details Modal */}
        {selectedFund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedFund.name}
                </h2>
                <button
                  onClick={() => setSelectedFund(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedFund.currency === "INR"
                      ? "₹"
                      : selectedFund.currency === "PTS"
                        ? "PTS "
                        : "$"}
                    {selectedFund.balance.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-800">{selectedFund.description}</p>
                </div>

                {selectedFund.expiryDate && (
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="text-gray-800">
                      {new Date(selectedFund.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-sport-blue text-white py-2 rounded-lg hover:bg-sport-blue/90">
                    Add Money
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Fund Modal */}
        {showAddFund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Fund
                </h2>
                <button
                  onClick={() => setShowAddFund(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fund Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sport-blue focus:border-transparent">
                    <option>Digital Wallet</option>
                    <option>Gift Card</option>
                    <option>Reward Points</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fund Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter fund name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sport-blue focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddFund(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 bg-sport-blue text-white py-2 rounded-lg hover:bg-sport-blue/90">
                    Create Fund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
