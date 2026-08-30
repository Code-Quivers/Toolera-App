"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  CheckCircle2,
  X,
  MapPin,
  Mail,
  DollarSign,
  UserCheck,
  Save,
  CreditCard,
  AlertCircle,
  FileText,
  BadgeAlert,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { CustomerItem, useCustomerStore } from "@/store/useCustomerStore";
export type { CustomerItem };

export default function AdminCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, recordDuePayment } =
    useCustomerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "ACTIVE" | "INACTIVE" | "HAS_DUE">("all");

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerItem | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

  // Collect Payment Modal
  const [collectPaymentCust, setCollectPaymentCust] = useState<CustomerItem | null>(null);
  const [collectAmount, setCollectAmount] = useState<string>("");
  const [collectMethod, setCollectMethod] = useState("CASH");
  const [collectNote, setCollectNote] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: "",
    phone: "+880 ",
    email: "",
    location: "Dhaka",
    address: "",
    dueBalance: "0",
    creditLimit: "5000",
    notes: "",
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedStatus === "HAS_DUE") return matchesSearch && (c.dueBalance || 0) > 0;
    if (selectedStatus === "ACTIVE" || selectedStatus === "INACTIVE")
      return matchesSearch && c.status === selectedStatus;
    return matchesSearch;
  });

  // Calculate totals
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalOutstandingDue = customers.reduce((acc, c) => acc + (c.dueBalance || 0), 0);
  const customersWithDueCount = customers.filter((c) => (c.dueBalance || 0) > 0).length;

  // Create Customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim() || !newCust.phone.trim()) return;

    const initialDue = parseFloat(newCust.dueBalance) || 0;

    const created: CustomerItem = {
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCust.name.trim(),
      phone: newCust.phone.trim(),
      email: newCust.email.trim() || "N/A",
      location: newCust.location.trim() || "Bangladesh",
      address: newCust.address.trim() || newCust.location.trim(),
      ordersCount: 0,
      totalSpent: 0,
      dueBalance: initialDue,
      creditLimit: parseFloat(newCust.creditLimit) || 5000,
      status: "ACTIVE",
      joinedDate: new Date().toISOString().split("T")[0],
      notes: newCust.notes.trim(),
      ledger:
        initialDue > 0
          ? [
              {
                id: `led-${Date.now()}`,
                date: new Date().toISOString().split("T")[0],
                type: "DUE_ADDED",
                amount: initialDue,
                note: "Opening Due Balance recorded at registration",
              },
            ]
          : [],
    };

    addCustomer(created);
    setNewCust({
      name: "",
      phone: "+880 ",
      email: "",
      location: "Dhaka",
      address: "",
      dueBalance: "0",
      creditLimit: "5000",
      notes: "",
    });
    setIsAddModalOpen(false);
    showNotification(`Customer "${created.name}" added successfully!`);
  };

  // Update / Edit Customer
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateCustomer(editingCustomer.id, {
      name: editingCustomer.name,
      phone: editingCustomer.phone,
      email: editingCustomer.email,
      location: editingCustomer.location,
      address: editingCustomer.address,
      status: editingCustomer.status,
      dueBalance: editingCustomer.dueBalance,
      creditLimit: editingCustomer.creditLimit,
      notes: editingCustomer.notes,
    });

    if (viewingCustomer?.id === editingCustomer.id) {
      setViewingCustomer(editingCustomer);
    }
    setEditingCustomer(null);
    showNotification(`Customer profile updated successfully!`);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}" from customers CRM?`)) {
      deleteCustomer(id);
      if (viewingCustomer?.id === id) setViewingCustomer(null);
      showNotification(`Customer "${name}" deleted.`);
    }
  };

  // Collect Payment Submit
  const handleCollectPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectPaymentCust) return;
    const amount = parseFloat(collectAmount);
    if (isNaN(amount) || amount <= 0) return;

    recordDuePayment(collectPaymentCust.id, amount, collectMethod, collectNote);
    showNotification(
      `Received payment of ৳${amount} from ${collectPaymentCust.name}. Remaining due updated.`
    );
    setCollectPaymentCust(null);
    setCollectAmount("");
    setCollectNote("");
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Customer Name",
      "Phone",
      "Email",
      "Location",
      "Address",
      "Total Orders",
      "Lifetime Spend",
      "Due Balance (BDT)",
      "Credit Limit (BDT)",
      "Status",
      "Joined Date",
      "Notes",
    ];

    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.ordersCount,
      c.totalSpent,
      c.dueBalance || 0,
      c.creditLimit || 0,
      `"${c.status}"`,
      `"${c.joinedDate}"`,
      `"${(c.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers-due-report-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Exported ${filtered.length} customers to CSV!`);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#008B47]" />
            <span>Customers CRM &amp; Due Tracking (কাস্টমার বকেয়া)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customer directory, lifetime value, credit balances, ledger receipts, and payment collection.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Customers (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Customers
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{totalCustomers}</div>
            <span className="text-[11px] text-slate-500">{customers.filter((c) => c.status === "ACTIVE").length} active clients</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008B47] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Outstanding Due (মোট বকেয়া)
            </span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{formatPrice(totalOutstandingDue)}</div>
            <span className="text-[11px] text-rose-700 font-medium">{customersWithDueCount} customers have dues</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Customer Lifetime Spend
            </span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{formatPrice(totalRevenue)}</div>
            <span className="text-[11px] text-slate-500">Across all completed orders</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers by name, phone, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#008B47]"
          >
            <option value="all">All Customers ({customers.length})</option>
            <option value="HAS_DUE">⚠️ Has Overdue / Due Balance ({customersWithDueCount})</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Contact</th>
              <th className="py-3 px-3">City / District</th>
              <th className="py-3 px-3">Orders</th>
              <th className="py-3 px-3">Lifetime Spend</th>
              <th className="py-3 px-3">Due Balance (বকেয়া)</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No customers found matching your search.
                </td>
              </tr>
            ) : (
              filtered.map((cust) => {
                const hasDue = (cust.dueBalance || 0) > 0;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                    {/* Customer Info */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black shrink-0 text-xs">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900">{cust.name}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-700 font-bold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{cust.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {cust.email}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{cust.location}</span>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {cust.ordersCount} orders
                      </span>
                    </td>

                    {/* Spend */}
                    <td className="py-3.5 px-3">
                      <span className="font-black text-slate-900 text-xs">
                        {formatPrice(cust.totalSpent)}
                      </span>
                    </td>

                    {/* Due Balance */}
                    <td className="py-3.5 px-3">
                      {hasDue ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-black text-[11px] inline-block font-mono">
                            {formatPrice(cust.dueBalance)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCollectPaymentCust(cust);
                              setCollectAmount(String(cust.dueBalance));
                            }}
                            className="block text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            + Collect Payment
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#008B47] text-[11px] font-bold">
                          Paid in Full
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Link */}
                        <a
                          href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        {/* View Profile & Ledger */}
                        <button
                          type="button"
                          onClick={() => setViewingCustomer(cust)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="View Ledger & Statement"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => setEditingCustomer({ ...cust })}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Collect Due Payment Modal */}
      {collectPaymentCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Collect Due Payment (বকেয়া গ্রহণ)</span>
              </h3>
              <button
                type="button"
                onClick={() => setCollectPaymentCust(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCollectPaymentSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">
                  {collectPaymentCust.name}
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Overdue Balance:</span>
                  <span className="font-black text-rose-600 font-mono text-sm">
                    {formatPrice(collectPaymentCust.dueBalance)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Payment Amount Received (BDT ৳) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={collectPaymentCust.dueBalance}
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-black text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Payment Channel *</label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="CASH">Cash in Hand</option>
                  <option value="BKASH">bKash (Send Money / Merchant)</option>
                  <option value="NAGAD">Nagad</option>
                  <option value="BANK">Bank Deposit / Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Payment Note / Receipt No.</label>
                <input
                  type="text"
                  placeholder="e.g. TrxID or Money Receipt #104"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-between">
                <span>Remaining Due After Payment:</span>
                <span className="font-black text-emerald-800 font-mono text-sm">
                  {formatPrice(
                    Math.max(0, collectPaymentCust.dueBalance - (parseFloat(collectAmount) || 0))
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCollectPaymentCust(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  Confirm Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Customer Profile & Account Ledger */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#008B47]" />
                  <span>Customer Ledger &amp; Profile</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setViewingCustomer(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-slate-900">{viewingCustomer.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#008B47]">
                    {viewingCustomer.status}
                  </span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingCustomer.phone}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingCustomer.address || viewingCustomer.location}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lifetime Purchases</span>
                    <span className="font-black text-slate-900 text-sm">{formatPrice(viewingCustomer.totalSpent)}</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-500 font-bold uppercase block">Outstanding Due</span>
                    <span className="font-black text-rose-700 text-sm">{formatPrice(viewingCustomer.dueBalance || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Account Ledger History */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Customer Ledger &amp; Due Statements ({viewingCustomer.ledger?.length || 0})</span>
                </h4>

                {(!viewingCustomer.ledger || viewingCustomer.ledger.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No ledger transactions recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {viewingCustomer.ledger.map((item) => {
                      const isDue = item.type === "DUE_ADDED";
                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                            isDue ? "bg-rose-50/60 border-rose-100" : "bg-emerald-50/60 border-emerald-100"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              {isDue ? "⚠️ Overdue Added" : "✅ Payment Received"}
                            </div>
                            <span className="text-[10px] text-slate-400 block">{item.date} {item.note ? `• ${item.note}` : ""}</span>
                          </div>
                          <div className={`font-mono font-black text-sm ${isDue ? "text-rose-700" : "text-emerald-700"}`}>
                            {isDue ? `+${formatPrice(item.amount)}` : `-${formatPrice(item.amount)}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingCustomer(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#008B47]" />
                <span>Add New Customer</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 17XXXXXXXX"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">District / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka, Chittagong"
                    value={newCust.location}
                    onChange={(e) => setNewCust({ ...newCust, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Opening Due Balance (৳)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCust.dueBalance}
                    onChange={(e) => setNewCust({ ...newCust, dueBalance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Credit Limit (৳)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={newCust.creditLimit}
                    onChange={(e) => setNewCust({ ...newCust, creditLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, House, Area..."
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Edit Customer Profile</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Due Balance (৳)</label>
                  <input
                    type="number"
                    value={editingCustomer.dueBalance || 0}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, dueBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Address</label>
                <textarea
                  rows={2}
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
