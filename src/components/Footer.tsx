import { STAR_HINTS, STAR_LABELS } from "@/lib/ratings";
import { Stars } from "@/components/Stars";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="wrap grid gap-8 py-12 text-sm sm:grid-cols-12">
        <section className="sm:col-span-5" aria-labelledby="how-heading">
          <h2 id="how-heading" className="font-display text-lg font-bold">
            How ratings work
          </h2>
          <dl className="mt-2 grid grid-cols-[auto_auto_1fr] items-center gap-x-4 gap-y-2">
            {[4, 3, 2, 1].map((s) => (
              <div key={s} className="contents">
                <dt className="contents">
                  <Stars value={s} px={14} className="text-muted" />
                  <strong>{STAR_LABELS[s]}</strong>
                </dt>
                <dd className="text-muted">{STAR_HINTS[s]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="sm:col-span-6 sm:col-start-7" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="font-display text-lg font-bold">
            Where the other scores come from
          </h2>
          <p className="mt-2 max-w-prose text-muted">
            Critics is IGDB&apos;s average of professional reviews (IGN, GameSpot and others). Metacritic and Steam
            scores come from the Steam store. GamerRate only stores your Google account ID, name and picture, never
            your email.
          </p>
          <p className="mt-4 text-muted">
            Game data from{" "}
            <a href="https://www.igdb.com" className="text-link underline">
              IGDB
            </a>
            .
          </p>
        </section>
      </div>
    </footer>
  );
}
