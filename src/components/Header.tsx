import Link from "next/link";
import { auth, DEMO_MODE } from "@/auth";
import { signInAction, signOutAction } from "@/app/actions";
import { SearchBox } from "@/components/SearchBox";
import { NavLink } from "@/components/NavLink";
import { Star } from "@/components/Stars";

export async function Header() {
  const session = await auth();
  return (
    <header className="border-b border-line bg-surface">
      <div className="wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-2 sm:gap-x-6">
        <Link href="/" className="flex h-12 items-center gap-2 rounded font-display text-xl sm:text-2xl font-extrabold tracking-tight">
          <Star filled px={24} />
          GamerRate
        </Link>
        <div className="order-last w-full sm:order-none sm:w-auto sm:max-w-md sm:flex-1">
          <SearchBox hideOnHome />
        </div>
        <nav aria-label="Account" className="ml-auto flex items-center sm:gap-2">
          {session?.user ? (
            <>
              <NavLink href="/library">My library</NavLink>
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="hidden h-8 w-8 rounded-full sm:block" referrerPolicy="no-referrer" />
              )}
              <form action={signOutAction}>
                <button className="h-12 rounded px-1 text-muted sm:px-2 underline-offset-4 hover:text-ink hover:underline">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <form action={signInAction.bind(null, undefined)}>
              <button className="h-12 rounded bg-primary px-4 font-semibold text-on-primary transition-opacity hover:opacity-90 active:translate-y-px">
                {DEMO_MODE ? "Sign in (demo)" : "Sign in with Google"}
              </button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
