import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers/Providers";

export const metadata: Metadata = {
  title: "SaathPay — Saath Kaam, Saath Payment 🇮🇳",
  description:
    "Get Paid in Seconds. Not Days. Not Weeks. Seconds. Programmable stablecoin payment rails for Indian freelancers, SMEs & AI agents. Built on Solana, powered by Dodo Payments.",
  keywords: [
    "SaathPay",
    "stablecoin payments",
    "Solana",
    "Dodo Payments",
    "freelancer payments India",
    "USDC escrow",
    "milestone payments",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* Global SVG filter for wobbly borders */}
        <svg
          aria-hidden
          width="0"
          height="0"
          style={{ position: "absolute" }}
        >
          <defs>
            <filter id="wobble">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02"
                numOctaves="3"
                seed="7"
              />
              <feDisplacementMap in="SourceGraphic" scale="2.5" />
            </filter>
            <filter id="rough">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04"
                numOctaves="2"
                seed="3"
              />
              <feDisplacementMap in="SourceGraphic" scale="1.5" />
            </filter>
          </defs>
        </svg>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
