import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Unbounded, Instrument_Sans } from "next/font/google";
import { Footer } from "@/components/footer";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500"],
});

// Stand-in for TWK Everett until there's a web license; swap it in globals.css (--font-text).
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400"],
});

const SITE_URL = "https://ericnguyenn.me";
const SITE_TITLE = "Eric Nguyen — Product Engineer";
const SITE_DESCRIPTION =
  "I make things people actually pick up and use. I sit with someone doing a job the slow way, find the part that hurts, and make it disappear, in code, in hardware, or both.";
// Same portrait as the About page.
const SITE_IMAGE = { url: "/eric-portrait.jpg", width: 800, height: 1201, alt: "Eric Nguyen" };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Eric Nguyen",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Eric Nguyen",
    locale: "en_US",
    type: "website",
    images: [SITE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [SITE_IMAGE],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${unbounded.variable} ${instrumentSans.variable}`}>
      <body className="fw">
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
