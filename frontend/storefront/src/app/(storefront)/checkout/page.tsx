"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useCustomerStore } from "@/store/useCustomerStore";
import { useCustomerAuthStore } from "@/store/useCustomerAuthStore";
import { formatPrice } from "@/lib/formatters";
import { BANGLADESH_DIVISIONS, SHIPPING_OPTIONS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { generateOrderNumber } from "@/lib/utils";
import { PaymentMethodType } from "@/types";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Phone,
  Banknote,
  Sparkles,
  Tag,
  Copy,
  Smartphone,
  CreditCard,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { CouponInput } from "@/components/cart/CouponInput";
import { PixelEvents } from "@/lib/pixels";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getShippingCost,
    getDiscountAmount,
    getTotal,
    selectedShipping,
    setShippingOption,
    appliedCoupon,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");
  const [orderNotes, setOrderNotes] = useState("");

  // bKash & Nagad Transaction Details
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<{
    codEnabled?: boolean;
    bkashEnabled?: boolean;
    bkashType?: string;
    bkashMerchantNumber?: string;
    nagadEnabled?: boolean;
    nagadType?: string;
    nagadMerchantNumber?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    api.getPaymentSettings().then((res) => {
      if (res.success && res.data) {
        setPaymentSettings(res.data);
        if (!res.data.bkashEnabled && paymentMethod === "bkash") {
          setPaymentMethod("cod");
        }
        if (!res.data.nagadEnabled && paymentMethod === "nagad") {
          setPaymentMethod("cod");
        }
      }
    });
  }, []);

  // Track InitiateCheckout on page load
  useEffect(() => {
    if (items.length > 0) {
      PixelEvents.initiateCheckout(
        items.map((it) => ({ id: it.productId || it.id, title: it.title, price: it.price, quantity: it.quantity })),
        getTotal()
      );
    }
  }, []);

  // Debounced Abandoned Lead Auto-Capture
  useEffect(() => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length >= 10 && items.length > 0) {
      const timer = setTimeout(() => {
        api.recordAbandonedLead({
          customerName: fullName.trim() || "Guest Shopper",
          customerPhone: phone.trim(),
          address: address.trim(),
          district: division,
          cartItems: items,
          total: getTotal(),
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phone, fullName, address, division, items]);

  // Sync shipping option with division selection
  useEffect(() => {
    if (division === "Dhaka") {
      setShippingOption(SHIPPING_OPTIONS[0]); // Inside Dhaka (৳70)
    } else {
      setShippingOption(SHIPPING_OPTIONS[1]); // Outside Dhaka (৳130)
    }
  }, [division, setShippingOption]);

  const handleCopyNumber = (num: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(num);
      setCopiedNumber(num);
      setTimeout(() => setCopiedNumber(null), 2500);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 py-12 text-center text-slate-500">Loading checkout...</div>;
  }

  const subtotal = getSubtotal();
  const shippingCost = getShippingCost();
  const total = getTotal();

  const isCodEnabled = paymentSettings ? paymentSettings.codEnabled !== false : true;
  const isBkashEnabled = paymentSettings ? Boolean(paymentSettings.bkashEnabled) : false;
  const isNagadEnabled = paymentSettings ? Boolean(paymentSettings.nagadEnabled) : false;

  if (isSubmitting) {
    return (
      <div className="min-h-[75vh] bg-slate-50 py-16 flex items-center justify-center animate-in fade-in">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008B47] mx-auto flex items-center justify-center shadow-md animate-pulse">
            <CheckCircle2 className="w-8 h-8 text-[#008B47]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Confirming Your Order...</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
            Securing your items and generating your express delivery confirmation.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center">
          <h1 className="text-2xl font-black text-slate-900">Your cart is empty</h1>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Please add at least one product before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-[#008B47] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim() || !division.trim()) {
      alert("Please fill in all required delivery details.");
      return;
    }

    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && !transactionId.trim()) {
      const confirmContinue = window.confirm(
        `You have not entered a Transaction ID (TrxID) for ${paymentMethod.toUpperCase()}.\n\nWould you like to place the order with payment pending verification?`
      );
      if (!confirmContinue) return;
    }

    setIsSubmitting(true);

    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      items: [...items],
      subtotal,
      shippingCost,
      shippingOption: selectedShipping,
      discount: 0,
      total,
      customer: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        district: division,
        division,
        area: area.trim(),
        address: address.trim(),
        notes: orderNotes.trim(),
      },
      paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod.toUpperCase(),
      paymentStatus: transactionId.trim() ? "PAID" : "PENDING",
      transactionId: transactionId.trim() || null,
      senderPhone: senderPhone.trim() || phone.trim(),
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: division === "Dhaka" ? "1–2 Days" : "2–4 Days",
      status: "CONFIRMED",
    };

    // 1. Sync order to Express Backend & Supabase PostgreSQL
    try {
      await api.createOrder({
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        address: address.trim(),
        district: division,
        area: area.trim(),
        subtotal,
        shippingCost,
        discount: 0,
        total,
        paymentMethod: paymentMethod === "cod" ? "COD" : paymentMethod.toUpperCase(),
        paymentStatus: transactionId.trim() ? "PAID" : "PENDING",
        notes: orderNotes.trim() || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          image: it.image,
        })),
      });
    } catch (err) {
      console.warn("Backend order creation fallback:", err);
    }

    // 2. Sync order to Zustand Local/IndexedDB Store
    try {
      useOrderStore.getState().addOrder({
        id: orderNumber,
        customer: fullName.trim(),
        phone: phone.trim(),
        address: `${address.trim()}${area.trim() ? ", " + area.trim() : ""}, ${division}`,
        district: division,
        total,
        payment: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase(),
        status: "PROCESSING",
        time: "Just now",
        createdAt: new Date().toISOString(),
        courierTracking: null,
        items: items.map((it) => ({
          title: it.title,
          variantName: it.selectedVariant?.name,
          sku: it.selectedVariant?.sku,
          qty: it.quantity,
          price: it.price,
          image: it.image,
        })),
      });

      // Also sync to customer auth account history if logged in
      if (useCustomerAuthStore.getState().isLoggedIn) {
        useCustomerAuthStore.getState().addCustomerOrder({
          id: orderNumber,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          createdAt: new Date().toISOString(),
          total,
          status: "PROCESSING",
          paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase(),
          courierTracking: undefined,
          items: items.map((it) => ({
            title: it.title,
            variantName: it.selectedVariant?.name,
            sku: it.selectedVariant?.sku,
            qty: it.quantity,
            price: it.price,
            image: it.image,
          })),
        });
      }
    } catch (err) {
      console.warn("Failed to add order to store:", err);
    }

    // 3. Update customer store
    try {
      const existingCustomers = useCustomerStore.getState().customers;
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const foundCust = existingCustomers.find(
        (c) =>
          c.phone.replace(/[^0-9]/g, "").includes(cleanPhone) ||
          cleanPhone.includes(c.phone.replace(/[^0-9]/g, ""))
      );

      if (foundCust) {
        useCustomerStore.getState().updateCustomer(foundCust.id, {
          ordersCount: (foundCust.ordersCount || 1) + 1,
          totalSpent: (foundCust.totalSpent || 0) + total,
        });
      } else {
        useCustomerStore.getState().addCustomer({
          id: `cust-${Date.now()}`,
          name: fullName.trim(),
          phone: phone.trim(),
          email: `${phone.trim()}@guest.raifasmart.com`,
          location: `${division}, Bangladesh`,
          address: `${address.trim()}, ${division}`,
          ordersCount: 1,
          totalSpent: total,
          status: "ACTIVE",
          joinedDate: new Date().toISOString().slice(0, 10),
        });
      }
    } catch {}

    // 4. Save to session storage and navigate to order confirmation
    try {
      sessionStorage.setItem("last_completed_order", JSON.stringify(orderData));
    } catch {}

    // 5. Dispatch Purchase Conversion Event for Meta, TikTok & GA4
    PixelEvents.purchase({
      orderNumber,
      total,
      items: items.map((it) => ({
        id: it.productId || it.id,
        productTitle: it.title,
        price: it.price,
        quantity: it.quantity,
      })),
    });

    clearCart();
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    router.push(`/order-success?orderNumber=${orderNumber}`);
  };

  const bkashNumber = paymentSettings?.bkashMerchantNumber || "01712345678";
  const nagadNumber = paymentSettings?.nagadMerchantNumber || "01712345678";

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/cart" className="hover:text-slate-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Shopping Cart</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Fast Checkout</span>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Customer Information & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                <span>Delivery &amp; Customer Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rafiqul Islam"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Phone Number (Active Mobile) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Division */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Division <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-teal-500 cursor-pointer bg-white"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} Division {d === "Dhaka" ? "(Inside Dhaka - ৳70)" : "(Outside Dhaka - ৳130)"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thana / Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Thana / Upazila / Area <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhanmondi, Uttara, Mirpur"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Full Street Address (House, Road, Block) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. House 42, Road 11, Sector 4, Uttara, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Special instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Order Note (Optional Delivery Instructions)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, deliver in afternoon"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Step 2: Shipping Method / Delivery Zone */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black">
                    2
                  </span>
                  <span>Select Shipping Method</span>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  {division === "Dhaka" ? "📍 Inside Dhaka (Dhaka Division)" : `📍 Outside Dhaka (${division} Division)`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SHIPPING_OPTIONS.map((opt) => {
                  const isSelected = selectedShipping.id === opt.id;
                  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setShippingOption(opt);
                        if (opt.id === "inside-dhaka" && division !== "Dhaka") {
                          setDivision("Dhaka");
                        } else if (opt.id === "outside-dhaka" && division === "Dhaka") {
                          setDivision("Chattogram");
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "border-[#008B47] bg-emerald-50/40 ring-2 ring-[#008B47]/10"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? "bg-[#008B47] text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {opt.name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              Estimated Delivery: <strong>{opt.estimatedDays}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-mono font-black text-sm ${
                              isFree ? "text-emerald-700 font-black" : "text-slate-900"
                            }`}
                          >
                            {isFree ? "FREE" : formatPrice(opt.cost)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-[11px]">
                        <span className="text-slate-500 text-[10px]">
                          {opt.id === "inside-dhaka" ? "Within Dhaka Metropolitan" : "All other 7 Divisions"}
                        </span>
                        <span
                          className={`font-bold flex items-center gap-1 ${
                            isSelected ? "text-[#008B47]" : "text-slate-400"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${isSelected ? "border-[#008B47] bg-[#008B47] text-white font-bold" : "border-slate-300"}`}>
                            {isSelected && "✓"}
                          </span>
                          <span>{isSelected ? "Selected" : "Select"}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Method (COD, bKash, Nagad) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black">
                    3
                  </span>
                  <span>Select Payment Method</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  100% Secure Checkout
                </span>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery (COD) */}
                {isCodEnabled && (
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-[#008B47] bg-emerald-50/50 ring-2 ring-[#008B47]/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 text-[#008B47] focus:ring-[#008B47]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#008B47]" />
                        <span className="text-sm font-black text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                          Default &amp; Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        Pay with cash when your parcel is delivered right at your doorstep. No advance payment required.
                      </p>
                    </div>
                  </label>
                )}

                {/* bKash Mobile Banking */}
                {isBkashEnabled && (
                  <div
                    className={`rounded-2xl border-2 transition overflow-hidden ${
                      paymentMethod === "bkash"
                        ? "border-rose-600 bg-rose-50/30 ring-2 ring-rose-600/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={() => setPaymentMethod("bkash")}
                        className="mt-1 text-rose-600 focus:ring-rose-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">bKash Payment</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Send Money / Merchant
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pay total amount ({formatPrice(total)}) to our bKash Account.
                        </p>
                      </div>
                    </label>

                    {/* bKash Payment Instructions & TrxID Input */}
                    {paymentMethod === "bkash" && (
                      <div className="px-5 pb-5 pt-1 space-y-3 border-t border-rose-100 bg-white text-xs animate-in fade-in">
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-rose-900">bKash Account Number:</span>
                            <button
                              type="button"
                              onClick={() => handleCopyNumber(bkashNumber)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 rounded-lg font-mono font-bold text-xs border border-rose-300 transition"
                            >
                              <span>{bkashNumber}</span>
                              {copiedNumber === bkashNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <ol className="list-decimal list-inside text-[11px] text-rose-800 space-y-0.5">
                            <li>Open bKash App $\rightarrow$ Send Money / Payment to <strong>{bkashNumber}</strong></li>
                            <li>Send exact amount: <strong>{formatPrice(total)}</strong></li>
                            <li>Enter your Sender Phone &amp; Transaction ID (TrxID) below:</li>
                          </ol>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 text-xs">Your bKash Number</label>
                            <input
                              type="tel"
                              placeholder="e.g. 017XXXXXXXX"
                              value={senderPhone}
                              onChange={(e) => setSenderPhone(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 text-xs">bKash Transaction ID (TrxID) *</label>
                            <input
                              type="text"
                              placeholder="e.g. 9K38AX729B"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Nagad Mobile Banking */}
                {isNagadEnabled && (
                  <div
                    className={`rounded-2xl border-2 transition overflow-hidden ${
                      paymentMethod === "nagad"
                        ? "border-amber-600 bg-amber-50/30 ring-2 ring-amber-600/10"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={paymentMethod === "nagad"}
                        onChange={() => setPaymentMethod("nagad")}
                        className="mt-1 text-amber-600 focus:ring-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">Nagad Payment</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Send Money / Merchant
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pay total amount ({formatPrice(total)}) to our Nagad Account.
                        </p>
                      </div>
                    </label>

                    {/* Nagad Instructions & TrxID Input */}
                    {paymentMethod === "nagad" && (
                      <div className="px-5 pb-5 pt-1 space-y-3 border-t border-amber-100 bg-white text-xs animate-in fade-in">
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-900">Nagad Account Number:</span>
                            <button
                              type="button"
                              onClick={() => handleCopyNumber(nagadNumber)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 rounded-lg font-mono font-bold text-xs border border-amber-300 transition"
                            >
                              <span>{nagadNumber}</span>
                              {copiedNumber === nagadNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <ol className="list-decimal list-inside text-[11px] text-amber-800 space-y-0.5">
                            <li>Open Nagad App $\rightarrow$ Send Money / Payment to <strong>{nagadNumber}</strong></li>
                            <li>Send exact amount: <strong>{formatPrice(total)}</strong></li>
                            <li>Enter your Sender Phone &amp; Transaction ID (TrxID) below:</li>
                          </ol>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 text-xs">Your Nagad Number</label>
                            <input
                              type="tel"
                              placeholder="e.g. 017XXXXXXXX"
                              value={senderPhone}
                              onChange={(e) => setSenderPhone(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700 text-xs">Nagad Transaction ID (TrxID) *</label>
                            <input
                              type="text"
                              placeholder="e.g. 7M82KL910"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-black text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Items & Total Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 sticky top-24">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Review Your Order ({items.length} items)
              </h2>

              {/* Items Compact Preview with Real-time Quantity Controls */}
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap mt-1.5">
                          {/* Quantity Increase / Decrease Controls */}
                          <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateQuantity(item.id, item.quantity - 1);
                                } else {
                                  removeItem(item.id);
                                }
                              }}
                              className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-l-lg font-bold transition"
                              aria-label="Decrease quantity"
                              title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="w-3 h-3 text-rose-500" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </button>
                            <span className="w-7 text-center font-black text-xs text-slate-900 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 px-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-r-lg font-bold transition"
                              aria-label="Increase quantity"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {item.selectedVariant && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-extrabold text-[10px]">
                              {item.selectedVariant.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-xs text-slate-900 font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatPrice(item.price)} each
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon code */}
              <div className="pt-2">
                <CouponInput />
              </div>

              {/* Cost Summary Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping ({division === "Dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                  <span className="font-mono font-bold text-slate-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-extrabold">FREE</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-{formatPrice(getDiscountAmount())}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-base font-black text-slate-900">
                  <span>Total Due</span>
                  <span className="text-[#008B47] font-mono text-xl">{formatPrice(total)}</span>
                </div>
                <div className="text-[11px] text-slate-400 text-right">
                  Payment: <strong>{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod.toUpperCase()}</strong>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-[#008B47] text-white font-extrabold text-sm shadow-md transition-all duration-200 transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Order — {formatPrice(total)}</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Security</span>
                </span>
                <span>•</span>
                <span>7 Days Easy Return</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
