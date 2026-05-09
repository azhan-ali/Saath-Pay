"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="sketch-btn !px-3 !py-2 shrink-0 inline-flex items-center gap-1"
      aria-label="Copy payment link"
      data-cursor-label={copied ? "copied!" : "copy link"}
    >
      {copied ? (
        <><Check size={16} className="text-accent-green" /> Copied!</>
      ) : (
        <Copy size={16} />
      )}
    </button>
  );
}
