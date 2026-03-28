"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AdminSession = {
  loading: boolean;
  email: string;
  role: "admin" | "ops" | "";
};

type CachedAdminSession = {
  email: string;
  role: "admin" | "ops";
  cachedAt: number;
};

const ADMIN_SESSION_CACHE_KEY = "sma_admin_session_cache_v1";
const ADMIN_SESSION_CACHE_TTL_MS = 10 * 60 * 1000;
let memoryCache: CachedAdminSession | null = null;

function getCachedAdminSession(): CachedAdminSession | null {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  if (memoryCache && now - memoryCache.cachedAt < ADMIN_SESSION_CACHE_TTL_MS) return memoryCache;

  const raw = window.sessionStorage.getItem(ADMIN_SESSION_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedAdminSession;
    if (!parsed?.email || (parsed.role !== "admin" && parsed.role !== "ops")) return null;
    if (now - parsed.cachedAt > ADMIN_SESSION_CACHE_TTL_MS) return null;
    memoryCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function setCachedAdminSession(value: CachedAdminSession) {
  memoryCache = value;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(ADMIN_SESSION_CACHE_KEY, JSON.stringify(value));
  }
}

function clearCachedAdminSession() {
  memoryCache = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ADMIN_SESSION_CACHE_KEY);
  }
}

export function useAdminSession(): AdminSession {
  const router = useRouter();
  const [state, setState] = useState<AdminSession>({
    loading: true,
    email: "",
    role: "",
  });

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedAdminSession();
    if (cached) {
      setState({ loading: false, email: cached.email, role: cached.role });
    }

    async function load() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        clearCachedAdminSession();
        router.replace("/account/login");
        return;
      }

      const profile = await supabase
        .from("admin_users")
        .select("role, active")
        .or(`auth_user_id.eq.${session.user.id},email.eq.${String(session.user.email || "").toLowerCase()}`)
        .maybeSingle();

      if (cancelled) return;
      const row = profile.data as { role?: "admin" | "ops"; active?: boolean } | null;
      if (profile.error || !row?.role || row.active !== true) {
        clearCachedAdminSession();
        router.replace("/account");
        return;
      }

      const next: CachedAdminSession = {
        email: session.user.email || "",
        role: row.role,
        cachedAt: Date.now(),
      };
      setCachedAdminSession(next);
      setState({ loading: false, email: next.email, role: next.role });
    }

    load().catch(() => {
      if (!cancelled) {
        clearCachedAdminSession();
        router.replace("/account/login");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return state;
}
