import { useEffect } from "react";
import createClient from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { NgoUser } from "@/types/ngo";

export function useRealtimeSubscription(
  user: NgoUser | undefined,
  setUser: React.Dispatch<React.SetStateAction<NgoUser>>
) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('ngo-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `ngo_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUser((prev) => ({
              ...prev,
              campaigns: [payload.new as any, ...prev.campaigns],
            }));
            router.refresh();
          } 
          else if (payload.eventType === 'UPDATE') {
            setUser((prev) => ({
              ...prev,
              campaigns: prev.campaigns.map((c) => 
                c.id === payload.new.id ? (payload.new as any) : c
              ),
            }));
            router.refresh();
          }
   //add handle delete update later
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase, router, setUser]);
}