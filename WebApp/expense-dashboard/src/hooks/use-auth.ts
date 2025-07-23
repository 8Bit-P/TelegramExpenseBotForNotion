import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<null | Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    getSession();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
