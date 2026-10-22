"use client";
import { useState } from "react";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import type { Guide } from "@/content/guides";
export function GuideLibrary({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All guides");
  const categories = ["All guides", ...new Set(guides.map((g) => g.category))];
  const filtered = guides.filter(
    (g) =>
      (category === "All guides" || g.category === category) &&
      `${g.title} ${g.excerpt} ${g.category} ${g.sections.map((s) => s.title).join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="library-toolbar">
        <div className="filter-tabs" aria-label="Filter guides by topic">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c}>
              {c}
            </button>
          ))}
        </div>
        <label className="library-search">
          <Icon name="search" />
          <span className="sr-only">Search guides</span>
          <input
            type="search"
            placeholder="Search a topic or question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className="results-count" role="status">
        {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
        {query ? ` matching “${query}”` : " to help you move forward"}
      </p>
      <div className="guide-grid">
        {filtered.map((g) => (
          <GuideCard key={g.slug} guide={g} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <Icon name="search" size={32} />
          <h2>No guides found</h2>
          <p>Try a broader term, such as care, school, or testing.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setQuery("");
              setCategory("All guides");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
