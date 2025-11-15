// hooks/useUser.ts
import { useEffect, useState } from "react";
import { AuthError, Session, User } from "@supabase/supabase-js";
import createClient from "@/lib/supabase/client";

export default function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        if (mounted) setError(err as AuthError);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Only redirect on signOut, don't reload the page
          if (event === 'SIGNED_OUT') {
            // Let the middleware handle the redirect
            console.log('User signed out');
          }
        }
      }
    );

    fetchUser();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { loading, error, session, user };
}