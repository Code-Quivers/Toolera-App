"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/formatters";

interface TrackedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district?: string;
  area?: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  courierProvider?: string;
  courierTrackingCode?: string;
  courierConsignmentId?: string;
  courierStatus?: string;
  courierBookingDate?: string;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    variantName?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  statusHistory?: Array<{
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

const STEPS = [
  { key: "PENDING", label: "Order Received", desc: "Order details verified" },
  { key: "PROCESSING", label: "Packed & Ready", desc: "Parcel packaged at hub" },
  { key: "SHIPPED", label: "Courier Dispatched", desc: "Handed over to delivery rider" },
  { key: "DELIVERED", label: "Delivered", desc: "Handed over to customer" },
];

export default function TrackOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setError("Please enter your Order Number (e.g. RM-041654-4601) or Phone Number.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await api.publicTrackOrder(query);
      if (res.success && res.data && res.data.length > 0) {
        setOrders(res.data);
      } else {
        setError(res.message || "No orders found matching your search. Please check the Order ID or phone number.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to find order. Please verify your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const getStepIndex = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "DELIVERED") return 3;
    if (s === "SHIPPED") return 2;
    if (s === "PROCESSING" || s === "CONFIRMED") return 1;
    return 0; // PENDING
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-[#008B47] text-xs font-black uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Real-time Parcel Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Enter your <strong>Order Number</strong> (e.g. RM-041654-4601) or <strong>Mobile Number</strong> to view instant parcel dispatch and delivery updates.
          </p>
        </div>

        {/* Search Box Card */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter Order ID (RM-XXXXXX) or Phone Number (017XXXXXXXX)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008B47]/20 focus:border-[#008B47] transition"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-2xl transition shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Track Parcel</span>
            </button>
          </form>

          {/* Quick Examples */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Tip: You can search with your 11-digit mobile number</span>
            <span className="hidden sm:inline">24/7 Express Delivery Bangladesh</span>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Container */}
        {orders && orders.length > 0 && (
          <div className="space-y-8 animate-in fade-in">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.orderStatus);
              const isCancelled = order.orderStatus === "CANCELLED";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden"
                >
                  {/* Top Order Ribbon */}
                  <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Order Number</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{order.orderNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.orderNumber)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Copy Order ID"
                        >
                          {copiedCode === order.orderNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Payable</span>
                        <span className="text-lg font-black text-white">{formatPrice(order.total)}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black rounded-xl">
                        {order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Stepper */}
                  <div className="p-6 sm:p-8 border-b border-slate-100">
                    {isCancelled ? (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center">
                        This order was marked as Cancelled. If you have questions, please call our helpline.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">Delivery Progress</span>
                          <span className="text-xs font-extrabold text-[#008B47] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                            {order.orderStatus === "SHIPPED"
                              ? "Dispatched with Courier"
                              : order.orderStatus === "DELIVERED"
                              ? "Delivered Successfully"
                              : "Processing in Warehouse"}
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="relative">
                          <div className="absolute top-4 left-4 right-4 h-1 bg-slate-100 z-0">
                            <div
                              className="h-full bg-[#008B47] transition-all duration-700"
                              style={{ width: `${(currentStep / 3) * 100}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-4 relative z-10">
                            {STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStep;
                              const isCurrent = idx === currentStep;

                              return (
                                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                                      isCompleted
                                        ? "bg-[#008B47] text-white ring-4 ring-emerald-100"
                                        : "bg-slate-200 text-slate-500"
                                    }`}
                                  >
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                  </div>
                                  <div>
                                    <span className={`text-[11px] font-black block leading-tight ${isCurrent ? "text-slate-900 font-extrabold" : "text-slate-600"}`}>
                                      {step.label}
                                    </span>
                                    <span className="text-[9px] text-slate-400 hidden sm:block mt-0.5">
                                      {step.desc}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Courier Tracking Details Banner (If Shipped) */}
                  {order.courierTrackingCode && (
                    <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-[#008B47] shadow-xs">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 uppercase">
                              {order.courierProvider || "Courier"} Consignment
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-md">
                              {order.courierStatus || "In Transit"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-mono mt-0.5 flex items-center gap-2">
                            <span>Tracking ID: <strong>{order.courierTrackingCode}</strong></span>
                            <button
                              type="button"
                              onClick={() => handleCopy(order.courierTrackingCode!)}
                              className="text-emerald-700 hover:text-emerald-900 transition"
                            >
                              {copiedCode === order.courierTrackingCode ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <a
                        href={
                          order.courierProvider === "PATHAO"
                            ? `https://pathao.com/courier-tracking/?consignment_id=${order.courierTrackingCode}`
                            : `https://steadfast.com.bd/t/${order.courierTrackingCode}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-slate-900 hover:bg-[#008B47] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span>Live Courier Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Order Details & Summary */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Items List */}
                    <div className="space-y-3">
                      <span className="font-black text-slate-900 uppercase text-[11px] tracking-wider block">
                        Ordered Items ({order.items.length})
                      </span>
                      <div className="space-y-2.5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100"
                          >
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 relative overflow-hidden shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.productTitle}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-slate-900 line-clamp-1 text-xs">
                                {item.productTitle}
                              </span>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span>Qty: {item.quantity}</span>
                                {item.variantName && <span>• {item.variantName}</span>}
                              </div>
                            </div>
                            <span className="font-black text-slate-900 text-xs">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination & Summary */}
                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="font-black text-slate-900 uppercase text-[11px] tracking-wider block mb-2">
                          Delivery Address
                        </span>
                        <div className="space-y-1 text-slate-600">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                            <span>{order.address}, {order.district || "Dhaka"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3 space-y-1.5">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal</span>
                          <span className="font-bold text-slate-800">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Delivery Fee</span>
                          <span className="font-bold text-slate-800">{formatPrice(order.shippingCost)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                          <span>Total Amount</span>
                          <span className="text-[#008B47]">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Help Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                    <span>Need help with this delivery? Call our helpline: <strong>01712-345678</strong></span>
                    <Link
                      href="/"
                      className="font-bold text-[#008B47] hover:underline flex items-center gap-1"
                    >
                      <span>Continue Shopping</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
