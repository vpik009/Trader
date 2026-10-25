"use client";

import { usePathname } from "next/navigation";

function MagnifierIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchBox({
  defaultValue,
  size = "md",
  hideOnHome = false,
}: {
  defaultValue?: string;
  size?: "md" | "lg";
  hideOnHome?: boolean;
}) {
  const pathname = usePathname();
  // The home page has its own large search; don't show two.
  if (hideOnHome && pathname === "/") return null;
  const lg = size === "lg";
  const id = lg ? "search-hero" : "search-header";

  return (
    <form action="/search" role="search" className={`flex w-full gap-2 ${lg ? "flex-col sm:flex-row" : ""}`}>
      <label htmlFor={id} className="sr-only">
        Search games
      </label>
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted">
          <MagnifierIcon />
        </span>
        <input
          id={id}
          name="q"
          type="search"
          required
          autoComplete="off"
          enterKeyHint="search"
          defaultValue={defaultValue}
          placeholder={lg ? "Find a game you played" : "Search games"}
          className={`w-full rounded border border-field-line bg-surface pl-12 pr-4 text-ink placeholder:text-muted ${
            lg ? "h-14 text-lg" : "h-12"
          }`}
        />
      </div>
      {lg && (
        <button className="h-14 rounded bg-accent px-6 font-semibold text-on-accent transition-colors hover:brightness-105 active:translate-y-px">
          Search
        </button>
      )}
    </form>
  );
}
