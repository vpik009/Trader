"use server";

import { revalidatePath } from "next/cache";
import { auth, DEMO_MODE, signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { getGame } from "@/lib/igdb";

export async function signInAction(redirectTo?: string) {
  await signIn(DEMO_MODE ? "demo" : "google", { redirectTo: redirectTo ?? "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export type RateState = { error?: string; ok?: boolean };

export async function rateGame(_prev: RateState, form: FormData): Promise<RateState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in to rate games." };

  const gameId = Number(form.get("gameId"));
  const stars = Number(form.get("stars"));
  const review = String(form.get("review") ?? "").trim().slice(0, 5000) || null;
  if (!Number.isInteger(stars) || stars < 1 || stars > 4) return { error: "Pick 1 to 4 stars." };

  // Make sure the game row exists before attaching a rating to it.
  const game = await getGame(gameId);
  if (!game) return { error: "Game not found." };

  await db.rating.upsert({
    where: { userId_gameId: { userId: session.user.id, gameId } },
    create: { userId: session.user.id, gameId, stars, review },
    update: { stars, review },
  });
  revalidatePath(`/game/${gameId}`);
  revalidatePath("/library");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteRating(gameId: number) {
  const session = await auth();
  if (!session?.user?.id) return;
  await db.rating.deleteMany({ where: { userId: session.user.id, gameId } });
  revalidatePath(`/game/${gameId}`);
  revalidatePath("/library");
  revalidatePath("/");
}
