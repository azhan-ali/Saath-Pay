"use client";

import { type ReactNode } from "react";
import SolanaProvider from "./SolanaProvider";

/**
 * All client-side providers that need to wrap the entire app.
 * Add more providers here as we move through phases (e.g. Theme, Toaster).
 */
export default function Providers({ children }: { children: ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
