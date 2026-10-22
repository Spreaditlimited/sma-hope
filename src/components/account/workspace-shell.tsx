import { WorkspaceShell } from "@/components/workspace-shell";
export function AccountWorkspaceShell(props: {
  title: string;
  subtitle?: string;
  email: string;
  children: React.ReactNode;
}) {
  return <WorkspaceShell {...props} />;
}
