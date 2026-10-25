import { searchGames } from "@/lib/igdb";
import { GameCard, GameGrid } from "@/components/GameCard";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return { title: q ? `Search: ${q} | GamerRate` : "Search | GamerRate" };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let error: string | null = null;
  const results = await searchGames(q).catch((e: Error) => {
    error = e.message;
    return [];
  });

  return (
    <div className="wrap py-12">
      <h1 className="font-display text-[40px] font-extrabold leading-tight tracking-tight">
        {q ? <>Results for “{q}”</> : "Search games"}
      </h1>
      {error ? (
        <div role="alert" className="mt-4 max-w-prose rounded-lg border border-alert p-4">
          <p className="font-semibold text-alert">Couldn&apos;t reach the game database.</p>
          <p className="mt-1">Try again in a minute. If it keeps happening, the server reported: {error}</p>
        </div>
      ) : !q ? (
        <p className="mt-2 text-muted">Type a game name in the search box above.</p>
      ) : results.length === 0 ? (
        <p className="mt-2 text-muted">
          No games match “{q}”. Check the spelling, or try the main title without the subtitle.
        </p>
      ) : (
        <>
          <p className="mt-2 text-muted">
            {results.length} {results.length === 1 ? "game" : "games"}. Pick one to rate it.
          </p>
          <div className="mt-8">
            <GameGrid>
              {results.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </GameGrid>
          </div>
        </>
      )}
    </div>
  );
}
