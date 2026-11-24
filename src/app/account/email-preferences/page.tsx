import { requirePageAccount } from '@/lib/auth/require-page-account';
import { AccountWorkspaceShell } from '@/components/account/workspace-shell';
import { LearningEmailPreferences } from '@/components/learning/email-preferences';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requirePageAccount('/account/email-preferences');return <AccountWorkspaceShell title="Email preferences" subtitle="Choose the learning emails that are useful to you." email={u.email}><LearningEmailPreferences/></AccountWorkspaceShell>;}
