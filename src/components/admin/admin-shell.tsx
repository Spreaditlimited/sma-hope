import { WorkspaceShell } from "@/components/workspace-shell";
export function AdminShell(props: {
  title: string;
  subtitle?: string;
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  return <WorkspaceShell {...props} />;
}
