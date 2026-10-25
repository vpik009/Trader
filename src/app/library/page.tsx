import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { STAR_LABELS } from "@/lib/ratings";
import { GameCard, GameGrid } from "@/components/GameCard";

export const metadata = { title: "My library | GamerRate" };

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ stars?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const filter = Number((await searchParams).stars) || undefined;

  const all = await db.rating.findMany({
    where: { userId: session.user.id },
    orderBy: [{ stars: "desc" }, { updatedAt: "desc" }],
    include: { game: true },
  });
  const shown = filter ? all.filter((r) => r.stars === filter) : all;

  const tab = (stars: number | undefined, label: string, n: number) => {
    const current = filter === stars;
    return (
      <li key={label}>
        <Link
          href={stars ? `/library?stars=${stars}` : "/library"}
          aria-current={current ? "page" : undefined}
          className={`flex h-12 items-center gap-2 rounded-full border px-4 font-medium transition-colors ${
            current ? "border-ink bg-ink text-bg" : "border-field-line hover:bg-surface"
          }`}
        >
          {label}
          <span className={current ? "" : "text-muted"}>{n}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="wrap py-12">
      <h1 className="font-display text-[clamp(40px,6vw,56px)] font-extrabold leading-tight tracking-tight">My library</h1>
      <p className="mt-2 text-muted">
        {all.length ? `You've rated ${all.length} ${all.length === 1 ? "game" : "games"}.` : "You haven't rated anything yet."}
      </p>

      {all.length > 0 && (
        <nav aria-label="Filter by rating" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {tab(undefined, "All", all.length)}
            {[4, 3, 2, 1].map((s) => tab(s, STAR_LABELS[s], all.filter((r) => r.stars === s).length))}
          </ul>
        </nav>
      )}

      <div className="mt-8">
        {shown.length ? (
          <GameGrid>
            {shown.map((r) => (
              <GameCard key={r.id} game={r.game} stars={r.stars} caption={STAR_LABELS[r.stars]} />
            ))}
          </GameGrid>
        ) : all.length ? (
          <p className="text-muted">No games rated {STAR_LABELS[filter!]} yet.</p>
        ) : (
          <div className="max-w-prose">
            <p>Every game you rate lands here, sorted from Amazing down to Awful.</p>
            <Link
              href="/search"
              className="mt-4 inline-flex h-14 items-center rounded bg-primary px-8 text-lg font-semibold text-on-primary hover:opacity-90"
            >
              Find a game to rate
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
