import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const DEMO_MODE = process.env.DEMO_MODE === "true";
const DEMO_USER = { id: "demo:player", name: "Demo Player" };

// Demo mode (npm run demo) swaps Google for a one-click local login. Never enable it in production.
const providers: Provider[] = DEMO_MODE
  ? [Credentials({ id: "demo", name: "Demo", credentials: {}, authorize: () => DEMO_USER })]
  : [Google];

// SSO only. Sessions live in a signed JWT cookie; the database keeps just an
// opaque provider id, a display name and an avatar so ratings can be attributed.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "demo") {
        await db.user.upsert({ where: { id: DEMO_USER.id }, create: DEMO_USER, update: {} });
        return true;
      }
      if (!account || !profile?.sub) return false;
      const id = `${account.provider}:${profile.sub}`;
      const name = profile.name ?? "Player";
      const image = (profile.picture as string | undefined) ?? null;
      await db.user.upsert({
        where: { id },
        create: { id, name, image },
        update: { name, image },
      });
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "demo") token.uid = DEMO_USER.id;
      else if (account && profile?.sub) token.uid = `${account.provider}:${profile.sub}`;
      // Never carry the email around.
      delete token.email;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid as string;
      return session;
    },
  },
});
