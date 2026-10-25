import Link from "next/link";
import type { Game } from "@prisma/client";
import { coverUrl } from "@/lib/igdb";
import { Star, Stars } from "@/components/Stars";

export function GameCard({ game, stars, caption }: { game: Game; stars?: number; caption?: string }) {
  const cover = coverUrl(game);
  return (
    <Link href={`/game/${game.id}`} className="group block rounded-lg">
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-surface outline-2 outline-offset-2 outline-transparent transition-[outline-color] group-hover:outline-primary">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-line">
            <Star filled={false} px={48} />
          </div>
        )}
      </div>
      <div className="mt-2 line-clamp-2 font-medium leading-tight group-hover:underline">{game.name}</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
        {stars !== undefined && <Stars value={stars} px={14} className="text-muted" />}
        {caption && <span>{caption}</span>}
        {!caption && game.releaseYear && <span>{game.releaseYear}</span>}
      </div>
    </Link>
  );
}

export function GameGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-6">{children}</div>;
}
