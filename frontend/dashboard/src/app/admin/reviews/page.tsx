"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  useReviewStore,
  ReviewItem,
} from "@/store/useReviewStore";
import { fetchServerData } from "@/lib/serverSync";
import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Heart,
  MessageSquare,
  Search,
  Check,
  ShieldCheck,
  ExternalLink,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  User,
  Phone,
  MapPin,
  Tag,
} from "lucide-react";

export default function AdminReviewsPage() {
  const { reviews, updateStatus, addAdminReply, deleteAdminReply, deleteReview } = useReviewStore();
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Expand / Collapse state per review ID
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Auto-refresh reviews from server on mount
  useEffect(() => {
    fetchServerData().then((serverData) => {
      if (serverData?.reviews) {
        const arr = Array.isArray(serverData.reviews)
          ? serverData.reviews
          : Array.isArray((serverData.reviews as any)?.reviews)
          ? (serverData.reviews as any).reviews
          : [];
        if (arr.length > 0) {
          useReviewStore.setState({ reviews: arr });
        }
      }
    });
  }, []);

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;
  const approvedCount = reviews.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = reviews.filter((r) => r.status === "REJECTED").length;

  const totalRatingSum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avgRating = reviews.length > 0 ? (totalRatingSum / reviews.length).toFixed(1) : "5.0";

  const filtered = reviews.filter((r) => {
    // Status tab filter
    if (activeTab !== "ALL" && r.status !== activeTab) return false;

    // Rating star filter
    if (ratingFilter !== "ALL" && r.rating !== ratingFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.authorName.toLowerCase().includes(q);
      const matchProduct = r.productTitle.toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchPhone = r.authorPhone?.includes(q);
      const matchOrder = r.orderId?.toLowerCase().includes(q);
      return matchName || matchProduct || matchComment || matchPhone || matchOrder;
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filtered.forEach((r) => {
      all[r.id] = true;
    });
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const allAreExpanded = filtered.length > 0 && filtered.every((r) => expandedIds[r.id]);

  const handleApprove = (id: string, title: string) => {
    updateStatus(id, "APPROVED");
    setNotification(`Review for "${title}" approved and published live!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReject = (id: string, title: string) => {
    updateStatus(id, "REJECTED");
    setNotification(`Review for "${title}" rejected and hidden.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this customer review?")) {
      deleteReview(id);
      setNotification("Review deleted.");
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleOpenReply = (rev: ReviewItem) => {
    setReplyingReview(rev);
    setReplyText(rev.adminReply?.comment || "");
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyText.trim()) return;
    addAdminReply(replyingReview.id, replyText.trim(), "Raifa's Mart Support");
    setNotification(`Official response posted to ${replyingReview.authorName}'s review!`);
    setReplyingReview(null);
    setReplyText("");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-100" />
            <span>Customer Reviews Moderation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Approve verified buyer reviews, view exact action timelines, and publish live to single product pages.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Reviews
          </div>
          <div className="text-2xl font-black text-slate-900">{reviews.length}</div>
          <div className="text-[10px] text-slate-500">Across all catalog products</div>
        </div>

        <div className="p-4 rounded-3xl bg-amber-50/50 border border-amber-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Moderation</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingCount}</div>
          <div className="text-[10px] text-amber-600 font-semibold">
            {pendingCount > 0 ? "⚠️ Requires admin action" : "All caught up"}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-50/50 border border-emerald-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved &amp; Live</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">{approvedCount}</div>
          <div className="text-[10px] text-emerald-600">Showing on storefront</div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Avg Store Rating</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{avgRating} / 5.0</div>
          <div className="text-[10px] text-slate-500">From verified customers</div>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>All Reviews</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20">
              {reviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "PENDING"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-900 text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("APPROVED")}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved &amp; Live</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-900 text-white">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("REJECTED")}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "REJECTED"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-50"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
            {rejectedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-900 text-white">
                {rejectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Search, Rating Filter & Expand/Collapse All */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Expand/Collapse All Toggle */}
          <button
            type="button"
            onClick={allAreExpanded ? collapseAll : expandAll}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
            title={allAreExpanded ? "Collapse all review cards" : "Expand all review cards"}
          >
            {allAreExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Expand All</span>
              </>
            )}
          </button>

          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, customer, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) =>
              setRatingFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
            }
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0"
          >
            <option value="ALL">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((rev) => {
            const isPending = rev.status === "PENDING";
            const isApproved = rev.status === "APPROVED";
            const isRejected = rev.status === "REJECTED";
            const isExpanded = !!expandedIds[rev.id];

            const submissionTime = rev.date || (rev.createdAt ? formatDateTime(rev.createdAt) : "Just now");
            const relativeTime = rev.createdAt ? formatRelativeTime(rev.createdAt) : "";

            return (
              <div
                key={rev.id}
                className={`rounded-3xl bg-white border transition-all duration-200 shadow-xs overflow-hidden ${
                  isPending
                    ? "border-amber-300 ring-2 ring-amber-400/10 bg-amber-50/10"
                    : isRejected
                    ? "border-slate-200 bg-slate-50/60 opacity-85"
                    : "border-slate-200/90"
                }`}
              >
                {/* Collapsed Compact Row / Card Header */}
                <div
                  onClick={() => toggleExpand(rev.id)}
                  className={`p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 transition hover:bg-slate-50/80 select-none ${
                    isExpanded ? "border-b border-slate-100 bg-slate-50/30" : ""
                  }`}
                >
                  {/* Left: Product & Customer info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {rev.productImage ? (
                      <img
                        src={rev.productImage}
                        alt={rev.productTitle}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-slate-400" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={rev.productSlug ? `/product/${rev.productSlug}` : "#"}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition truncate max-w-xs inline-flex items-center gap-1"
                        >
                          <span>{rev.productTitle}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                        </Link>

                        {/* Stars */}
                        <div className="flex items-center text-amber-400 shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Customer summary & Preview */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap mt-0.5">
                        <span className="font-bold text-slate-900">{rev.authorName}</span>
                        {rev.authorLocation && (
                          <span className="text-[11px] text-slate-400">• {rev.authorLocation}</span>
                        )}
                        {rev.authorPhone && (
                          <span className="text-[11px] text-slate-400 font-mono">• {rev.authorPhone}</span>
                        )}
                        {rev.verifiedPurchase && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        )}

                        {!isExpanded && (
                          <span className="text-slate-500 italic truncate max-w-sm hidden lg:inline">
                            &ldquo;{rev.comment}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Timestamp, Status Badge & Expand Toggle */}
                  <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end">
                    {/* Timestamp with Clock */}
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1 md:justify-end">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{submissionTime}</span>
                      </div>
                      {relativeTime && (
                        <div className="text-[10px] text-slate-400 font-medium md:text-right">
                          {relativeTime}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1 whitespace-nowrap">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>

                    {/* Expand / Collapse Button */}
                    <button
                      type="button"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                      title={isExpanded ? "Collapse details" : "Expand full details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-700" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 space-y-4 bg-white animate-in slide-in-from-top-1 duration-200">
                    {/* Action Timeline / Log */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center gap-4 text-xs">
                      {/* Customer Submission Time */}
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold">Customer Submitted:</span>
                        <span className="font-semibold text-slate-900">{submissionTime}</span>
                        {relativeTime && <span className="text-slate-400">({relativeTime})</span>}
                      </div>

                      {/* Moderation Status Time */}
                      {rev.moderatedAt && (
                        <div className="flex items-center gap-1.5 text-slate-700 border-l border-slate-200 pl-4">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-bold">Moderation Action:</span>
                          <span className="font-semibold text-slate-900">{rev.moderatedAt}</span>
                        </div>
                      )}

                      {/* Store Reply Time */}
                      {rev.adminReply && (
                        <div className="flex items-center gap-1.5 text-slate-700 border-l border-slate-200 pl-4">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="font-bold">Store Replied:</span>
                          <span className="font-semibold text-slate-900">{rev.adminReply.date}</span>
                        </div>
                      )}
                    </div>

                    {/* Customer Info Card */}
                    <div className="flex items-center gap-3 flex-wrap text-xs bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{rev.authorName}</span>
                      </div>
                      {rev.authorLocation && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{rev.authorLocation}</span>
                        </div>
                      )}
                      {rev.authorPhone && (
                        <div className="flex items-center gap-1 text-slate-500 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{rev.authorPhone}</span>
                        </div>
                      )}
                      {rev.orderId && (
                        <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          Order: {rev.orderId}
                        </span>
                      )}
                      {rev.verifiedPurchase && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>100% Verified Purchase</span>
                        </span>
                      )}
                    </div>

                    {/* Review Title & Text */}
                    <div className="space-y-1.5">
                      {rev.title && (
                        <div className="font-extrabold text-sm text-slate-900">{rev.title}</div>
                      )}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Uploaded Customer Photos */}
                    {rev.photos && rev.photos.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Customer Photos ({rev.photos.length})</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {rev.photos.map((p, idx) => (
                            <a
                              key={idx}
                              href={p}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition shadow-2xs group"
                            >
                              <img
                                src={p}
                                alt="Review Photo"
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Store Official Response Display */}
                    {rev.adminReply && (
                      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-blue-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>{rev.adminReply.repliedBy || "Raifa's Mart Support"}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{rev.adminReply.date}</span>
                            </span>
                            <button
                              onClick={() => deleteAdminReply(rev.id)}
                              className="text-[10px] text-rose-500 hover:underline font-bold"
                            >
                              Remove Reply
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 italic leading-relaxed">{rev.adminReply.comment}</p>
                      </div>
                    )}

                    {/* Footer Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 flex-wrap">
                      <div className="text-xs text-slate-400">
                        {rev.helpfulCount ? `${rev.helpfulCount} customers found this helpful` : ""}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Approve Button */}
                        {!isApproved && (
                          <button
                            onClick={() => handleApprove(rev.id, rev.productTitle)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-2xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve &amp; Publish</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {!isRejected && (
                          <button
                            onClick={() => handleReject(rev.id, rev.productTitle)}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject / Hide</span>
                          </button>
                        )}

                        {/* Official Store Reply Button */}
                        <button
                          onClick={() => handleOpenReply(rev)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>{rev.adminReply ? "Edit Reply" : "Reply as Store"}</span>
                        </button>

                        {/* Delete Permanently */}
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Collapse Card */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(rev.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Heart className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="font-extrabold text-slate-700 text-base">No Customer Reviews Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No reviews matching your filter criteria. When verified customers submit reviews, they will appear here for your moderation.
            </p>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Reply as Official Store Support</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Responding to {replyingReview.authorName} on &quot;{replyingReview.productTitle}&quot;
                </p>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-slate-700">Official Store Response</label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="e.g. Thank you for your feedback! We are thrilled to hear that the product exceeded your expectations..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Official Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
