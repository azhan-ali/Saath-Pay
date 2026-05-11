"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  Bot,
  BarChart3,
  Settings,
  Wallet,
  Sparkles,
} from "lucide-react";

const links = [
  { href: "/dashboard",              label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/projects",     label: "Projects",    icon: FolderOpen      },
  { href: "/dashboard/projects/new", label: "New Project", icon: PlusCircle      },
  { href: "/dashboard/wallet",       label: "Wallet",      icon: Wallet          },
  { href: "/dashboard/ai-test",      label: "AI Generator",icon: Sparkles        },
  { href: "/dashboard/agents",       label: "AI Agents",   icon: Bot             },
  { href: "/dashboard/analytics",    label: "Analytics",   icon: BarChart3       },
  { href: "/dashboard/settings",     label: "Settings",    icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0">
      <nav className="sketch-card bg-paper sticky top-24 flex flex-col gap-1 p-3">
        <p className="font-[family-name:var(--font-hand)] text-sm text-ink-soft px-2 mb-2">
          ~ navigation ~
        </p>
        {links.map((l) => {
          const Icon = l.icon;
          const active =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px_13px_11px_14px] font-[family-name:var(--font-sketch)] text-base transition-all ${
                active
                  ? "bg-accent-yellow shadow-[2px_2px_0_#1a1a1a] text-ink font-bold"
                  : "text-ink-soft hover:bg-paper-dark hover:text-ink"
              }`}
            >
              <Icon size={18} strokeWidth={2.5} />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
