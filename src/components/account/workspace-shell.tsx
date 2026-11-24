'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace-shell';
import { accountAuth } from '@/lib/auth/client';

export function AccountWorkspaceShell(props: {
  title: string;
  subtitle?: string;
  email: string;
  children: React.ReactNode;
}) {
  const { data, isPending } = accountAuth.useSession();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!isPending && !data?.user) {
      router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, data?.user, router, pathname]);
  // Also hide the workspace immediately if an open tab loses its session.
  if (isPending || !data?.user) {
    return <WorkspaceShell {...props} email="" pending />;
  }
  return <WorkspaceShell {...props} />;
}
