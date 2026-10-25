const STAR_PATH =
  "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";

// Filled stars are solid, empty ones are outlines, so the state reads by shape and not only colour.
export function Star({ filled, px = 16, className = "" }: { filled: boolean; px?: number; className?: string }) {
  return (
    <svg width={px} height={px} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d={STAR_PATH}
        fill={filled ? "var(--accent)" : "none"}
        stroke={filled ? "var(--star-stroke)" : "currentColor"}
        strokeWidth={filled ? 1.25 : 1.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({ value, px = 16, className = "" }: { value: number; px?: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span role="img" aria-label={`${Number.isInteger(value) ? value : value.toFixed(1)} of 4 stars`} className={`inline-flex gap-1 ${className}`}>
      {[1, 2, 3, 4].map((i) => (
        <Star key={i} filled={i <= rounded} px={px} />
      ))}
    </span>
  );
}
