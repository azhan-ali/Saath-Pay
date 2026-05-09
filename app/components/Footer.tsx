"use client";

import { Heart } from "lucide-react";

// Inline SVG icons (lucide-react dropped brand marks for trademark reasons)
function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .296C5.373.296 0 5.67 0 12.297c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.086 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.762-1.604-2.666-.303-5.467-1.333-5.467-5.933 0-1.31.468-2.382 1.236-3.222-.124-.303-.536-1.524.117-3.176 0 0 1.008-.323 3.3 1.23.957-.266 1.984-.4 3.003-.404 1.02.004 2.047.138 3.006.404 2.29-1.553 3.296-1.23 3.296-1.23.655 1.652.243 2.873.12 3.176.77.84 1.235 1.913 1.235 3.222 0 4.61-2.804 5.625-5.478 5.922.43.372.812 1.103.812 2.222 0 1.606-.015 2.9-.015 3.293 0 .32.217.695.825.577C20.565 22.092 24 17.597 24 12.297 24 5.67 18.627.296 12 .296z" />
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t-[3px] border-dashed border-ink/40 mt-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Logo + tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px_15px_13px_16px] bg-accent-orange border-[2.5px] border-ink shadow-[2px_2px_0_#1a1a1a]">
                <span
                  className="font-[family-name:var(--font-marker)] text-xl text-white"
                  style={{ textShadow: "1px 1px 0 #1a1a1a" }}
                >
                  S
                </span>
              </div>
              <span className="font-[family-name:var(--font-marker)] text-2xl text-ink">
                SaathPay
              </span>
              <span>🇮🇳</span>
            </div>
            <p className="font-[family-name:var(--font-hand)] text-xl text-accent-orange mb-2">
              Saath Kaam, Saath Payment
            </p>
            <p className="font-[family-name:var(--font-body)] text-sm text-ink-soft max-w-sm">
              Programmable stablecoin payment rails built on Solana. Powered by
              Dodo Payments.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-[family-name:var(--font-marker)] text-lg text-ink mb-3">
              Product
            </h4>
            <ul className="space-y-2 font-[family-name:var(--font-body)] text-sm text-ink-soft">
              <li>
                <a href="#features" className="hover:text-accent-orange">
                  Features
                </a>
              </li>
              <li>
                <a href="#how" className="hover:text-accent-orange">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-accent-orange">
                  Why SaathPay
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-accent-orange">
                  Demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-[family-name:var(--font-marker)] text-lg text-ink mb-3">
              Built On
            </h4>
            <ul className="space-y-2 font-[family-name:var(--font-body)] text-sm text-ink-soft">
              <li>Solana</li>
              <li>Dodo Payments</li>
              <li>Google Gemini</li>
              <li>x402 Protocol</li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-dashed border-ink/30">
          <p className="font-[family-name:var(--font-sketch)] text-sm text-ink-soft flex items-center gap-1.5">
            Made with{" "}
            <Heart size={14} fill="currentColor" className="text-accent-pink" />{" "}
            in India for the Dodo × Superteam hackathon
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="h-9 w-9 rounded-[10px_12px_11px_13px] border-[2px] border-ink flex items-center justify-center bg-paper hover:bg-accent-yellow transition-colors"
              aria-label="Twitter"
            >
              <TwitterIcon size={15} />
            </a>
            <a
              href="#"
              className="h-9 w-9 rounded-[10px_12px_11px_13px] border-[2px] border-ink flex items-center justify-center bg-paper hover:bg-accent-orange hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={16} />
            </a>
            <a
              href="#"
              className="h-9 w-9 rounded-[10px_12px_11px_13px] border-[2px] border-ink flex items-center justify-center bg-paper hover:bg-accent-green hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
