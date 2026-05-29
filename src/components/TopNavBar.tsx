"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingCart, Heart, Bell } from "lucide-react";
import useCartStore from "@/store/useCartStore";

export default function TopNavBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const cartItemsCount = useCartStore((state) => state.getItemsCount());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/marketplace`);
    }
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 z-40 bg-surface/10 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-lg py-sm shadow-sm">
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
        <Link href="/vault?tab=wishlist" className="text-on-surface-variant hover:text-on-surface transition-colors p-1 relative">
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
        <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
