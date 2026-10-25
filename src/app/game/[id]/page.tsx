import { notFound } from "next/navigation";
import { auth, DEMO_MODE } from "@/auth";
import { signInAction } from "@/app/actions";
import { db } from "@/lib/db";
import { coverUrl, getGame } from "@/lib/igdb";
import { getMetacritic, getSteamReviews } from "@/lib/steam";
import { STAR_LABELS } from "@/lib/ratings";
import { RatingForm } from "@/components/RatingForm";
import { Stars } from "@/components/Stars";

type Source = { name: string; value: string | null; detail?: string; href?: string };

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const game = await getGame(Number((await params).id)).catch(() => null);
  return { title: game ? `${game.name} | GamerRate` : "GamerRate" };
}

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const game = await getGame(id);
  if (!game) notFound();

  const session = await auth();
  const [ratings, steam, metacritic] = await Promise.all([
    db.rating.findMany({ where: { gameId: id }, orderBy: { updatedAt: "desc" }, include: { user: true } }),
    game.steamAppId ? getSteamReviews(game.steamAppId) : null,
    game.steamAppId ? getMetacritic(game.steamAppId) : null,
  ]);
  const mine = ratings.find((r) => r.userId === session?.user?.id);
  const reviews = ratings.filter((r) => r.review);
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length : 0;
  const dist = [4, 3, 2, 1].map((s) => ({ s, n: ratings.filter((r) => r.stars === s).length }));
  const cover = coverUrl(game);

  const sources: Source[] = [
    {
      name: "Critics",
      value: game.criticScore != null ? `${Math.round(game.criticScore)}` : null,
      detail: game.criticCount ? `${game.criticCount} professional reviews` : undefined,
    },
    {
      name: "Metacritic",
      value: metacritic ? `${metacritic.score}` : null,
      href: metacritic?.url,
    },
    {
      name: "Steam players",
      value: steam ? `${steam.percentPositive}%` : null,
      detail: steam ? `${steam.description}, ${steam.total.toLocaleString("en")} reviews` : undefined,
      href: game.steamAppId ? `https://store.steampowered.com/app/${game.steamAppId}` : undefined,
    },
    {
      name: "IGDB players",
      value: game.igdbScore != null ? `${Math.round(game.igdbScore)}` : null,
      detail: game.igdbCount ? `${game.igdbCount.toLocaleString("en")} ratings` : undefined,
      href: `https://www.igdb.com/games/${game.slug}`,
    },
  ];

  return (
    <>
      <section className="band">
        <div className="wrap grid grid-cols-[auto_1fr] gap-x-6 gap-y-8 py-12 sm:gap-x-8 lg:grid-cols-12 lg:py-16">
          <div className="w-28 sm:w-48 lg:col-span-3 lg:w-auto">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={`${game.name} cover art`} className="w-full rounded-lg" />
            ) : (
              <div className="aspect-[3/4] rounded-lg bg-on-band/10" />
            )}
          </div>

          <div className="lg:col-span-5">
            <h1 className="font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight">
              {game.name}
            </h1>
            <p className="mt-2 text-on-band-muted">
              {[game.releaseYear, game.genres].filter(Boolean).join(", ")}
            </p>
            {game.summary && (
              <p className="mt-4 line-clamp-6 hidden max-w-[60ch] leading-relaxed sm:block">{game.summary}</p>
            )}
          </div>

          <div className="col-span-2 lg:col-span-4">
            <h2 className="text-on-band-muted">GamerRate players</h2>
            {ratings.length ? (
              <>
                <div className="mt-1 flex items-end gap-4">
                  <span className="font-display text-[96px] font-extrabold leading-none tracking-tighter">
                    {avg.toFixed(1)}
                  </span>
                  <span className="pb-2">
                    <Stars value={avg} px={24} className="text-on-band-muted" />
                    <span className="mt-1 block text-on-band-muted">
                      out of 4, from {ratings.length} {ratings.length === 1 ? "player" : "players"}
                    </span>
                  </span>
                </div>
                <dl className="mt-6 space-y-2">
                  {dist.map(({ s, n }) => (
                    <div key={s} className="grid grid-cols-[72px_1fr_32px] items-center gap-2">
                      <dt>{STAR_LABELS[s]}</dt>
                      <dd className="h-2 rounded-full bg-on-band/15" aria-hidden="true">
                        <div className="h-full rounded-full bg-band-accent" style={{ width: `${(n / ratings.length) * 100}%` }} />
                      </dd>
                      <dd className="text-right tabular-nums text-on-band-muted">{n}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="mt-2 font-display text-2xl font-bold">No ratings yet. Yours could be the first.</p>
            )}
          </div>
        </div>
      </section>

      <div className="wrap mt-12 grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          {game.summary && <p className="mb-12 max-w-prose leading-relaxed sm:hidden">{game.summary}</p>}

          <section aria-label="Rate this game">
            {session?.user ? (
              <RatingForm gameId={id} gameName={game.name} initialStars={mine?.stars} initialReview={mine?.review} />
            ) : (
              <div>
                <h2 className="font-display text-2xl font-bold">Played {game.name}?</h2>
                <p className="mt-2 text-muted">Sign in to rate it and add it to your library.</p>
                <form action={signInAction.bind(null, `/game/${id}`)} className="mt-4">
                  <button className="h-14 rounded bg-primary px-8 text-lg font-semibold text-on-primary transition-opacity hover:opacity-90 active:translate-y-px">
                    {DEMO_MODE ? "Sign in to rate (demo)" : "Sign in with Google to rate"}
                  </button>
                </form>
              </div>
            )}
          </section>

          <section className="mt-16" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="font-display text-[32px] font-bold leading-tight">
              Reviews
            </h2>
            {reviews.length ? (
              <ul className="mt-6 space-y-8">
                {reviews.map((r) => (
                  <li key={r.id} className="border-l-4 border-accent pl-6">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {r.user.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.user.image} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                      )}
                      <span className="font-semibold">{r.user.name}</span>
                      <span className="flex items-center gap-2 text-muted">
                        <Stars value={r.stars} px={16} />
                        {STAR_LABELS[r.stars]}
                      </span>
                    </div>
                    <p className="mt-2 max-w-prose whitespace-pre-line">{r.review}</p>
                    <p className="mt-2 text-sm text-muted">
                      {r.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">No written reviews yet. Ratings with a review show up here.</p>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="elsewhere-heading">
          <h2 id="elsewhere-heading" className="font-display text-2xl font-bold">
            Scores elsewhere
          </h2>
          <dl className="mt-4 divide-y divide-line rounded-2xl bg-surface px-6">
            {sources.map((s) => (
              <div key={s.name} className="flex items-baseline justify-between gap-4 py-4">
                <dt>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noreferrer" className="font-semibold text-link underline underline-offset-4">
                      {s.name}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span className="font-semibold">{s.name}</span>
                  )}
                  {s.detail && <span className="block text-sm text-muted">{s.detail}</span>}
                </dt>
                <dd className="font-display text-2xl font-bold tabular-nums">
                  {s.value ?? <span className="text-base font-normal text-muted">Not available</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-muted">Critics, Metacritic and IGDB scores are out of 100.</p>
        </aside>
      </div>
    </>
  );
}
