import Link from "next/link";
import { db } from "@/lib/db";
import { GameCard, GameGrid } from "@/components/GameCard";
import { SearchBox } from "@/components/SearchBox";
import { Star, Stars } from "@/components/Stars";
import { STAR_HINTS, STAR_LABELS } from "@/lib/ratings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const top = await db.rating.groupBy({
    by: ["gameId"],
    _avg: { stars: true },
    _count: { stars: true },
    orderBy: [{ _avg: { stars: "desc" } }, { _count: { stars: "desc" } }],
    take: 12,
  });
  const topGames = await db.game.findMany({ where: { id: { in: top.map((t) => t.gameId) } } });
  const byId = new Map(topGames.map((g) => [g.id, g]));

  const recent = await db.rating.findMany({
    where: { review: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { user: true, game: true },
  });

  return (
    <>
      <section className="band">
        <div className="wrap grid gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="lg:col-span-7">
            <h1 className="max-w-[12ch] font-display text-[clamp(40px,7vw,72px)] font-extrabold leading-[1.05] tracking-tight">
              Rate the games you&apos;ve played.
            </h1>
            <p className="mt-4 max-w-[48ch] text-xl leading-relaxed text-on-band-muted">
              Four stars, no half points, no scoring out of a hundred. Keep a library of everything you&apos;ve
              played and see what other players thought.
            </p>
            <div className="mt-8 max-w-xl">
              <SearchBox size="lg" />
            </div>
          </div>

          <ol aria-label="The rating scale" className="self-end lg:col-span-5">
            {[4, 3, 2, 1].map((s) => (
              <li key={s} className="flex items-center gap-4 py-4">
                <span className="flex w-36 shrink-0 gap-1 text-on-band-muted" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} filled={i <= s} px={28} />
                  ))}
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold leading-tight">{STAR_LABELS[s]}</span>
                  <span className="text-on-band-muted">{STAR_HINTS[s]}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap mt-16" aria-labelledby="top-heading">
        <h2 id="top-heading" className="font-display text-[32px] font-bold leading-tight">
          Top rated here
        </h2>
        {top.length ? (
          <div className="mt-6">
            <GameGrid>
              {top.map((t) => {
                const g = byId.get(t.gameId);
                const n = t._count.stars;
                return g ? (
                  <GameCard
                    key={g.id}
                    game={g}
                    stars={t._avg.stars ?? 0}
                    caption={`${(t._avg.stars ?? 0).toFixed(1)} from ${n} ${n === 1 ? "player" : "players"}`}
                  />
                ) : null;
              })}
            </GameGrid>
          </div>
        ) : (
          <p className="mt-2 text-muted">
            Nothing rated yet. Search for the last game you finished and be the first.
          </p>
        )}
      </section>

      {recent.length > 0 && (
        <section className="wrap mt-16" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="font-display text-[32px] font-bold leading-tight">
            Latest reviews
          </h2>
          <ul className="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {recent.map((r) => (
              <li key={r.id} className="border-l-4 border-accent pl-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link href={`/game/${r.gameId}`} className="font-display text-xl font-bold text-link underline-offset-4 hover:underline">
                    {r.game.name}
                  </Link>
                  <Stars value={r.stars} px={16} className="text-muted" />
                </div>
                <blockquote className="mt-2 line-clamp-4 max-w-prose">{r.review}</blockquote>
                <p className="mt-2 text-sm text-muted">{r.user.name}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
