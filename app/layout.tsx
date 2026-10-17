import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Josefin_Sans, Inter_Tight } from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["100"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
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
    <html lang="en">
      <body className={`${josefin.variable} ${interTight.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
