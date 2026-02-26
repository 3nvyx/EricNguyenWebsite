import Link from "next/link";

const NAV_LINKS = [
  { label: "eric nguyen", href: "/" },
  { label: "projects", href: "#projects" },
  { label: "work", href: "#work" },
];

const CONTACT_LINKS = [
  { label: "resume", href: "#resume" },
  { label: "email", href: "mailto:your@email.com" },
  { label: "linked in", href: "https://linkedin.com" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">
      <nav className="fixed top-0 left-1/2 z-10 -translate-x-1/2 px-8 pt-8 md:px-12 md:pt-10">
        <div className="flex items-center text-sm font-normal leading-none text-zinc-800">
          {NAV_LINKS.map((item, i) => (
            <div key={item.href} className="flex items-center">
              {i > 0 && (
                <span className="mx-6 inline-block h-px w-10 bg-zinc-400 md:mx-10" aria-hidden />
              )}
              <Link
                href={item.href}
                className="whitespace-nowrap leading-none transition-colors hover:text-zinc-600"
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
      </nav>

      <main className="min-h-screen w-full bg-black md:pt-48">
        <section className="bg-white mx-auto px-12 max-w-7xl">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:items-start">
            {/* Left column: about + heading + paragraph */}
            <div className="space-y-5">
              <p className="text-sm font-normal tracking-wide text-black">
                about
              </p>
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl md:text-7xl">
                Eric
                <br />
                Nguyen
              </h1>
              <p className="max-w-md text-base font-normal leading-relaxed text-zinc-800">
                Lorem ipsum dolor sit amet consectetur adipiscing elit. Sit amet
                consectetur adipiscing elit quisque faucibus ex. Adipiscing elit
                quisque faucibus ex sapien vitae pellentesque.
              </p>
            </div>

            {/* Right column: photo box + links row */}
            <div className="flex flex-col items-start gap-6">
              <div className="h-72 w-72 shrink-0 rounded-sm bg-zinc-200 flex items-center justify-center">
                <span className="text-sm text-zinc-500">Photo</span>
              </div>
              <div className="flex items-center text-sm font-normal leading-none text-zinc-800">
                {CONTACT_LINKS.map((item, i) => (
                  <div key={item.label} className="flex items-center">
                    {i > 0 && (
                      <span className="mx-4 inline-block h-px w-8 shrink-0 bg-zinc-400" aria-hidden />
                    )}
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="transition-colors hover:text-zinc-600"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer: same contact links, bottom left */}
        <footer className="mt-20 md:mt-24">
          <ul className="flex items-center gap-2 text-sm font-normal text-zinc-800">
            {CONTACT_LINKS.map((item, i) => (
              <li key={item.label} className="flex items-center gap-2">
                {i > 0 && <span className="inline-block w-8 h-px bg-zinc-400 shrink-0" aria-hidden />}
                <Link
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hover:text-zinc-600 transition-colors"
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
