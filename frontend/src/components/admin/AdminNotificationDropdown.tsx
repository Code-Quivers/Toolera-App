"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Eye,
  EyeOff,
  Trash2,
  Package,
  Heart,
  Warehouse,
  Users,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Clock,
  Check,
} from "lucide-react";
import { useNotificationStore, AdminNotification } from "@/store/useNotificationStore";
import { formatPrice } from "@/lib/formatters";

export function AdminNotificationDropdown() {
  const router = useRouter();
  const {
    notifications,
    soundEnabled,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
    getUnreadCount,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ORDER" | "REVIEW">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "UNREAD") return !item.isRead;
    if (activeTab === "ORDER") return item.type === "ORDER";
    if (activeTab === "REVIEW") return item.type === "REVIEW";
    return true;
  });

  const handleItemClick = (item: AdminNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.targetHref) {
      router.push(item.targetHref);
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
        );
      case "REVIEW":
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
        );
      case "INVENTORY":
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
            <Warehouse className="w-4 h-4" />
          </div>
        );
      case "CUSTOMER":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl transition border ${
          isOpen
            ? "bg-slate-100 border-slate-300 text-slate-900 shadow-inner"
            : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
        }`}
        aria-label="Admin Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-50">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[360px] sm:w-[420px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight">Notifications</span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  All read
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark all read</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                title={soundEnabled ? "Mute notification sounds" : "Unmute notification sounds"}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            </div>
          </div>

          <div className="px-3 pt-2.5 pb-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1 text-[11px] font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1 rounded-xl transition shrink-0 ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60"
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1 rounded-xl transition shrink-0 ${
                activeTab === "UNREAD"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60"
              }`}
            >
              Unread ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ORDER")}
              className={`px-3 py-1 rounded-xl transition shrink-0 ${
                activeTab === "ORDER"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60"
              }`}
            >
              Orders ({notifications.filter((n) => n.type === "ORDER").length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REVIEW")}
              className={`px-3 py-1 rounded-xl transition shrink-0 ${
                activeTab === "REVIEW"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60"
              }`}
            >
              Reviews ({notifications.filter((n) => n.type === "REVIEW").length})
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="font-extrabold text-slate-800 text-xs">All caught up!</div>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  No notifications found for this filter.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`group relative p-3.5 sm:p-4 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !item.isRead ? "bg-emerald-50/30" : "bg-white"
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  {renderTypeIcon(item.type)}

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-extrabold text-xs text-slate-900 line-clamp-1 ${!item.isRead ? "font-black" : ""}`}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-bold shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{getTimeAgo(item.timestamp)}</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                        <span>Open details</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-2" title="Unread" />
                  )}

                  <div
                    className="absolute right-3 top-3 hidden group-hover:flex items-center gap-1 bg-white/95 p-1 rounded-xl shadow-xs border border-slate-200 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.isRead ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnread(item.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                        title="Mark as unread"
                      >
                        <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                clearAll();
              }}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-bold transition"
            >
              Clear all history
            </button>

            <Link
              href="/admin/orders"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
