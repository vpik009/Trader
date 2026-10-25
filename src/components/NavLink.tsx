"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const current = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`flex h-12 items-center rounded px-1 font-medium sm:px-2 underline-offset-8 hover:underline ${
        current ? "underline decoration-accent decoration-4" : ""
      }`}
    >
      {children}
    </Link>
  );
}
