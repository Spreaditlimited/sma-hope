import type { ReactNode } from "react";
export function ContentPageBg({
  children,
  className,
}: {
  image?: string;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`editorial-page ${className || ""}`}>{children}</div>;
}
