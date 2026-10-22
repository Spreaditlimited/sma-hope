import type { Metadata } from "next";
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Private workspace | SMA Hope Foundation",
};
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
