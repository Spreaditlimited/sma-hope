"use client";
import { useState } from "react";
export function ArticleTools() {
  const [notice, setNotice] = useState("");
  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotice("Link copied.");
    } catch {
      setNotice("Copy this page’s address from your browser to share it.");
    }
  }
  return (
    <div className="article-tools">
      <button className="btn btn-secondary" onClick={() => window.print()}>
        Print guide & checklist
      </button>
      <button className="text-link" onClick={share}>
        Copy link ↗
      </button>
      <span role="status">{notice}</span>
    </div>
  );
}
