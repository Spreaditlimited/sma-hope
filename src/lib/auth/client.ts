"use client";
import { createAuthClient } from "better-auth/react";
export const accountAuth = createAuthClient({basePath:"/api/auth"});
export const adminAuth = createAuthClient({basePath:"/api/admin-auth"});
export async function accountData() {
  const response = await fetch("/api/account/records",{cache:"no-store"});
  if (!response.ok) throw new Error("Unable to load your account records. Please sign in again or retry.");
  return response.json();
}
