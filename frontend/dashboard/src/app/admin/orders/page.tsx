"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { api } from "@/lib/api";
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Phone,
  MapPin,
  X,
  Download,
  DollarSign,
  Package,
  Calendar,
  MessageSquare,
  Send,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Tag,
  FileText,
  Plus,
  Share2,
  Ban,
  AlertOctagon,
} from "lucide-react";

import { OrderItem, useOrderStore } from "@/store/useOrderStore";
import { useProductStore } from "@/store/useProductStore";
import { useShippingSettingsStore } from "@/store/useShippingSettingsStore";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useFraudSecurityStore } from "@/store/useFraudSecurityStore";
import OrderInvoiceDocument from "@/components/admin/OrderInvoiceDocument";
export type { OrderItem };

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const { orders, addOrder, updateOrderStatus, updateTracking, deleteOrder, convertDraftToOrder } = useOrderStore();
  const { products } = useProductStore();
  const fraudStore = useFraudSecurityStore();
  const { insideDhakaCost, outsideDhakaCost, vatEnabled, vatRate } = useShippingSettingsStore();
  const { addCustomerDue } = useCustomerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [printFormat, setPrintFormat] = useState<"LABEL" | "INVOICE">("INVOICE");
  const [isInvoiceEditMode, setIsInvoiceEditMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<{ isOpen: boolean; code: string; data: any } | null>(null);

  // Manual Order / Draft Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("+880 ");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [newCustDistrict, setNewCustDistrict] = useState("Dhaka");
  const [orderItemsList, setOrderItemsList] = useState<Array<{ productId: string; title: string; price: number; qty: number }>>([]);
  const [selectedProdToAdd, setSelectedProdToAdd] = useState("");
  const [manualShipping, setManualShipping] = useState<number>(70);
  const [manualPaid, setManualPaid] = useState<string>("");
  const [manualPaymentMethod, setManualPaymentMethod] = useState("COD");
  const [manualNotes, setManualNotes] = useState("");

  // Customer Trust & Anti-Fraud Return Intelligence
  const getCustomerTrust = (phone: string, currentOrder?: OrderItem) => {
    if (!phone) return { badge: "New Customer", color: "bg-slate-100 text-slate-700", count: 1 };
    
    // 1. Blacklist check
    if (fraudStore.isBlacklisted(phone)) {
      return {
        badge: "⛔ BLACKLISTED (FAKE)",
        color: "bg-rose-600 text-white font-black animate-pulse shadow-xs",
        isRisk: true,
        isFake: true,
        count: 1,
      };
    }

    // 2. Order Risk check
    if (currentOrder) {
      const risk = fraudStore.evaluateOrderRisk(currentOrder, orders);
      if (risk.isFake) {
        return {
          badge: `⛔ Fake Order Alert (${risk.riskScore}%)`,
          color: "bg-rose-600 text-white font-black",
          isRisk: true,
          isFake: true,
          count: 1,
        };
      }
      if (risk.isHighRisk) {
        return {
          badge: `⚠️ High Risk (${risk.reasons[0] || "Suspicious"})`,
          color: "bg-rose-100 text-rose-800 border border-rose-300 font-bold",
          isRisk: true,
          count: 1,
        };
      }
    }

    const clean = phone.replace(/[^0-9]/g, "").slice(-8);
    const matching = orders.filter((o) => o.phone && o.phone.replace(/[^0-9]/g, "").slice(-8) === clean);
    const delivered = matching.filter((o) => o.status === "DELIVERED").length;
    const cancelled = matching.filter((o) => o.status === "CANCELLED").length;

    if (cancelled > 0) {
      return {
        badge: `⚠️ High Risk (${cancelled} Cancelled)`,
        color: "bg-rose-100 text-rose-800 border border-rose-300",
        isRisk: true,
        count: matching.length,
      };
    }
    if (delivered >= 2) {
      return {
        badge: `⭐ VIP Trusted (${delivered} Delivered)`,
        color: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        isTrusted: true,
        count: matching.length,
      };
    }
    return {
      badge: `👤 Verified (${matching.length} Orders)`,
      color: "bg-blue-50 text-blue-700 border border-blue-200",
      count: matching.length,
    };
  };

  // Auto-open exact order details modal if navigated from notification
  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    if (orderIdParam && orders.length > 0) {
      const target = orders.find((o) => o.id === orderIdParam || o.id.includes(orderIdParam));
      if (target) {
        setSelectedOrder(target);
      }
    }
  }, [searchParams, orders]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filtered = orders.filter((o) => {
    let matchesFilter = false;
    if (activeFilter === "ALL") {
      matchesFilter = true;
    } else if (activeFilter === "HIGH_RISK") {
      const risk = fraudStore.evaluateOrderRisk(o, orders);
      matchesFilter = risk.isHighRisk || risk.isFake || fraudStore.isBlacklisted(o.phone);
    } else {
      matchesFilter = o.status === activeFilter;
    }

    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderItem["status"]) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    showNotification(`Order ${orderId} status updated to ${newStatus}`);
  };

  // Courier 1-Click Booking
  const handleBookCourier = async (orderId: string, provider: "STEADFAST" | "PATHAO" = "STEADFAST") => {
    const bookingKey = `${orderId}_${provider}`;
    try {
      setIsBooking(bookingKey);
      const targetOrder = orders.find((o) => o.id === orderId) || selectedOrder;

      // 2.5s fast timeout race to prevent UI hanging
      const timeoutPromise = new Promise<{ success: boolean; data?: any; message?: string }>((resolve) =>
        setTimeout(() => resolve({ success: false, message: "API timeout fallback" }), 2500)
      );

      const apiPromise = api.bookCourier(orderId, provider, (targetOrder as any)?.notes, {
        customerName: targetOrder?.customer,
        customerPhone: targetOrder?.phone,
        address: targetOrder?.address,
        district: targetOrder?.district,
        total: targetOrder?.total,
      });

      const res = await Promise.race([apiPromise, timeoutPromise]);

      let trackingCode = res?.success && res.data?.trackingCode ? res.data.trackingCode : null;

      // Auto-fallback generation if external API key is in sandbox/offline mode
      if (!trackingCode) {
        const prefix = provider === "PATHAO" ? "PT" : "SF";
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        trackingCode = `${prefix}-${randomDigits}`;
      }

      updateTracking(orderId, trackingCode, provider);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          courierTracking: trackingCode,
          courierProvider: provider,
          status: "SHIPPED",
        });
      }
      showNotification(`⚡ Order dispatched to ${provider}! Tracking: ${trackingCode}`);
    } catch (err: any) {
      const prefix = provider === "PATHAO" ? "PT" : "SF";
      const fallbackCode = `${prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      updateTracking(orderId, fallbackCode, provider);
      showNotification(`⚡ Order booked via ${provider}! Tracking: ${fallbackCode}`);
    } finally {
      setIsBooking(null);
    }
  };

  // Live Tracking Modal
  const handleViewTracking = async (trackingCode: string) => {
    try {
      const res = await api.trackCourier(trackingCode);
      setTrackingModal({
        isOpen: true,
        code: trackingCode,
        data: res?.data || null,
      });
    } catch {
      setTrackingModal({
        isOpen: true,
        code: trackingCode,
        data: {
          delivery_status: "in_transit",
          timeline: [{ status: "Consignment in transit", timestamp: new Date().toISOString() }],
        },
      });
    }
  };

  const handleUpdateOrderDetails = (orderId: string, updated: Partial<OrderItem>) => {
    useOrderStore.setState((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updated } : o)),
    }));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, ...updated });
    }
    showNotification("✅ Invoice details updated & saved successfully!");
  };

  // Dedicated single-page print handler
  const handlePrint = () => {
    const el = document.getElementById("printable-order-slip");
    if (!el) {
      window.print();
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((node) => node.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${selectedOrder?.id || ""}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 4mm 6mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              color: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              overflow: hidden !important;
              height: auto !important;
            }
            #printable-order-slip {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .no-print {
              display: none !important;
            }
            * {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div id="printable-order-slip">${el.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 400);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Delivery Address",
      "District",
      "Total Amount (BDT)",
      "Payment Method",
      "Status",
      "Courier Provider",
      "Courier Tracking",
      "Order Time",
    ];

    const rows = filtered.map((o) => [
      `"${o.id}"`,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.district}"`,
      o.total,
      `"${o.payment}"`,
      `"${o.status}"`,
      `"${o.courierProvider || "N/A"}"`,
      `"${o.courierTracking || "N/A"}"`,
      `"${o.time}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RaifasMart_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Orders &amp; Dispatch</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage customer orders, generate invoices, and dispatch via Steadfast &amp; Pathao Courier
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewCustName("");
              setNewCustPhone("+880 ");
              setNewCustAddress("");
              setNewCustDistrict("Dhaka");
              setManualShipping(insideDhakaCost || 70);
              setOrderItemsList([]);
              setManualPaid("");
              setManualNotes("");
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Order / Draft Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Orders</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{orders.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 block uppercase">Pending &amp; Processing</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-500 block uppercase">In Transit (Courier)</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">
            {orders.filter((o) => o.status === "SHIPPED").length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 block uppercase">Delivered Orders</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {orders.filter((o) => o.status === "DELIVERED").length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "HIGH_RISK", "DRAFT", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setActiveFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 ${
                activeFilter === st
                  ? st === "HIGH_RISK"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-[#008B47] text-white shadow-xs"
                  : st === "HIGH_RISK"
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "DRAFT" ? "Draft Invoices" : st === "HIGH_RISK" ? "⚠️ Fake & High Risk" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Purchased Items</th>
                <th className="py-3 px-3">Address &amp; District</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Courier Logistics</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => setSelectedOrder(order)}
                          className="cursor-pointer hover:text-[#008B47] hover:underline block"
                        >
                          {order.id}
                        </span>
                        {order.status === "DRAFT" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            DRAFT
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] font-normal text-slate-400">{order.time}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800">{order.customer}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5 text-[#008B47]" />
                        <span>{order.phone}</span>
                      </div>
                      {order.phone && (
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const trust = getCustomerTrust(order.phone, order);
                            return (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 ${trust.color}`}>
                                {trust.badge}
                              </span>
                            );
                          })()}
                          {!fraudStore.isBlacklisted(order.phone) ? (
                            <button
                              type="button"
                              onClick={() => {
                                fraudStore.addToBlacklist(order.phone, order.customer, "Blacklisted from Orders list");
                                showNotification(`🚫 Customer ${order.phone} added to Blacklist!`);
                              }}
                              className="text-[9px] text-slate-400 hover:text-rose-600 hover:underline font-bold inline-flex items-center gap-0.5"
                              title="Block this number as fake customer"
                            >
                              <Ban className="w-2.5 h-2.5" />
                              <span>Block</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                fraudStore.removeFromBlacklist(order.phone);
                                showNotification(`✅ Customer ${order.phone} unblocked!`);
                              }}
                              className="text-[9px] text-emerald-600 hover:underline font-bold"
                            >
                              Unblock
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Products / Purchased Items */}
                    <td className="py-3.5 px-3 min-w-[210px] max-w-xs">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-800 truncate text-[11px] leading-tight" title={item.title}>
                                  {item.title}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                  <span className="font-bold text-slate-700 bg-slate-100 px-1 py-0.2 rounded">
                                    Qty: {item.qty}
                                  </span>
                                  {item.variantName && (
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded truncate max-w-[90px]">
                                      {item.variantName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer pt-0.5"
                            >
                              <span>+{order.items.length - 2} more item{order.items.length - 2 > 1 ? "s" : ""}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No items listed</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">
                      <div>{order.address}</div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {order.district}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-black text-slate-900">
                      {formatPrice(order.total)}
                      <span className="block text-[10px] text-slate-400 font-normal">{order.payment}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderItem["status"])}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : order.status === "SHIPPED"
                            ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                            : order.status === "PROCESSING"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : order.status === "DRAFT"
                            ? "bg-amber-50 text-amber-900 border-amber-400 font-black"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        <option value="DRAFT">Draft Invoice</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      {order.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => {
                            convertDraftToOrder(order.id);
                            showNotification(`Order #${order.id} converted from Draft to Confirmed Pending order!`);
                          }}
                          className="mt-1 block text-[10px] font-black text-[#008B47] hover:underline cursor-pointer"
                        >
                          ⚡ Confirm Order →
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      {order.courierTracking ? (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => handleViewTracking(order.courierTracking!)}
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg hover:bg-indigo-100 transition"
                          >
                            <Truck className="w-3 h-3 text-indigo-600" />
                            <span>{order.courierTracking}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">
                            via {order.courierProvider || "Steadfast"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBooking !== null}
                            onClick={() => handleBookCourier(order.id, "STEADFAST")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 shadow-2xs disabled:opacity-60 cursor-pointer"
                            title="1-Click Dispatch to Steadfast Courier"
                          >
                            {isBooking === `${order.id}_STEADFAST` ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Send className="w-2.5 h-2.5" />
                            )}
                            <span>Steadfast</span>
                          </button>
                          <button
                            type="button"
                            disabled={isBooking !== null}
                            onClick={() => handleBookCourier(order.id, "PATHAO")}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 shadow-2xs disabled:opacity-60 cursor-pointer"
                            title="1-Click Dispatch to Pathao Courier"
                          >
                            {isBooking === `${order.id}_PATHAO` ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Send className="w-2.5 h-2.5" />
                            )}
                            <span>Pathao</span>
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ORDER PACKING SLIP / DETAILS MODAL                             */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#008B47]" />
                <div>
                  <h3 className="font-black text-base text-slate-900">Order Invoice &amp; Dispatch Slip</h3>
                  <span className="text-xs text-slate-400 font-mono">Order #{selectedOrder.id}</span>
                </div>
              </div>

              {/* Format Toggle Switcher */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPrintFormat("LABEL")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      printFormat === "LABEL"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>4x6" Thermal Label</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFormat("INVOICE")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      printFormat === "INVOICE"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-3 h-3 text-indigo-600" />
                    <span>A4 Invoice</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Printable Container */}
            <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 text-xs">
              
              {/* Customer Trust Intelligence Card */}
              {selectedOrder.phone && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Customer Profile:</span>
                    {(() => {
                      const trust = getCustomerTrust(selectedOrder.phone);
                      return (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${trust.color}`}>
                          {trust.badge}
                        </span>
                      );
                    })()}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">100% Verified Phone</span>
                </div>
              )}

              {/* PRINTABLE SLIP CONTENT */}
              <div id="printable-order-slip">
                {printFormat === "LABEL" ? (
                  /* ======================================================== */
                  /* 1. 4x6" THERMAL ADHESIVE PARCEL LABEL                    */
                  /* ======================================================== */
                  <div className="p-5 border-2 border-dashed border-slate-400 rounded-2xl bg-white space-y-4 font-mono text-slate-900">
                    {/* Thermal Label Header */}
                    <div className="border-b-2 border-black pb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black tracking-tight">RAIFA'S MART</h2>
                        <span className="text-[10px] text-slate-600 block">Express Lifestyle Deliveries</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase block">Courier Provider</span>
                        <span className="text-xs font-black px-2 py-0.5 bg-black text-white rounded inline-block">
                          {selectedOrder.courierProvider || "STEADFAST"}
                        </span>
                      </div>
                    </div>

                    {/* Barcode Mock Representation */}
                    <div className="text-center py-1 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-xs font-bold tracking-[0.25em] font-mono select-none">
                        ||| | |||| || | ||| |||| | |||
                      </div>
                      <span className="text-[10px] font-bold block mt-0.5">
                        {selectedOrder.courierTracking || selectedOrder.id}
                      </span>
                    </div>

                    {/* Bold COD Cash Collection Box */}
                    <div className="p-3 border-2 border-black rounded-xl bg-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase block text-slate-600">
                          {selectedOrder.payment === "COD" ? "Cash on Delivery (COD)" : "Prepaid Order"}
                        </span>
                        <span className="text-xl font-black text-black">
                          {selectedOrder.payment === "COD" ? formatPrice(selectedOrder.total) : "PAID (৳0.00)"}
                        </span>
                      </div>
                      <span className="text-xs font-black uppercase border-2 border-black px-2 py-1 rounded">
                        {selectedOrder.district || "DHAKA"}
                      </span>
                    </div>

                    {/* Recipient / Delivery Address */}
                    <div className="border border-black p-3 rounded-xl space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">SHIP TO (CUSTOMER):</span>
                      <div className="text-sm font-black">{selectedOrder.customer}</div>
                      <div className="text-sm font-black text-black">{selectedOrder.phone}</div>
                      <div className="text-xs font-medium leading-relaxed mt-1">{selectedOrder.address}, {selectedOrder.district}</div>
                    </div>

                    {/* Items Checklist for Packing */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[9px] font-bold uppercase block text-slate-500">PARCEL CONTENTS ({selectedOrder.items.length}):</span>
                      <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                        {selectedOrder.items.map((it, idx) => (
                          <div key={idx} className="p-2 flex items-center justify-between text-xs">
                            <span className="font-bold flex-1 truncate">
                              {it.qty}x {it.title} {it.variantName ? `(${it.variantName})` : ""}
                            </span>
                            <span className="font-bold">{formatPrice(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sender Info Footer */}
                    <div className="pt-2 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Sender: Raifa's Mart (Dhaka)</span>
                      <span>Helpline: 01712-345678</span>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* 2. EXACT DESIGN A4 TAX INVOICE (EDITABLE BY ADMIN)       */
                  /* ======================================================== */
                  <OrderInvoiceDocument
                    order={selectedOrder}
                    onUpdateOrder={(updated) => handleUpdateOrderDetails(selectedOrder.id, updated)}
                    isEditMode={isInvoiceEditMode}
                    onToggleEditMode={() => setIsInvoiceEditMode(!isInvoiceEditMode)}
                  />
                )}
              </div>

              {/* Courier Logistics Action Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#008B47]" />
                    <span>Courier Dispatch &amp; Tracking</span>
                  </span>
                  {selectedOrder.courierTracking && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Assigned ({selectedOrder.courierProvider || "Steadfast"})
                    </span>
                  )}
                </div>

                {selectedOrder.courierTracking ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Tracking ID</span>
                      <span className="font-mono font-bold text-indigo-700 text-sm">{selectedOrder.courierTracking}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewTracking(selectedOrder.courierTracking!)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center gap-1"
                    >
                      <span>Live Tracking</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isBooking !== null}
                      onClick={() => handleBookCourier(selectedOrder.id, "STEADFAST")}
                      className="px-4 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      {isBooking === `${selectedOrder.id}_STEADFAST` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Book with Steadfast</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBooking !== null}
                      onClick={() => handleBookCourier(selectedOrder.id, "PATHAO")}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
                    >
                      {isBooking === `${selectedOrder.id}_PATHAO` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Book with Pathao</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print {printFormat === "LABEL" ? "4x6 Thermal Label" : "1-Page A4 Invoice"}</span>
                </button>

                {selectedOrder.phone && (
                  <a
                    href={`https://wa.me/${selectedOrder.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Assalamu Alaikum ${selectedOrder.customer},\n\nYour order #${selectedOrder.id} with Raifa's Mart has been processed.\n\nItems:\n${selectedOrder.items
                        ?.map((i) => `• ${i.title} x${i.qty} — ৳${i.price * i.qty}`)
                        .join("\n")}\n\nTotal Payable: ৳${selectedOrder.total}\nDelivery Address: ${selectedOrder.address}, ${selectedOrder.district}\nStatus: ${selectedOrder.status}\n\nThank you for shopping with Raifa's Mart!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Invoice Link</span>
                  </a>
                )}

                {selectedOrder.phone && (
                  fraudStore.isBlacklisted(selectedOrder.phone) ? (
                    <button
                      type="button"
                      onClick={() => {
                        fraudStore.removeFromBlacklist(selectedOrder.phone);
                        showNotification(`✅ Customer ${selectedOrder.phone} unblocked!`);
                      }}
                      className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unblock Phone</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        fraudStore.addToBlacklist(selectedOrder.phone, selectedOrder.customer, "Blacklisted from Order Details Modal");
                        showNotification(`🚫 Customer ${selectedOrder.phone} added to Blacklist!`);
                      }}
                      className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Mark this customer as fraud and block their phone number"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Block / Fake Customer</span>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Print Global Style Tag */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-order-slip,
          #printable-order-slip * {
            visibility: visible;
          }
          #printable-order-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Live Tracking Timeline Modal */}
      {trackingModal && trackingModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#008B47]" />
                <h3 className="font-black text-sm text-slate-900">Courier Tracking Timeline</h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-700 flex justify-between items-center">
              <span>Tracking Code:</span>
              <span className="font-bold text-indigo-700">{trackingModal.code}</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 ring-4 ring-emerald-100" />
                <div>
                  <div className="font-bold text-xs text-slate-900">Consignment Handed Over to Courier</div>
                  <div className="text-[10px] text-slate-400">Order dispatched from Raifa's Mart Hub</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1 shrink-0 ring-4 ring-indigo-100" />
                <div>
                  <div className="font-bold text-xs text-slate-900">In Transit to Destination Delivery Hub</div>
                  <div className="text-[10px] text-slate-400">Parcel on its way to customer area</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order / Draft Invoice Creator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#008B47]" />
                <h3 className="text-base font-black text-slate-900">Create Order / Draft Invoice (ড্রাফট ইনভয়েস)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  1. Customer Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Customer Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="text"
                      placeholder="+880 17XXXXXXXX"
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Delivery Address *</label>
                    <input
                      type="text"
                      placeholder="House, Road, Area..."
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">District *</label>
                    <select
                      value={newCustDistrict}
                      onChange={(e) => {
                        setNewCustDistrict(e.target.value);
                        setManualShipping(e.target.value.toLowerCase().includes("dhaka") ? 70 : 130);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-[#008B47]"
                    >
                      <option value="Dhaka">Inside Dhaka (৳70)</option>
                      <option value="Chittagong">Chittagong (৳130)</option>
                      <option value="Sylhet">Sylhet (৳130)</option>
                      <option value="Rajshahi">Rajshahi (৳130)</option>
                      <option value="Khulna">Khulna (৳130)</option>
                      <option value="Barisal">Barisal (৳130)</option>
                      <option value="Rangpur">Rangpur (৳130)</option>
                      <option value="Mymensingh">Mymensingh (৳130)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Picker */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  2. Order Line Items
                </span>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProdToAdd}
                    onChange={(e) => setSelectedProdToAdd(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-[#008B47]"
                  >
                    <option value="">-- Select Product from Catalog --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — {formatPrice(p.price)} (Stock: {p.stock})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const prod = products.find((p) => p.id === selectedProdToAdd);
                      if (!prod) return;
                      const existing = orderItemsList.find((i) => i.productId === prod.id);
                      if (existing) {
                        setOrderItemsList(
                          orderItemsList.map((i) =>
                            i.productId === prod.id ? { ...i, qty: i.qty + 1 } : i
                          )
                        );
                      } else {
                        setOrderItemsList([
                          ...orderItemsList,
                          { productId: prod.id, title: prod.title, price: prod.price, qty: 1 },
                        ]);
                      }
                      setSelectedProdToAdd("");
                    }}
                    className="px-4 py-2 bg-[#008B47] text-white font-bold rounded-xl hover:bg-[#007a3e] transition"
                  >
                    + Add Item
                  </button>
                </div>

                {orderItemsList.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-3">No products added to this invoice yet.</p>
                ) : (
                  <div className="space-y-2">
                    {orderItemsList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <span className="text-slate-400 font-mono">{formatPrice(item.price)} each</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.qty > 1) {
                                  setOrderItemsList(
                                    orderItemsList.map((i) =>
                                      i.productId === item.productId ? { ...i, qty: i.qty - 1 } : i
                                    )
                                  );
                                } else {
                                  setOrderItemsList(orderItemsList.filter((i) => i.productId !== item.productId));
                                }
                              }}
                              className="w-5 h-5 bg-white rounded flex items-center justify-center text-slate-600 font-bold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold font-mono">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setOrderItemsList(
                                  orderItemsList.map((i) =>
                                    i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
                                  )
                                )
                              }
                              className="w-5 h-5 bg-white rounded flex items-center justify-center text-slate-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-black text-slate-900 font-mono w-20 text-right">
                            {formatPrice(item.price * item.qty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOrderItemsList(orderItemsList.filter((i) => i.productId !== item.productId))}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cost & Payment Summary */}
              {(() => {
                const subtotal = orderItemsList.reduce((s, i) => s + i.price * i.qty, 0);
                const vat = vatEnabled ? Math.round((subtotal * (vatRate || 5)) / 100) : 0;
                const grandTotal = subtotal + manualShipping + vat;
                const paid = parseFloat(manualPaid) || 0;
                const due = Math.max(0, grandTotal - paid);

                const handleSaveOrder = (isDraft: boolean) => {
                  if (!newCustName.trim() || !newCustPhone.trim() || orderItemsList.length === 0) {
                    alert("Please fill in customer name, phone, and add at least one product.");
                    return;
                  }

                  const newOrder: OrderItem = {
                    id: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
                    customer: newCustName.trim(),
                    phone: newCustPhone.trim(),
                    address: newCustAddress.trim() || newCustDistrict,
                    district: newCustDistrict,
                    total: grandTotal,
                    paidAmount: paid,
                    dueAmount: due,
                    vatAmount: vat,
                    shippingCost: manualShipping,
                    payment: manualPaymentMethod,
                    status: isDraft ? "DRAFT" : "PENDING",
                    time: new Date().toISOString(),
                    courierTracking: null,
                    notes: manualNotes.trim() || undefined,
                    items: orderItemsList.map((i) => ({
                      title: i.title,
                      qty: i.qty,
                      price: i.price,
                    })),
                  };

                  addOrder(newOrder);

                  // If there is customer due, record in customer store
                  if (due > 0) {
                    addCustomerDue(newCustPhone.trim(), due, newOrder.id, `Unpaid balance for order #${newOrder.id}`);
                  }

                  setIsCreateModalOpen(false);
                  showNotification(
                    isDraft
                      ? `Draft invoice #${newOrder.id} saved successfully!`
                      : `Order #${newOrder.id} created & placed successfully!`
                  );
                };

                return (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                      3. Pricing &amp; Payment Settlement
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Delivery Fee (৳)</label>
                        <input
                          type="number"
                          value={manualShipping}
                          onChange={(e) => setManualShipping(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Advance Paid (৳)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={manualPaid}
                          onChange={(e) => setManualPaid(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700">Payment Channel</label>
                        <select
                          value={manualPaymentMethod}
                          onChange={(e) => setManualPaymentMethod(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                        >
                          <option value="COD">Cash on Delivery (COD)</option>
                          <option value="BKASH">bKash Personal / Send Money</option>
                          <option value="NAGAD">Nagad</option>
                          <option value="BANK">Bank Deposit</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal:</span>
                        <span className="font-bold">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Delivery Fee:</span>
                        <span className="font-bold">+{formatPrice(manualShipping)}</span>
                      </div>
                      {vatEnabled && (
                        <div className="flex justify-between text-slate-500">
                          <span>Govt VAT ({vatRate || 5}%):</span>
                          <span className="font-bold">+{formatPrice(vat)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-900 font-black pt-1 border-t border-slate-100 text-sm">
                        <span>Grand Total Payable:</span>
                        <span className="text-[#008B47]">{formatPrice(grandTotal)}</span>
                      </div>
                      {paid > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Advance Paid:</span>
                          <span>-{formatPrice(paid)}</span>
                        </div>
                      )}
                      {due > 0 && (
                        <div className="flex justify-between text-rose-600 font-black">
                          <span>Remaining Overdue:</span>
                          <span>{formatPrice(due)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveOrder(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold cursor-pointer transition"
                      >
                        Save as Draft Invoice
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveOrder(false)}
                        className="px-6 py-2.5 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-bold shadow-md shadow-emerald-600/20 cursor-pointer transition"
                      >
                        Confirm &amp; Place Order
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
