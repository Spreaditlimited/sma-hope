"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminFetch } from "@/lib/admin/client";
import { useAdminSession } from "@/lib/admin/use-admin-session";

type AdminUserRow = {
  id: string;
  email: string;
  role: "admin" | "ops";
  active: boolean;
  created_at: string;
};

export default function AdminSettingsPage() {
  const { loading, email, role } = useAdminSession();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testingFez, setTestingFez] = useState(false);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "ops">("ops");
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    const result = await adminFetch<{ ok: boolean; rows: AdminUserRow[] }>("/api/admin/users");
    setUsers(result.rows || []);
  }

  useEffect(() => {
    if (loading) return;
    loadUsers().catch(() => null);
  }, [loading]);

  async function handleTestFez() {
    setTestingFez(true);
    setError("");
    setMessage("");
    try {
      const result = await adminFetch<{ ok: boolean; tokenExpiry: string }>("/api/admin/integrations/fez/test", {
        method: "POST",
      });
      setMessage(`FEZ connection successful. Token expiry: ${result.tokenExpiry}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "FEZ test failed.");
    } finally {
      setTestingFez(false);
    }
  }

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setCreating(true);
    try {
      await adminFetch<{ ok: boolean }>("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: newEmail,
          role: newRole,
        }),
      });
      setMessage("Admin user created/updated. Login details sent by email if account was new.");
      setNewEmail("");
      setNewRole("ops");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create user.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Admin Settings" subtitle="Loading..." email="" role="">
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-40 w-full rounded-3xl bg-gray-200"></div>
          <div className="h-48 w-full rounded-2xl bg-gray-200"></div>
          <div className="h-96 w-full rounded-2xl bg-gray-200"></div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admin Settings" subtitle="Integrations and access control" email={email} role={role}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-8 sm:px-10 sm:py-10 shadow-xl border border-gray-800">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-slate-500/15 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-full w-1/2 bg-gradient-to-r from-gray-950 to-transparent z-0" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-4">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-xs font-medium tracking-wide text-gray-200">System Configuration</span>
            </div>
            <h1 className="dashboard-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.06] tracking-tight !text-white">
              Platform Settings
            </h1>
            <p className="mt-2 text-gray-400 max-w-xl">
              Manage third-party API integrations, configure team access controls, and monitor system-wide administrative privileges.
            </p>
          </div>
        </section>

        {/* Alert Banners */}
        {message && (
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex items-start gap-3 shadow-sm overflow-hidden">
            <svg className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-emerald-800">Success</h3>
              <p className="mt-1 text-sm text-emerald-700 break-words">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 shadow-sm overflow-hidden">
            <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">Action Failed</h3>
              <p className="mt-1 text-sm text-red-700 break-words">{error}</p>
            </div>
          </div>
        )}

        {/* Integration Settings */}
        <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"></path></svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">FEZ Integration</h2>
              <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                Validate your connection to the FEZ Delivery API. This ensures the admin panel can successfully create and track shipments.
              </p>
              <div className="mt-5 w-full sm:max-w-sm">
                <button type="button" className="btn btn-primary w-full whitespace-normal text-center leading-tight px-4 py-3" onClick={handleTestFez} disabled={testingFez}>
                  {testingFez ? "Testing Connection..." : "Test FEZ Connection"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Access Control & Users */}
        <section className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-100">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"></path></svg>
            </div>
            <div className="flex-1 w-full">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Admin Access Control</h2>
              <p className="mt-1 text-sm text-gray-500 max-w-2xl">
                Manage team permissions. Admin accounts have full access to settings, while Ops accounts handle day-to-day data management.
              </p>

              {role === "admin" ? (
                <form className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3" onSubmit={handleCreateUser}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                    required
                    className="w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 transition-shadow"
                    placeholder="user@example.com"
                  />
                  <select 
                    value={newRole} 
                    onChange={(event) => setNewRole(event.target.value === "admin" ? "admin" : "ops")} 
                    className="w-full rounded-xl border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-slate-600 sm:text-sm sm:leading-6 transition-shadow bg-white"
                  >
                    <option value="ops">Ops Role</option>
                    <option value="admin">Admin Role</option>
                  </select>
                  <button type="submit" className="btn btn-primary w-full whitespace-normal text-center leading-tight min-h-11 px-4 py-3" disabled={creating}>
                    {creating ? "Creating..." : "Create Account"}
                  </button>
                </form>
              ) : (
                <div className="mt-6 inline-flex max-w-full items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 border border-amber-100">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span className="break-words">Your current <strong>Ops role</strong> restricts you from creating new admin users.</span>
                </div>
              )}

              <div className="mt-8 overflow-x-auto rounded-xl ring-1 ring-gray-100">
                <table className="w-full min-w-[560px] sm:min-w-[700px] text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-4">Team Member</th>
                      <th scope="col" className="px-4 sm:px-6 py-4">System Role</th>
                      <th scope="col" className="px-4 sm:px-6 py-4">Account Status</th>
                      <th scope="col" className="px-4 sm:px-6 py-4">Date Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-xs uppercase ring-1 ring-slate-200">
                              {row.email.charAt(0)}
                            </div>
                            <p className="font-medium text-gray-900 break-all min-w-0">{row.email}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                            row.role === 'admin' 
                              ? 'bg-purple-50 text-purple-700 border-purple-200' 
                              : 'bg-[#e7f2fb] text-[#0f557f] border-[#c9ddec]'
                          }`}>
                            {row.role}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-middle">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            row.active 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {row.active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 align-middle whitespace-nowrap">
                          <p className="text-gray-900">
                            {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                      </tr>
                    ))}
                    {!users.length && (
                      <tr>
                        <td colSpan={4} className="px-4 sm:px-6 py-10 text-center text-gray-500">
                          No admin users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AdminShell>
  );
}
