"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Heart,
  Edit3,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Sparkles,
} from "lucide-react";
import { OrderItem } from "@/store/useOrderStore";
import { formatPrice } from "@/lib/formatters";
import { useInvoiceSettingsStore, InvoiceSettings } from "@/store/useInvoiceSettingsStore";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";

interface InvoiceProps {
  order: OrderItem;
  onUpdateOrder?: (updated: Partial<OrderItem>) => void;
  isEditMode?: boolean;
  onToggleEditMode?: () => void;
  overrideSettings?: Partial<InvoiceSettings>; // For live preview in customizer
}

export default function OrderInvoiceDocument({
  order,
  onUpdateOrder,
  isEditMode = false,
  onToggleEditMode,
  overrideSettings,
}: InvoiceProps) {
  // Global invoice settings from store (or overrides from customizer preview)
  const storeSettings = useInvoiceSettingsStore();
  const settings = { ...storeSettings, ...overrideSettings };

  // Local state for editable order details
  const [invoiceId, setInvoiceId] = useState(order.id);
  const [invoiceDate, setInvoiceDate] = useState(
    order.time
      ? new Date(order.time).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "18 May 2025"
  );
  const [invoiceTime, setInvoiceTime] = useState("Just now");

  // Editable Order / Customer Info
  const [custName, setCustName] = useState(order.customer || "");
  const [custPhone, setCustPhone] = useState(order.phone || "");
  const [custAddress, setCustAddress] = useState(order.address || "");
  const [custDistrict, setCustDistrict] = useState(order.district || "");
  const [paymentMethod, setPaymentMethod] = useState(order.payment || "Cash on Delivery");
  const [deliveryStatus, setDeliveryStatus] = useState<OrderItem["status"]>(
    order.status || "PROCESSING"
  );

  // Items
  const [items, setItems] = useState(
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            title: "Mini Glass Battery-Operated Candle Light",
            qty: 1,
            price: 130,
            image:
              "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80",
          },
        ]
  );

  // Financials
  const [deliveryCharge, setDeliveryCharge] = useState<number>(order.shippingCost ?? 130);
  const [vatRate, setVatRate] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Synchronize when order changes
  useEffect(() => {
    setInvoiceId(order.id);
    setCustName(order.customer);
    setCustPhone(order.phone);
    setCustAddress(order.address);
    setCustDistrict(order.district);
    setPaymentMethod(order.payment);
    setDeliveryStatus(order.status);
    if (order.items && order.items.length > 0) {
      setItems(order.items);
    }
    if (typeof order.shippingCost === "number") {
      setDeliveryCharge(order.shippingCost);
    }
  }, [order]);

  // Calculations
  const itemsSubtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
  const calculatedVat = Math.round((itemsSubtotal * vatRate) / 100);
  const totalPayable = itemsSubtotal + deliveryCharge + calculatedVat - discountAmount;

  // Save changes to order
  const handleSaveToOrder = () => {
    if (onUpdateOrder) {
      onUpdateOrder({
        id: invoiceId,
        customer: custName,
        phone: custPhone,
        address: custAddress,
        district: custDistrict,
        payment: paymentMethod,
        status: deliveryStatus,
        shippingCost: deliveryCharge,
        vatAmount: calculatedVat,
        total: totalPayable,
        items: items.map((it) => ({
          title: it.title,
          qty: it.qty,
          price: it.price,
          image: it.image,
        })),
      });
    }
    if (onToggleEditMode) {
      onToggleEditMode();
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        title: "New Product Item",
        qty: 1,
        price: 150,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // Robust 1-page print function
  const handlePrintSinglePage = () => {
    const el = document.getElementById("printable-order-slip");
    if (!el) return;

    // Create a temporary hidden print iframe to isolate styles and prevent 2nd-page spillover
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "fixed";
    printFrame.style.right = "0";
    printFrame.style.bottom = "0";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    // Collect all head stylesheets
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((node) => node.outerHTML)
      .join("\n");

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoiceId}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              color: #0f172a !important;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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
        document.body.removeChild(printFrame);
      }, 1000);
    }, 400);
  };

  const accent = settings.accentColor || "#005A2B";
  const isClassic = settings.templateId === "CLASSIC";
  const isMinimal = settings.templateId === "MODERN_MINIMAL";

  return (
    <div className="w-full space-y-4">
      {/* Top Action Bar for Live Editing & 1-Page Print Action */}
      {onToggleEditMode && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">
              {isEditMode ? "✏️ Edit Invoice Mode" : "👁️ Template: " + settings.templateId}
            </span>
            <span className="text-slate-500 hidden sm:inline">
              {isEditMode
                ? "Modify order details or add items, then click Save."
                : "Dynamic branding synced with Invoice Settings."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSinglePage}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Prints strictly 1 clean A4 page"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print 1-Page A4</span>
            </button>

            {isEditMode ? (
              <button
                type="button"
                onClick={handleSaveToOrder}
                className="px-3.5 py-1.5 bg-[#005A2B] hover:bg-[#004D25] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onToggleEditMode}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Edit Details</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* EXACT DESIGN INVOICE CONTAINER (Printable & Screen View)       */}
      {/* ============================================================== */}
      <div
        id="printable-order-slip"
        className={`w-full max-w-3xl mx-auto bg-white rounded-3xl overflow-hidden text-slate-800 font-sans shadow-md border border-slate-200/90 print:shadow-none print:border-none print:m-0 print:p-0 print:rounded-none`}
      >
        <div className="p-6 sm:p-7 space-y-4 print:p-4 print:space-y-3">
          {/* ==================== 1. TOP HEADER ==================== */}
          <div className="flex items-start justify-between gap-4">
            {/* Store Brand / Logo according to logoDisplayMode */}
            <div className="flex items-center gap-3">
              {settings.logoDisplayMode === "LOGO_ONLY" ? (
                /* 1. Logo Only Mode */
                <div className="flex items-center">
                  {settings.companyLogo ? (
                    <img
                      src={settings.companyLogo}
                      alt={settings.companyName}
                      style={{ maxHeight: `${settings.logoHeight || 48}px` }}
                      className="object-contain max-w-[220px]"
                    />
                  ) : (
                    <div
                      className="h-12 px-4 rounded-xl flex items-center gap-2 border"
                      style={{
                        backgroundColor: `${accent}10`,
                        borderColor: `${accent}30`,
                      }}
                    >
                      <ShoppingBag className="w-5 h-5" style={{ color: accent }} />
                      <span className="font-bold text-xs" style={{ color: accent }}>
                        {settings.companyName}
                      </span>
                    </div>
                  )}
                </div>
              ) : settings.logoDisplayMode === "TEXT_ONLY" ? (
                /* 2. Text Only Mode */
                <div>
                  <h1
                    className="font-black text-2xl tracking-tight leading-tight"
                    style={{ color: isClassic ? "#0f172a" : accent }}
                  >
                    {settings.companyName}
                  </h1>
                  <p className="text-xs text-slate-400 italic tracking-wide mt-0.5">
                    {settings.companyTagline}
                  </p>
                </div>
              ) : (
                /* 3. Logo & Text Mode (Default) */
                <>
                  {settings.showLogo && (
                    <div
                      className="rounded-2xl flex items-center justify-center shrink-0 p-2 shadow-2xs border overflow-hidden"
                      style={{
                        width: `${Math.max(40, settings.logoHeight || 48)}px`,
                        height: `${Math.max(40, settings.logoHeight || 48)}px`,
                        backgroundColor: isClassic ? "#f8fafc" : `${accent}15`,
                        borderColor: `${accent}30`,
                      }}
                    >
                      {settings.companyLogo ? (
                        <img
                          src={settings.companyLogo}
                          alt={settings.companyName}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6" style={{ color: accent }} />
                      )}
                    </div>
                  )}

                  <div>
                    <h1
                      className="font-black text-2xl tracking-tight leading-tight"
                      style={{ color: isClassic ? "#0f172a" : accent }}
                    >
                      {settings.companyName}
                    </h1>
                    <p className="text-xs text-slate-400 italic tracking-wide mt-0.5">
                      {settings.companyTagline}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* INVOICE Title & Number Pill */}
            <div className="text-right">
              <span
                className="font-black text-2xl sm:text-3xl tracking-wider block uppercase"
                style={{ color: isClassic ? "#0f172a" : accent }}
              >
                INVOICE
              </span>
              <div className="mt-1">
                {isEditMode ? (
                  <input
                    type="text"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="px-2.5 py-0.5 text-white font-mono font-bold text-xs rounded-md text-right w-44 outline-none"
                    style={{ backgroundColor: accent }}
                  />
                ) : (
                  <span
                    className="inline-block px-3 py-1 text-white font-mono font-black text-xs sm:text-sm rounded-md tracking-wider shadow-2xs"
                    style={{ backgroundColor: isClassic ? "#0f172a" : accent }}
                  >
                    #{invoiceId}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                {isEditMode ? (
                  <div className="flex items-center justify-end gap-1">
                    <span>Date:</span>
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="border-b border-slate-200 w-24 text-right text-xs outline-none"
                    />
                  </div>
                ) : (
                  <span>
                    Date: {invoiceDate} | Time: {invoiceTime}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dividing Bar */}
          <div
            className="h-[2px] w-full"
            style={{ backgroundColor: isClassic ? "#cbd5e1" : accent }}
          />

          {/* ==================== 2. STORE CONTACT & VERIFIED BADGE ==================== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 font-medium print:gap-2">
            <div className="space-y-0.5">
              <div className="font-black text-sm text-slate-900">{settings.companyName}</div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span>{settings.companyAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span>Hotline: {settings.companyHotline}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span>{settings.companyEmail}</span>
              </div>
            </div>

            {/* Verified Seller Trust Box */}
            {settings.verifiedSellerBadge && (
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3 shrink-0 print:py-1.5 print:px-2.5">
                <div
                  className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0"
                  style={{ backgroundColor: accent }}
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-xs" style={{ color: accent }}>
                    {settings.verifiedSellerText}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {settings.verifiedSellerSubText}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================== 3. BILLED TO & PAYMENT DELIVERY BOX ==================== */}
          <div
            className="rounded-2xl border p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:p-3 print:gap-3"
            style={{
              backgroundColor: isClassic ? "#f8fafc" : `${accent}08`,
              borderColor: `${accent}25`,
            }}
          >
            {/* Left: BILLED TO */}
            <div className="space-y-1.5">
              <span
                className="font-black tracking-wider uppercase text-[10px] block"
                style={{ color: accent }}
              >
                BILLED TO
              </span>
              {isEditMode ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full font-black text-xs bg-white p-1 border border-slate-200 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full font-mono bg-white p-1 border border-slate-200 rounded"
                  />
                  <textarea
                    rows={2}
                    placeholder="Delivery Address"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full bg-white p-1 border border-slate-200 rounded text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-0.5 text-slate-700 font-medium">
                  <div className="font-black text-xs text-slate-900 uppercase">
                    {custName || "Customer Name"}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-mono font-bold text-xs">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{custPhone}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600 leading-relaxed text-xs">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {custAddress} {custDistrict ? `(${custDistrict})` : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: PAYMENT & DELIVERY */}
            <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-4">
              <span
                className="font-black tracking-wider uppercase text-[10px] block"
                style={{ color: accent }}
              >
                PAYMENT &amp; DELIVERY
              </span>

              {isEditMode ? (
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">
                      Payment Method:
                    </label>
                    <input
                      type="text"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white p-1 border border-slate-200 rounded font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block">
                      Delivery Status:
                    </label>
                    <select
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value as any)}
                      className="w-full bg-white p-1 border border-slate-200 rounded font-bold text-xs"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Payment Method:</div>
                    <div className="font-extrabold text-slate-900 text-xs mt-0.5">
                      {paymentMethod}
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-1" />

                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Delivery Status:</div>
                    <div className="mt-0.5">
                      <span
                        className="px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider inline-block text-white"
                        style={{ backgroundColor: accent }}
                      >
                        {deliveryStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================== 4. LINE ITEMS TABLE ==================== */}
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden border border-slate-200/80">
              {/* Header Bar */}
              <div
                className="text-white uppercase text-[10px] font-black tracking-wider py-2.5 px-3 grid grid-cols-12 items-center"
                style={{ backgroundColor: isClassic ? "#0f172a" : accent }}
              >
                <div className="col-span-6">ITEM DESCRIPTION</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-center">UNIT PRICE</div>
                <div className="col-span-2 text-right">AMOUNT</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 bg-white">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 sm:p-3 grid grid-cols-12 items-center text-xs print:py-1.5 print:px-2"
                  >
                    {/* Item Info with Thumbnail */}
                    <div className="col-span-6 flex items-center gap-2.5">
                      <div
                        onClick={() => {
                          if (isEditMode) {
                            setEditingItemIndex(idx);
                            setMediaModalOpen(true);
                          }
                        }}
                        className={`relative w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 ${
                          isEditMode
                            ? "cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:opacity-80 transition"
                            : ""
                        }`}
                        title={isEditMode ? "Click to change photo from Media Library" : ""}
                      >
                        {it.image ? (
                          <img
                            src={it.image}
                            alt={it.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pr-2">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={it.title}
                            onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                            className="w-full font-bold text-xs border border-slate-200 p-0.5 rounded"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-900 leading-tight block text-xs">
                            {it.title}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Qty */}
                    <div className="col-span-2 text-center font-bold text-slate-800 text-xs">
                      {isEditMode ? (
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                          className="w-10 text-center border border-slate-200 p-0.5 rounded font-bold text-xs"
                        />
                      ) : (
                        it.qty
                      )}
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-2 text-center font-bold text-slate-700 font-mono text-xs">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) => handleItemChange(idx, "price", Number(e.target.value))}
                          className="w-14 text-center border border-slate-200 p-0.5 rounded font-mono font-bold text-xs"
                        />
                      ) : (
                        formatPrice(it.price)
                      )}
                    </div>

                    {/* Total Amount */}
                    <div className="col-span-2 text-right font-black text-slate-900 font-mono text-xs flex items-center justify-end gap-1">
                      <span>{formatPrice(it.price * it.qty)}</span>
                      {isEditMode && items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 ml-1 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isEditMode && (
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Item Row</span>
              </button>
            )}

            {/* Financial Summary Calculation */}
            <div className="flex justify-end text-xs font-medium text-slate-600 pt-1">
              <div className="w-64 space-y-1 print:space-y-0.5">
                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-slate-600">Items Subtotal:</span>
                  <span className="font-mono font-black text-slate-900 text-xs">
                    {formatPrice(itemsSubtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-slate-600">Delivery Charge:</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                      className="w-16 text-right p-0.5 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  ) : (
                    <span className="font-mono font-black text-slate-900 text-xs">
                      {formatPrice(deliveryCharge)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-slate-600">Govt VAT ({vatRate}%):</span>
                  {isEditMode ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={vatRate}
                        onChange={(e) => setVatRate(Number(e.target.value))}
                        className="w-10 text-right p-0.5 border border-slate-200 rounded font-mono text-xs"
                      />
                      <span className="font-mono font-bold text-xs">
                        %{formatPrice(calculatedVat)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-mono font-black text-slate-900 text-xs">
                      {formatPrice(calculatedVat)}
                    </span>
                  )}
                </div>

                {/* Grand Total Bar */}
                <div
                  className="border-t border-slate-200 pt-1.5 flex justify-between items-center"
                  style={{ borderTopColor: `${accent}40` }}
                >
                  <span
                    className="font-black text-xs uppercase tracking-wider"
                    style={{ color: isClassic ? "#0f172a" : accent }}
                  >
                    TOTAL PAYABLE AMOUNT
                  </span>
                  <span className="font-mono font-black text-xl text-slate-900 tracking-tight">
                    {formatPrice(totalPayable)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 5. THANK YOU & SIGNATORY CARD ==================== */}
          <div
            className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:p-2.5 print:gap-2"
            style={{
              backgroundColor: isClassic ? "#f8fafc" : `${accent}08`,
              borderColor: `${accent}25`,
            }}
          >
            {/* Left: Thank You message */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: accent }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <div className="font-black text-xs text-slate-900">
                  {settings.thankYouHeading}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {settings.thankYouMessage}
                </p>
              </div>
            </div>

            {/* Right: Signature */}
            {settings.showSignature && (
              <div className="text-center sm:text-right shrink-0">
                <div
                  className="font-serif italic text-xl text-slate-800 tracking-wide font-black"
                  style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive, serif" }}
                >
                  {settings.signatoryName}
                </div>
                <div className="w-24 border-b border-slate-300 pb-0.5 mb-0.5 mx-auto sm:ml-auto" />
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  {settings.signatoryRole}
                </div>
              </div>
            )}
          </div>

          {/* ==================== 6. FOOTER (3 COLUMNS) ==================== */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs border-t border-slate-100 print:gap-2 print:pt-1.5">
            {/* Need Help */}
            <div className="space-y-0.5">
              <span className="font-black text-[9px] text-slate-400 uppercase tracking-wider block">
                {settings.footerHelpText}
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                <Phone className="w-3 h-3" style={{ color: accent }} />
                <span>{settings.companyHotline}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
                <Mail className="w-3 h-3" style={{ color: accent }} />
                <span>{settings.companyEmail}</span>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-0.5 text-center sm:border-l sm:border-r sm:border-slate-100 px-2">
              <span className="font-black text-[9px] text-slate-400 uppercase tracking-wider block">
                {settings.footerFollowText}
              </span>
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs">
                  f
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
                  ig
                </div>
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[9px] shadow-2xs">
                  tk
                </div>
              </div>
            </div>

            {/* Shop with Confidence */}
            <div className="space-y-0.5 sm:text-right">
              <span className="font-black text-[9px] text-slate-400 uppercase tracking-wider block">
                SHOP WITH CONFIDENCE
              </span>
              <div className="flex items-center sm:justify-end gap-1 text-slate-700 font-medium text-[11px]">
                <ShieldCheck className="w-3 h-3" style={{ color: accent }} />
                <span>{settings.trustBadge1}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1 text-slate-700 font-medium text-[11px]">
                <Truck className="w-3 h-3" style={{ color: accent }} />
                <span>{settings.trustBadge2}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 7. BOTTOM BANNER ==================== */}
        <div
          className="py-2 px-4 text-center text-white text-[10px] font-medium tracking-wide"
          style={{ backgroundColor: isClassic ? "#0f172a" : accent }}
        >
          {settings.footerNote}
        </div>
      </div>

      {/* Unified Media Library Modal for Item Photo */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => {
          setMediaModalOpen(false);
          setEditingItemIndex(null);
        }}
        onSelect={(url) => {
          if (editingItemIndex !== null) {
            handleItemChange(editingItemIndex, "image", url);
          }
          setMediaModalOpen(false);
          setEditingItemIndex(null);
        }}
        multiple={false}
        title="Select Product Image"
        buttonLabel="Insert Product Photo"
        initialSelectedUrl={editingItemIndex !== null ? items[editingItemIndex]?.image : undefined}
      />
    </div>
  );
}
