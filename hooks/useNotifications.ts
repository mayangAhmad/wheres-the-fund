"use client";

import { useEffect, useState, useCallback } from "react";
import createClient from "@/lib/supabase/client";

export function useNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Memoize fetch to use it inside and outside useEffect
  const fetchUnread = useCallback(async () => {
    if (!userId) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    
    setUnreadCount(count || 0);
  }, [userId, supabase]);

  useEffect(() => {
    if (!userId) return;

    fetchUnread();

    // ✅ Listen for ALL changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // 💡 Changed from 'INSERT' to '*'
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Whenever ANY change happens (like marking as read), recount from DB
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnread, supabase]);

  return { unreadCount, refresh: fetchUnread };
}