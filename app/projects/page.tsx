"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "eric nguyen", href: "/" },
  { label: "projects", href: "/projects" },
  { label: "work", href: "/work" },
];

export default function ProjectsPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      <nav className="fixed top-0 left-1/2 z-10 -translate-x-1/2 px-4 pt-6 text-xs md:px-12 md:pt-10 md:text-sm">
        <div className="flex items-center font-normal leading-none text-zinc-800">
          {NAV_LINKS.map((item, i) => (
            <div key={item.href} className="flex items-center">
              {i > 0 && (
                <span className="mx-3 inline-block h-px w-6 bg-zinc-400 md:mx-10 md:w-10" aria-hidden />
              )}
              <Link
                href={item.href}
                className={`whitespace-nowrap leading-none transition-colors hover:text-zinc-600 hover:underline ${
                  pathname === item.href ? "font-bold" : ""
                }`}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </nav>

      <main className="flex min-h-screen w-full flex-col items-center justify-center px-6">
        <p className="text-xl text-zinc-500 md:text-2xl">Work in progress.</p>
        <Link
          href="/"
          className="mt-6 text-sm text-zinc-800 underline transition-colors hover:text-zinc-600"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
