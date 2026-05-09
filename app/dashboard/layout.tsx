import type { ReactNode } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import CustomCursor from "../components/CustomCursor";
import DashboardNav from "./DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <CustomCursor />
      <div className="min-h-screen">
        <DashboardNav />
        <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto">{children}</main>
      </div>
    </>
  );
}
