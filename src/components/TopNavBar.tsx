"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  ShieldAlert, 
  Store, 
  FolderHeart,
  ChevronDown
} from "lucide-react";
import useCartStore from "@/store/useCartStore";

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartItemsCount = useCartStore((state) => state.getItemsCount());

  const isSeller = session?.user?.role === "SELLER";
  const isAdmin = session?.user?.role === "ADMIN";

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/marketplace`);
    }
  };

  const handleSignOut = async () => {
    // Clear Zustand cart state
    useCartStore.getState().clearCart();
    // Clear NextAuth session and redirect to home "/"
    await signOut({ callbackUrl: "/" });
  };

  // Get active role badge styles
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "SELLER":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
    }
  };

  return (
    <>
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 z-40 bg-surface/10 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-lg py-sm shadow-sm gap-md">
        
        {/* Mobile Hamburger Trigger */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Input Panel */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative group focus-within:ring-2 focus-within:ring-secondary/50 rounded-lg transition-all bg-surface-container border border-white/5">
            <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none"
              placeholder="Search prompts, tools, or models..."
            />
          </div>
        </form>

        {/* Utility Actions */}
        <div className="flex items-center gap-md">
          {/* Wishlist Link */}
          <Link href="/vault?tab=wishlist" className="text-on-surface-variant hover:text-on-surface transition-colors p-1 relative hidden sm:block">
            <Heart className="w-5 h-5" />
          </Link>

          {/* Shopping Cart Trigger */}
          <Link href="/cart" className="text-on-surface-variant hover:text-on-surface transition-colors p-1 relative active:scale-95 duration-100">
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-on-secondary text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Notifications Mock */}
          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1 hidden sm:block">
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile Dropdown or Login Button */}
          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-xs focus:outline-none p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-surface-variant border border-white/10 overflow-hidden relative">
                  <Image
                    alt="User Profile"
                    src={session.user.avatar || "/default-avatar.png"}
                    fill
                    sizes="32px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <ChevronDown className="w-4 h-4 text-on-surface-variant hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-xs w-56 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl p-sm space-y-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-sm py-xs border-b border-white/5 pb-sm">
                    <p className="font-bold text-on-surface text-sm truncate">{session.user.name}</p>
                    <p className="text-xs text-on-surface-variant truncate opacity-60">{session.user.email}</p>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 ${getRoleBadge(session.user.role)}`}>
                      {session.user.role}
                    </span>
                  </div>

                  <div className="space-y-xs">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-sm px-sm py-sm rounded-lg text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {(isSeller || isAdmin) && (
                      <Link
                        href="/seller"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-sm px-sm py-sm rounded-lg text-xs text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Seller Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/vault"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-sm px-sm py-sm rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                    >
                      <FolderHeart className="w-4 h-4" />
                      <span>My Vault</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-sm px-sm py-sm rounded-lg text-xs text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-sm px-sm py-sm rounded-lg text-xs text-error hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer border-t border-white/5 pt-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="border border-white/10 hover:border-white/20 hover:bg-white/5 text-on-surface text-xs font-bold px-md py-2 rounded-lg transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Responsive Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></div>
          
          {/* Content Panel Drawer */}
          <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-surface-container-lowest border-r border-white/10 p-md z-50 animate-in slide-in-from-left duration-250">
            
            {/* Header / Brand Logo */}
            <div className="flex justify-between items-center mb-xl">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <h1 className="font-display-lg text-xl font-bold text-primary tracking-tight">CodeCrate</h1>
                <p className="text-on-surface-variant text-[11px] opacity-60">AI-First Marketplace</p>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Role-Based Nav Menu */}
            <nav className="flex-1 space-y-xs">
              <Link
                href="/marketplace"
                className="flex items-center gap-sm p-sm rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all"
              >
                <Store className="w-5 h-5" />
                <span>Marketplace</span>
              </Link>

              {session && (
                <>
                  <Link
                    href="/vault"
                    className="flex items-center gap-sm p-sm rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all"
                  >
                    <FolderHeart className="w-5 h-5" />
                    <span>My Vault</span>
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center gap-sm p-sm rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>My Cart ({cartItemsCount})</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-sm p-sm rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 font-semibold transition-all"
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              {(isSeller || isAdmin) && (
                <Link
                  href="/seller"
                  className="flex items-center gap-sm p-sm rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 font-semibold transition-all"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Seller Dashboard</span>
                </Link>
              )}

              <Link
                href="/settings"
                className="flex items-center gap-sm p-sm rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 transition-all"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </nav>

            {/* User Session bottom drawer segment */}
            <div className="pt-md border-t border-white/5 space-y-md">
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
                      <p className="font-bold text-on-surface text-sm truncate">{session.user.name}</p>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${getRoleBadge(session.user.role)}`}>
                        {session.user.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-sm px-sm py-sm text-xs text-error hover:text-red-400 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Session</span>
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

          </div>
        </div>
      )}
    </>
  );
}
