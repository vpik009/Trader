"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteRating, rateGame, type RateState } from "@/app/actions";
import { STAR_HINTS, STAR_LABELS } from "@/lib/ratings";
import { Star } from "@/components/Stars";

const MAX_REVIEW = 5000;

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.5" strokeLinecap="round" />
    </svg>
  );
}

export function RatingForm({
  gameId,
  gameName,
  initialStars,
  initialReview,
}: {
  gameId: number;
  gameName: string;
  initialStars?: number;
  initialReview?: string | null;
}) {
  const [stars, setStars] = useState(initialStars ?? 0);
  const [hover, setHover] = useState(0);
  const [popped, setPopped] = useState(0);
  const [review, setReview] = useState(initialReview ?? "");
  const [confirming, setConfirming] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [removing, startRemove] = useTransition();
  const [state, action, pending] = useActionState<RateState, FormData>(async (prev, form) => {
    setRemoved(false);
    return rateGame(prev, form);
  }, {});
  const shown = hover || stars;
  const rated = initialStars !== undefined;

  function remove() {
    startRemove(async () => {
      await deleteRating(gameId);
      setStars(0);
      setReview("");
      setConfirming(false);
      setRemoved(true);
    });
  }

  return (
    <form action={action} aria-busy={pending} className="space-y-6">
      <input type="hidden" name="gameId" value={gameId} />
      <fieldset>
        <legend className="font-display text-2xl font-bold">
          {rated ? "Your rating" : `How was ${gameName}?`}
        </legend>
        <div className="mt-4 grid max-w-sm grid-cols-4 gap-2" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4].map((i) => (
            <label
              key={i}
              onMouseEnter={() => setHover(i)}
              className="star-option flex cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-center"
            >
              <input
                type="radio"
                name="stars"
                value={i}
                checked={stars === i}
                onChange={() => {
                  setStars(i);
                  setPopped(i);
                }}
                className="sr-only"
              />
              <Star
                filled={i <= shown}
                px={48}
                className={`text-muted ${popped === i ? "star-pop" : ""}`}
              />
              <span className={`text-sm ${i === shown ? "font-semibold text-ink" : "text-muted"}`}>
                {STAR_LABELS[i]}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 h-6 text-muted" aria-live="polite">
          {shown ? STAR_HINTS[shown] : "Pick one to four stars."}
        </p>
      </fieldset>

      <div>
        <label htmlFor="review" className="font-semibold">
          Review <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="review"
          name="review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={5}
          maxLength={MAX_REVIEW}
          aria-describedby="review-count"
          placeholder="What stuck with you? Spoilers are on you."
          className="mt-2 block w-full rounded border border-field-line bg-surface p-4 text-ink placeholder:text-muted"
        />
        <p id="review-count" className="mt-1 text-right text-sm text-muted">
          {review.length.toLocaleString()} / {MAX_REVIEW.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={!stars || pending}
          className="h-14 rounded bg-primary px-8 text-lg font-semibold text-on-primary transition-opacity hover:opacity-90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : rated ? "Update rating" : "Save rating"}
        </button>

        {rated && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-12 rounded px-2 text-muted underline underline-offset-4 hover:text-alert"
          >
            Remove rating
          </button>
        )}

        <div role="status" aria-live="polite">
          {state.ok && !pending && !removed && (
            <span className="flex items-center gap-2 font-medium text-success">
              <CheckIcon /> Rating saved
            </span>
          )}
          {removed && (
            <span className="flex items-center gap-2 font-medium text-success">
              <CheckIcon /> Rating removed
            </span>
          )}
        </div>
        {state.error && (
          <p role="alert" className="flex items-center gap-2 font-medium text-alert">
            <AlertIcon /> {state.error}
          </p>
        )}
      </div>

      {confirming && (
        <div role="alertdialog" aria-labelledby="confirm-text" className="rounded-lg border border-alert p-4">
          <p id="confirm-text" className="font-medium">
            Remove your rating and review for {gameName}? This can&apos;t be undone.
          </p>
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={remove}
              disabled={removing}
              aria-busy={removing}
              className="h-12 rounded bg-alert px-4 font-semibold text-surface disabled:opacity-50"
            >
              {removing ? "Removing…" : "Remove rating"}
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => setConfirming(false)}
              className="h-12 rounded border border-field-line px-4 font-semibold"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
