import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Unbounded, Instrument_Sans } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
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

export const metadata: Metadata = {
  title: {
    default: "Eric Nguyen",
    template: "%s | Eric Nguyen",
  },
  description: "Eric Nguyen. Slap, Honors, Sevis, Daisy, Carousel.",
  openGraph: {
    images: [
      {
        url: "/3nvyxScreenshoot.png",
        width: 1200,
        height: 630,
        alt: "Eric Nguyen",
      },
    ],
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
        <Sidebar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
