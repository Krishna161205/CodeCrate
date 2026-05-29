"use client";

import { usePathname } from "next/navigation";
import SideNavBar from "./SideNavBar";
import TopNavBar from "./TopNavBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Fully fullscreen routes with no dashboard shell
  const isAuthPage = pathname === "/auth";

  if (isAuthPage) {
    return <div className="min-h-screen bg-background text-on-surface">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface">
      {/* Shared Side Navigation Panel */}
      <SideNavBar />
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto pt-16 relative bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
