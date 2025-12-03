"use client";

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";
import { Bell, Check, CheckCheck, Clock, MailOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns"; // Optional: npm install date-fns

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationClient({ 
  initialNotifications, 
  userId 
}: { 
  initialNotifications: Notification[], 
  userId: string 
}) {
 const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);  const supabase = createClient();

  // 1. SETUP REALTIME LISTENER
  useEffect(() => {
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Add new notification to top of list
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // 2. HANDLE MARK AS READ
  const handleMarkAsRead = async (id: string) => {
    // Optimistic Update (Update UI instantly)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    // Update DB
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  // 3. HANDLE MARK ALL AS READ
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2 text-gray-600">
          <Bell className="w-4 h-4" />
          <span className="text-sm font-medium">
            You have {notifications.filter(n => !n.is_read).length} unread messages
          </span>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <MailOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              className={`
                relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
                ${notification.is_read 
                  ? "bg-white border-gray-100 text-gray-500 hover:bg-gray-50" 
                  : "bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md"
                }
              `}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className={`text-sm ${notification.is_read ? "font-normal" : "font-semibold text-gray-900"}`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {/* Using simple JS date if date-fns is not installed: */}
                    <span>{new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {!notification.is_read && (
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0 animate-pulse" />
                )}
                
                {notification.is_read && (
                    <Check className="w-4 h-4 text-gray-300 shrink-0" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}