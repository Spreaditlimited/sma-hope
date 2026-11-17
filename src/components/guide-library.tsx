"use client";
import { useState } from "react";
import { GuideCard } from "@/components/guide-card";
import { Icon } from "@/components/icon";
import type { GuidePreview } from "@/lib/guide-preview";
export function GuideLibrary({ guides }: { guides: GuidePreview[] }) {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("All readers");
  const audiences = ["All readers", ...new Set(guides.map(g => g.audience || "Nigeria"))];
  const [category, setCategory] = useState("All guides");
  const categories = ["All guides", ...new Set(guides.map((g) => g.category))];
  const filtered = guides.filter(
    (g) =>
      (category === "All guides" || g.category === category) &&
      (audience === "All readers" || (g.audience || "Nigeria") === audience) &&
      `${g.title} ${g.excerpt} ${g.category} ${g.headings.join(" ")}`
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
        <div className="library-controls"><label className="library-search">
          <Icon name="search" />
          <span className="sr-only">Search guides</span>
          <input
            type="search"
            placeholder="Search a topic or question"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="library-region"><span>Location</span><select aria-label="Guides for your location" value={audience} onChange={event => setAudience(event.target.value)}>{audiences.map(country => <option key={country}>{country}</option>)}</select></label></div>
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
              setAudience("All readers");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
