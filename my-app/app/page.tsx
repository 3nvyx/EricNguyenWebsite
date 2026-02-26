"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PHOTO_HEADSHOT = "/Eric_Nguyen_Headshot%201.png";
const PHOTO_DRAWING = "/Headshot_Drawing.png";

const NAV_LINKS = [
  { label: "eric nguyen", href: "/" },
  { label: "projects", href: "/projects" },
  { label: "work", href: "/work" },
];

const CONTACT_LINKS = [
  { label: "resume", href: "/Resume_Eric_Nguyen_Feb_25_2026.pdf" },
  { label: "email", href: "mailto:envn001@gmail.com" },
  { label: "linked in", href: "https://www.linkedin.com/in/ericnguyen342/" },
];

const openInNewTab = (href: string) => href.startsWith("http");

export default function Home() {
  const pathname = usePathname();
  const [photoSrc, setPhotoSrc] = useState(PHOTO_HEADSHOT);

  const isDrawing = photoSrc === PHOTO_DRAWING;
  const togglePhoto = () =>
    setPhotoSrc(isDrawing ? PHOTO_HEADSHOT : PHOTO_DRAWING);

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

      <main className="flex min-h-screen w-full flex-col items-center justify-center px-6 pt-28 pb-12 md:px-20 md:pt-32 md:pb-0">
        <section className="w-full bg-white p-0">
          <div className="grid grid-cols-1 gap-12 md:gap-16 md:grid-cols-2 md:items-start">
            {/* Left column: about + heading + paragraph */}
            <div className="flex min-h-full flex-col items-start justify-center">
              <p className="text-sm font-normal tracking-wide text-black mb-1">
                about
              </p>
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-7xl md:text-8xl lg:text-9xl mb-5">
                <span className="block mt-2">Eric</span>
                <span className="block mt-5">Nguyen</span>
              </h1>
              <p className="max-w-md mt-5 text-base font-normal leading-relaxed sm:text-lg">
                Hello! <br /> I enjoy building, leading, and figuring things out as I go. 
                Over time that has meant organizing events, creating software, and helping people work more efficiently. 
                I care about impact and growth, both technically and personally. 
                If you are curious or just want to connect, feel free to reach out.
              </p>
            </div>

            {/* Right column: photo box + links row, vertically centered */}
            <div className="flex min-h-full flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                <button
                  type="button"
                  onClick={togglePhoto}
                  className="relative h-64 w-64 shrink-0 cursor-pointer overflow-hidden rounded-sm bg-zinc-200 sm:h-80 sm:w-80 md:h-[24rem] md:w-[24rem] focus:outline-none"
                  aria-label={isDrawing ? "Show photo" : "Show drawing"}
                >
                  <Image
                    src={photoSrc}
                    alt={isDrawing ? "Eric Nguyen (drawing)" : "Eric Nguyen"}
                    fill
                    className="object-cover transition-opacity duration-200"
                    sizes="(max-width: 640px) 16rem, (max-width: 768px) 20rem, 24rem"
                    priority
                  />
                </button>
                <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-normal leading-none text-zinc-800 md:gap-16">
                  {CONTACT_LINKS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={openInNewTab(item.href) ? "_blank" : undefined}
                      rel={openInNewTab(item.href) ? "noopener noreferrer" : undefined}
                      className="transition-colors hover:text-zinc-600 hover:underline"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer: same contact links, bottom left */}
        <footer className="mt-12 w-full self-start md:mt-24">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-normal text-zinc-800 md:gap-16">
            {CONTACT_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  target={openInNewTab(item.href) ? "_blank" : undefined}
                  rel={openInNewTab(item.href) ? "noopener noreferrer" : undefined}
                  className="transition-colors hover:text-zinc-600 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </main>
    </div>
  );
}