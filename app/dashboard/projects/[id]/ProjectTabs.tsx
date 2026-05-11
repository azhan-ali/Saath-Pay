"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Bot } from "lucide-react";

interface ProjectTabsProps {
  activeTab: string;
  projectId: string;
  agentCount: number;
}

export default function ProjectTabs({ activeTab, projectId, agentCount }: ProjectTabsProps) {
  const tabs = [
    {
      id: "milestones",
      label: "🎯 Milestones",
      icon: Target,
      href: `/dashboard/projects/${projectId}`,
    },
    {
      id: "agents",
      label: "🤖 AI Agents",
      icon: Bot,
      href: `/dashboard/projects/${projectId}?tab=agents`,
      badge: agentCount > 0 ? agentCount : null,
    },
  ];

  return (
    <div className="flex gap-2 border-b-[3px] border-ink pb-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`relative px-4 py-2.5 font-[family-name:var(--font-marker)] text-base transition-all inline-flex items-center gap-2 rounded-t-[10px_12px_0_0] border-[3px] border-b-0 ${
              isActive
                ? "bg-paper border-ink text-ink shadow-[3px_-3px_0_#1a1a1a] -mb-[3px] z-10"
                : "bg-paper-dark border-ink/40 text-ink-soft hover:bg-paper hover:border-ink/70"
            }`}
          >
            {tab.label}
            {tab.badge !== null && tab.badge !== undefined && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-purple text-white font-[family-name:var(--font-sketch)] text-xs">
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
