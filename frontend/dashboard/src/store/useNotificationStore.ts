"use client";
import { useState, useEffect, useCallback } from "react";

export interface AdminNotification {
  id: string;
  type: "ORDER" | "REVIEW" | "STOCK" | "MEMBER" | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  meta?: Record<string, any>;
}

export function useNotificationStore() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rm_notifications");
      if (saved) setNotifications(JSON.parse(saved));
      const sound = localStorage.getItem("rm_notif_sound");
      if (sound !== null) setSoundEnabled(sound === "true");
    } catch {}
  }, []);

  const persist = useCallback((notifs: AdminNotification[]) => {
    try { localStorage.setItem("rm_notifications", JSON.stringify(notifs)); } catch {}
  }, []);

  const getUnreadCount = useCallback(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAsUnread = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: false } : n);
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: !n.read } : n);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    try { localStorage.removeItem("rm_notifications"); } catch {}
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem("rm_notif_sound", String(next)); } catch {}
      return next;
    });
  }, []);

  const addNotification = useCallback((notif: Omit<AdminNotification, "id" | "createdAt" | "read">) => {
    const newNotif: AdminNotification = {
      ...notif,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev].slice(0, 100);
      persist(next);
      return next;
    });
  }, [persist]);

  return {
    notifications,
    soundEnabled,
    isLoading,
    getUnreadCount,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    toggleSound,
    addNotification,
  };
}
