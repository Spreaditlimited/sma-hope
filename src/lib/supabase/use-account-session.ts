"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useAccountSession() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session?.user) {
        router.replace("/account/login");
        return;
      }

      setEmail(session.user.email || "");
      setLoading(false);
    }

    loadSession().catch(() => {
      if (!cancelled) {
        router.replace("/account/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { loading, email };
}
