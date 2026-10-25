export default function Loading() {
  return (
    <div aria-busy="true">
      <div className="band">
        <div className="wrap flex gap-8 py-12">
          <div className="aspect-[3/4] w-32 shrink-0 animate-pulse rounded-lg bg-on-band/10 sm:w-48" />
          <div className="flex-1 space-y-4">
            <p className="font-display text-[40px] font-extrabold text-on-band-muted">Loading game…</p>
            <div className="h-4 w-1/2 animate-pulse rounded bg-on-band/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
