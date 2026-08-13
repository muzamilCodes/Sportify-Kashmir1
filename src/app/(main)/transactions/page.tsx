"use client";

import { ArrowLeftRight, CreditCard, Filter, History, Loader2, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type TransactionStatus = "completed" | "pending" | "failed";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  title: string;
  description: string;
  date: string;
  status: TransactionStatus;
  source: string;
}

const demoTransactions: Transaction[] = [
  {
    id: "txn_001",
    type: "debit",
    amount: 2999,
    title: "Order Payment",
    description: "Nike running shoes payment",
    date: "2026-08-08",
    status: "completed",
    source: "Wallet",
  },
  {
    id: "txn_002",
    type: "credit",
    amount: 500,
    title: "Refund",
    description: "Refund for cancelled cricket bat order",
    date: "2026-08-06",
    status: "completed",
    source: "Refund",
  },
  {
    id: "txn_003",
    type: "credit",
    amount: 250,
    title: "Cashback",
    description: "Promotional cashback reward",
    date: "2026-08-05",
    status: "pending",
    source: "Rewards",
  },
  {
    id: "txn_004",
    type: "debit",
    amount: 1599,
    title: "Gift Card Purchase",
    description: "Gift card used on accessories order",
    date: "2026-08-02",
    status: "completed",
    source: "Gift Card",
  },
];

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | TransactionStatus>("all");
  const [loading] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (statusFilter === "all") return demoTransactions;
    return demoTransactions.filter((transaction) => transaction.status === statusFilter);
  }, [statusFilter]);

  const balanceSummary = demoTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === "credit" ? transaction.amount : -transaction.amount),
    0,
  );

  const totalCredits = demoTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalDebits = demoTransactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const getStatusClass = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              <History className="h-4 w-4" />
              Transaction History
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet Transactions</h1>
            <p className="mt-2 text-gray-600">A simple view of credits, debits, refunds, and rewards.</p>
          </div>
          <Link
            href="/efunds"
            className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-5 py-3 font-semibold text-orange-600 transition hover:border-orange-300 hover:bg-orange-50"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Back to Funds
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Net Balance</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">₹{balanceSummary.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-500">Credits minus debits</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Credits</p>
            <p className="mt-2 text-3xl font-bold text-green-600">₹{totalCredits.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-500">Refunds and rewards</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Debits</p>
            <p className="mt-2 text-3xl font-bold text-red-600">₹{totalDebits.toLocaleString()}</p>
            <p className="mt-2 text-sm text-gray-500">Orders and wallet spends</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Filter</span>
            {(["all", "completed", "pending", "failed"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  statusFilter === value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    transaction.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                  }`}
                >
                  {transaction.type === "credit" ? <Wallet className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{transaction.title}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{transaction.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString("en-IN")} • {transaction.source}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 md:text-right">
                <div>
                  <p className={`text-xl font-bold ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.type === "credit" ? "Money received" : "Money spent"}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-gray-600">No transactions match the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
