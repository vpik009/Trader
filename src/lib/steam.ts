export type SteamReviews = {
  description: string; // e.g. "Very Positive"
  percentPositive: number;
  total: number;
};

export async function getSteamReviews(appId: number): Promise<SteamReviews | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all&num_per_page=0`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const s = data?.query_summary;
    if (!s?.total_reviews) return null;
    return {
      description: s.review_score_desc,
      percentPositive: Math.round((s.total_positive / s.total_reviews) * 100),
      total: s.total_reviews,
    };
  } catch {
    return null;
  }
}

export type Metacritic = { score: number; url: string };

// Steam's store API exposes the Metacritic score for games listed on Steam.
export async function getMetacritic(appId: number): Promise<Metacritic | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=metacritic`,
      { next: { revalidate: 60 * 60 * 24 * 7 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[appId]?.data?.metacritic ?? null;
  } catch {
    return null;
  }
}
