"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const typeEmoji: Record<string, string> = {
  escrow_funded:       "💰",
  milestone_submitted: "📤",
  milestone_approved:  "✅",
  payment_released:    "💸",
  agent_paid:          "🤖",
  dispute_opened:      "⚠️",
  project_completed:   "🎉",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  };

  // Supabase Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !userId) return;

    fetchNotifications();

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Notification }) => {
          setNotifications((prev) => [payload.new, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(); }}
        className="sketch-btn !px-3 !py-2 !text-sm relative"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-orange border-2 border-paper font-[family-name:var(--font-sketch)] text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sketch-card bg-paper z-50 p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-dashed border-ink/20">
            <h3 className="font-[family-name:var(--font-marker)] text-lg text-ink">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-accent-orange text-white font-[family-name:var(--font-sketch)] text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="font-[family-name:var(--font-sketch)] text-xs text-ink-soft hover:text-accent-green transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-ink-soft hover:text-ink">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center font-[family-name:var(--font-hand)] text-ink-soft">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 border-b border-dashed border-ink/10 last:border-0 cursor-pointer transition-colors hover:bg-paper-dark ${
                    !n.read ? "bg-yellow-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg shrink-0 mt-0.5">
                      {typeEmoji[n.type] ?? "📌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-[family-name:var(--font-sketch)] text-sm text-ink leading-tight">
                          {n.title}
                        </p>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-accent-orange shrink-0 mt-1" />
                        )}
                      </div>
                      {n.body && (
                        <p className="font-[family-name:var(--font-body)] text-xs text-ink-soft mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-[family-name:var(--font-hand)] text-xs text-ink-soft">
                          {timeAgo(n.created_at)}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            onClick={(e) => e.stopPropagation()}
                            className="font-[family-name:var(--font-sketch)] text-xs text-accent-blue hover:underline flex items-center gap-0.5"
                          >
                            View <ExternalLink size={10} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
