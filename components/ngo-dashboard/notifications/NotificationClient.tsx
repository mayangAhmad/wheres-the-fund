"use client";

import { useEffect, useState } from "react";
import createClient from "@/lib/supabase/client";
import { Bell, Check, CheckCheck, Clock, MailOpen, ArrowRight} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationClientProps {
  initialNotifications: Notification[];
  userId: string;
  mode: "full" | "widget";
}

export default function NotificationClient({ 
  initialNotifications, 
  userId,
  mode = "full"
}: NotificationClientProps) {
 const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);  
 const supabase = createClient();

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

  const displayList = mode === "widget" ? notifications.slice(0, 4) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={`flex flex-col gap-6 h-full ${mode === "widget" ? "bg-white border border-gray-200 rounded-xl p-6 shadow-sm" : "space-y-6"}`}>
      
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
        {mode === "widget" ? (
           <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
        ) : (
           // Full Page Header
           <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-md">
             <Bell className="w-4 h-4" />
             <span className="text-sm font-medium">You have {unreadCount} unread messages</span>
           </div>
        )}

        {mode === "full" && unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        )}
        
        {mode === "widget" && (
           <Link href="/dashboard/notifications" className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center">
             View All <ArrowRight className="w-3 h-3 ml-1" />
           </Link>
        )}

      </div>

      {/* List */}
      <div className={`space-y-3 ${mode === 'widget' ? 'overflow-y-auto flex-1 pr-1' : ''}`}>
        {displayList.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MailOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No notifications yet.</p>
          </div>
        ) : (
          displayList.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              className={`
                relative p-3 rounded-lg border transition-all duration-200 cursor-pointer
                ${notification.is_read 
                  ? "bg-white border-gray-100 text-gray-500 hover:bg-gray-50" 
                  : "bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md"
                }
              `}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0"> {/* min-w-0 for truncation */}
                  <p className={`text-xs ${notification.is_read ? "font-normal" : "font-semibold text-gray-900"} line-clamp-2`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                    <Clock className="w-2.5 h-2.5" />
                    <span>
                      {/* Try using date-fns if installed, otherwise simple JS */}
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {!notification.is_read && (
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0 animate-pulse" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}