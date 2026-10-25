import { db } from "@/lib/db";
import type { Game } from "@prisma/client";

const STEAM_SOURCE = 1; // IGDB external_game_source id for Steam
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

const FIELDS = [
  "name",
  "slug",
  "cover.image_id",
  "first_release_date",
  "summary",
  "genres.name",
  "aggregated_rating",
  "aggregated_rating_count",
  "rating",
  "rating_count",
  "external_games.external_game_source",
  "external_games.uid",
].join(",");

type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  cover?: { image_id: string };
  first_release_date?: number;
  summary?: string;
  genres?: { name: string }[];
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  rating?: number;
  rating_count?: number;
  external_games?: { external_game_source?: number; uid?: string }[];
};

let token: { value: string; expiresAt: number } | null = null;

async function getToken() {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET } = process.env;
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error("TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET are not set");
  }
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST", cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Twitch token request failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function query(body: string): Promise<IgdbGame[]> {
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${await getToken()}`,
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`IGDB request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function toRow(g: IgdbGame) {
  const steamUid = g.external_games?.find((e) => e.external_game_source === STEAM_SOURCE)?.uid;
  return {
    id: g.id,
    name: g.name,
    slug: g.slug,
    coverId: g.cover?.image_id ?? null,
    releaseYear: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
    summary: g.summary ?? null,
    genres: g.genres?.map((x) => x.name).join(", ") || null,
    steamAppId: steamUid && /^\d+$/.test(steamUid) ? Number(steamUid) : null,
    criticScore: g.aggregated_rating ?? null,
    criticCount: g.aggregated_rating_count ?? null,
    igdbScore: g.rating ?? null,
    igdbCount: g.rating_count ?? null,
    fetchedAt: new Date(),
  };
}

async function save(games: IgdbGame[]) {
  return Promise.all(
    games.map((g) => {
      const row = toRow(g);
      return db.game.upsert({ where: { id: g.id }, create: row, update: row });
    }),
  );
}

export async function searchGames(q: string): Promise<Game[]> {
  const term = q.replace(/"/g, "").trim();
  if (!term) return [];
  // Demo mode without Twitch keys: search the games already in the local database.
  if (process.env.DEMO_MODE === "true" && !process.env.TWITCH_CLIENT_ID) {
    return db.game.findMany({ where: { name: { contains: term } }, orderBy: { name: "asc" }, take: 24 });
  }
  const games = await query(
    `search "${term}"; fields ${FIELDS}; where version_parent = null; limit 24;`,
  );
  return save(games);
}

export async function getGame(id: number): Promise<Game | null> {
  const cached = await db.game.findUnique({ where: { id } });
  if (cached && Date.now() - cached.fetchedAt.getTime() < STALE_MS) return cached;
  try {
    const [g] = await query(`fields ${FIELDS}; where id = ${id};`);
    if (!g) return cached;
    const [saved] = await save([g]);
    return saved;
  } catch (err) {
    if (cached) return cached; // IGDB down: serve stale data
    throw err;
  }
}

// IGDB cover first; Steam's portrait library art as a fallback for games IGDB has no cover for.
export function coverUrl(game: Pick<Game, "coverId" | "steamAppId">) {
  if (game.coverId) return `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.coverId}.jpg`;
  if (game.steamAppId) return `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppId}/library_600x900.jpg`;
  return null;
}
