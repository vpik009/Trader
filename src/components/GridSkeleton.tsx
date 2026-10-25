export function GridSkeleton({ label }: { label: string }) {
  return (
    <div className="wrap py-12" aria-busy="true">
      <p className="font-display text-[40px] font-extrabold leading-tight tracking-tight text-muted">{label}</p>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-lg bg-line" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
