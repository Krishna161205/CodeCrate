"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Store, FolderHeart, Settings, LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import Image from "next/image";

export default function SideNavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSeller = session?.user?.role === "SELLER";

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Marketplace", href: "/marketplace", icon: Store },
    { label: "My Vault", href: "/vault", icon: FolderHeart },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (isSeller) {
    // Insert Seller Dashboard right before Settings
    navItems.splice(3, 0, { label: "Seller Panel", href: "/seller", icon: LayoutDashboard });
  }

  return (
    <aside className="hidden md:flex flex-col h-full p-md bg-surface-container-lowest border-r border-white/10 w-64 z-50 shrink-0">
      {/* Brand Logo */}
      <div className="mb-xl">
        <Link href="/">
          <h1 className="font-display-lg text-2xl font-bold text-primary tracking-tight">CodeCrate</h1>
          <p className="text-on-surface-variant text-[13px] opacity-60">AI-First Marketplace</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-sm p-sm rounded-lg transition-all duration-200 group active:scale-98 ${
                isActive
                  ? "text-secondary font-bold bg-secondary-container/10 border-l-2 border-secondary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile and Controls */}
      <div className="mt-auto pt-md border-t border-white/5 space-y-md">
        {isSeller && (
          <Link
            href="/seller?tab=new"
            className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center gap-xs active:scale-95 duration-150 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Prompt</span>
          </Link>
        )}

        {session ? (
          <div className="space-y-sm">
            <div className="flex items-center gap-sm px-sm">
              <div className="w-10 h-10 rounded-full bg-surface-variant border border-white/10 overflow-hidden relative shrink-0">
                <Image
                  alt="User Profile"
                  src={session.user.avatar || "/default-avatar.png"}
                  fill
                  sizes="40px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-on-surface text-sm truncate">{session.user.name || "Developer"}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  isSeller ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                }`}>
                  {session.user.role || "BUYER"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: "/auth" })}
              className="w-full flex items-center gap-sm px-sm py-xs text-xs text-error hover:text-red-400 hover:bg-red-500/5 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="w-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-on-surface font-bold py-sm rounded-lg flex items-center justify-center gap-xs active:scale-95 duration-150 transition-all"
          >
            <span>Initialize Session</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
