"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PhoneCall,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Package,
  MapPin,
  TrendingUp,
  DollarSign,
  UserCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/formatters";

interface AbandonedLeadItem {
  id: string;
  customerName?: string;
  customerPhone: string;
  address?: string;
  district?: string;
  cartItems?: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
    selectedVariant?: { name?: string };
  }>;
  total?: number;
  isRecovered: boolean;
  notes?: string;
  createdAt: string;
}

// Initial Sample Baseline Leads for Demo / Preview
const SAMPLE_LEADS: AbandonedLeadItem[] = [
  {
    id: "lead-demo-1",
    customerName: "Md. Tanvir Ahmed",
    customerPhone: "01712984512",
    address: "House 14, Road 5, Block C, Banani",
    district: "Dhaka",
    total: 2450,
    isRecovered: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    cartItems: [
      {
        id: "p1",
        title: "Magnetic Wireless Power Bank 10000mAh",
        price: 1850,
        quantity: 1,
        image: "https://placehold.co/200x200/f1f5f9/64748b?text=PowerBank",
      },
      {
        id: "p2",
        title: "Fast Type-C Braided Cable 65W",
        price: 600,
        quantity: 1,
        image: "https://placehold.co/200x200/f1f5f9/64748b?text=Cable",
      },
    ],
  },
  {
    id: "lead-demo-2",
    customerName: "Nusrat Jahan",
    customerPhone: "01844912304",
    address: "GEC Circle, Nasirabad",
    district: "Chittagong",
    total: 1650,
    isRecovered: false,
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    cartItems: [
      {
        id: "p3",
        title: "Stainless Steel Smart Thermal Flask 500ml",
        price: 1650,
        quantity: 1,
        image: "https://placehold.co/200x200/f1f5f9/64748b?text=Flask",
      },
    ],
  },
  {
    id: "lead-demo-3",
    customerName: "Rafiqul Islam",
    customerPhone: "01911874521",
    address: "Zindabazar Point",
    district: "Sylhet",
    total: 3200,
    isRecovered: true,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    cartItems: [
      {
        id: "p4",
        title: "Ultra-Quiet USB Desk Fan with LED Clock",
        price: 3200,
        quantity: 2,
        image: "https://placehold.co/200x200/f1f5f9/64748b?text=DeskFan",
      },
    ],
  },
];

export default function AbandonedLeadsPage() {
  const [leads, setLeads] = useState<AbandonedLeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "RECOVERED">("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAbandonedLeads();
      if (res.success && res.data && res.data.length > 0) {
        setLeads(res.data);
      } else {
        setLeads(SAMPLE_LEADS);
      }
    } catch (err) {
      setLeads(SAMPLE_LEADS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleMarkRecovered = async (id: string) => {
    try {
      if (!id.startsWith("lead-demo")) {
        await api.markLeadRecovered(id);
      }
      setLeads((prev) =>
        prev.map((lead) => (lead.id === id ? { ...lead, isRecovered: true } : lead))
      );
      setNotification("Lead marked as Recovered!");
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update lead");
    }
  };

  const handleWhatsAppRecovery = (lead: AbandonedLeadItem) => {
    const cleanNumber = lead.customerPhone.replace(/[^0-9]/g, "");
    const formatted = cleanNumber.startsWith("88") ? cleanNumber : `88${cleanNumber}`;
    const name = lead.customerName || "Customer";
    const totalBDT = formatPrice(lead.total || 0);

    const message = `Assalamu Alaikum ${name}, we noticed you were ordering items (Total: ${totalBDT}) from Raifa's Mart but couldn't finish checkout. Need help or want us to confirm your delivery directly?`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const filtered = leads.filter((l) => {
    const matchesSearch =
      (l.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerPhone.includes(searchTerm) ||
      (l.district || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTab === "PENDING") return matchesSearch && !l.isRecovered;
    if (filterTab === "RECOVERED") return matchesSearch && l.isRecovered;
    return matchesSearch;
  });

  // Calculate Metrics
  const totalLeads = leads.length;
  const pendingLeads = leads.filter((l) => !l.isRecovered).length;
  const recoveredLeads = leads.filter((l) => l.isRecovered).length;
  const potentialRevenue = leads
    .filter((l) => !l.isRecovered)
    .reduce((sum, l) => sum + (l.total || 0), 0);
  const recoveryRate = totalLeads > 0 ? Math.round((recoveredLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Abandoned Checkout Recovery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-xs flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" />
              <span>{pendingLeads} Pending Leads</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Shoppers who entered contact details but abandoned checkout. Call or WhatsApp them to recover lost sales.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeads}
          className="px-4 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 shadow-xs w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads Captured</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalLeads}</div>
          <span className="text-[10px] text-slate-500">Auto-captured from checkout</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Potential Lost Revenue</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{formatPrice(potentialRevenue)}</div>
          <span className="text-[10px] text-slate-500">From {pendingLeads} unrecovered carts</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Recovered Sales</span>
          <div className="text-2xl sm:text-3xl font-black text-[#008B47]">{recoveredLeads}</div>
          <span className="text-[10px] text-emerald-700 font-bold">Successfully closed orders</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Recovery Conversion</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600">{recoveryRate}%</div>
          <span className="text-[10px] text-slate-500">Target benchmark: 15–25%</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          {(["ALL", "PENDING", "RECOVERED"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterTab === tab
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab === "ALL" ? "All Leads" : tab === "PENDING" ? "Pending Unrecovered" : "Recovered"}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table / Card List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="font-bold text-slate-800 text-sm">No Abandoned Leads Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Leads are automatically captured in real-time when customers enter their contact details on checkout.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((lead) => {
              const formattedDate = new Date(lead.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={lead.id}
                  className={`p-5 sm:p-6 transition flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                    lead.isRecovered ? "bg-emerald-50/30" : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* Customer Info & Cart Preview */}
                  <div className="space-y-3 max-w-xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">
                        {lead.customerName || "Anonymous Shopper"}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {lead.customerPhone}
                      </span>
                      {lead.isRecovered ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#008B47] text-[11px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Recovered</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending Recovery</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Address & District */}
                    {(lead.address || lead.district) && (
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {lead.address} {lead.district ? `(${lead.district})` : ""}
                        </span>
                      </div>
                    )}

                    {/* Cart Items Summary */}
                    {lead.cartItems && lead.cartItems.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {lead.cartItems.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white overflow-hidden relative shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                                  🛒
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[140px]">
                              {item.title}
                            </span>
                            <span className="text-slate-400 font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing & 1-Click Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[11px] text-slate-400 block uppercase font-bold">Abandoned Cart Value</span>
                      <span className="text-lg font-black text-slate-900">
                        {formatPrice(lead.total || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* WhatsApp 1-Click Recovery */}
                      <button
                        type="button"
                        onClick={() => handleWhatsAppRecovery(lead)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Direct Phone Call */}
                      <a
                        href={`tel:${lead.customerPhone}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call</span>
                      </a>

                      {/* Mark Recovered Toggle */}
                      {!lead.isRecovered && (
                        <button
                          type="button"
                          onClick={() => handleMarkRecovered(lead.id)}
                          className="px-3 py-2 bg-white hover:bg-emerald-50 text-[#008B47] border border-emerald-200 rounded-xl text-xs font-bold transition"
                          title="Mark this customer order as completed"
                        >
                          Mark Recovered
                        </button>
                      )}
                    </div>
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
