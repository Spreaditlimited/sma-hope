"use client";

import * as Select from "@radix-ui/react-select";
import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { amazonMarketplaces, type AmazonMarket } from "@/lib/amazon-marketplaces";

export function BookMarketplaceSelector({ market, placement = "editions" }: { market: AmazonMarket; placement?: "hero" | "editions" }) {
  const triggerId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const anchor = placement === "hero" ? "book-purchase" : "editions";
  return (
    <div className={`book-marketplace-selector book-marketplace-selector--${placement}`}>
      <div className="book-marketplace-intro">
        <label htmlFor={triggerId}>Your Amazon store</label>
        <p>Choose where you shop for local prices and delivery.</p>
      </div>
      <div className="book-marketplace-controls">
        <Select.Root defaultValue={market} disabled={isPending} onValueChange={(next) => {
          if (next !== "GB" && next !== "CA" && next !== "US") return;
          startTransition(() => router.replace(`/book?market=${next}${window.location.hash}`, { scroll: false }));
        }}>
          <Select.Trigger id={triggerId} className="book-marketplace-trigger" aria-label="Your Amazon store">
            <Select.Value />
            <Select.Icon className="book-marketplace-chevron">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="book-marketplace-menu" position="popper" align="start" sideOffset={8} collisionPadding={16}>
              <Select.Viewport>
                {Object.entries(amazonMarketplaces).map(([code, store]) => (
                  <Select.Item className="book-marketplace-option" key={code} value={code}>
                    <Select.ItemText>
                      <span className="book-marketplace-country">{store.country}</span>
                      <span className="book-marketplace-domain">{store.host.replace("www.", "")}</span>
                    </Select.ItemText>
                    <Select.ItemIndicator className="book-marketplace-check">✓</Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        <span className="book-marketplace-progress" role="status">{isPending ? "Updating store…" : ""}</span>
      </div>
      <noscript><p>Choose your store: <a href={`/book?market=GB#${anchor}`}>UK</a> · <a href={`/book?market=CA#${anchor}`}>Canada</a> · <a href={`/book?market=US#${anchor}`}>US</a></p></noscript>
    </div>
  );
}
