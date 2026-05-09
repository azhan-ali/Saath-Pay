import type { ReactNode } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import CustomCursor from "../components/CustomCursor";
import DashboardNav from "./DashboardNav";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <div className="min-h-screen">
        <DashboardNav />
        {/* Page body: sidebar + main content */}
        <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto flex gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </>
  );
}
