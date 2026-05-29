"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, Terminal, SlidersHorizontal, Search, Sparkles } from "lucide-react";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Active filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedModel, setSelectedModel] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(100);

  const categories = [
    { name: "All Domains", slug: "" },
    { name: "Coding Prompts", slug: "coding-prompts" },
    { name: "Data Analysis", slug: "data-analysis" },
    { name: "Academic Tools", slug: "academic-tools" },
    { name: "High-Fidelity Visuals", slug: "visuals" },
  ];

  const models = ["All Models", "GPT-4o", "Claude 3.5 Sonnet", "Midjourney V6", "Gemini 1.5 Pro"];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set("q", searchQuery);
        if (selectedCategory) queryParams.set("category", selectedCategory);
        if (selectedModel && selectedModel !== "All Models") queryParams.set("model", selectedModel);
        queryParams.set("maxPrice", maxPrice.toString());

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchQuery, selectedCategory, selectedModel, maxPrice]);

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto">
      {/* Page Header */}
      <section className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
            Catalog
          </span>
          <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
            Explore Prompts
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm">
            Access pre-validated instructions optimized for modern LLMs.
          </p>
        </div>
      </section>

      {/* Main split dashboard panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
        {/* Left column filters */}
        <aside className="lg:col-span-1 space-y-lg glass glass-shine p-md rounded-xl h-fit">
          <div className="flex items-center gap-xs text-on-surface font-semibold border-b border-white/5 pb-sm">
            <SlidersHorizontal className="w-4 h-4 text-secondary" />
            <span>Refine Search</span>
          </div>

          {/* Search bar inside filter */}
          <div className="space-y-xs">
            <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
              Search Text
            </label>
            <div className="relative bg-surface-container border border-white/5 rounded-lg">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-1.5 text-xs text-on-surface focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* Categories select */}
          <div className="space-y-sm">
            <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider block">
              Specialized Domains
            </label>
            <div className="flex flex-col gap-xs">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left text-xs py-1.5 px-xs rounded transition-colors w-full cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-secondary-container/15 text-secondary font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Models select */}
          <div className="space-y-xs">
            <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider block">
              AI Engine Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-surface-container border border-white/10 rounded-lg text-xs py-1.5 px-sm text-on-surface focus:ring-0 focus:outline-none focus:border-secondary"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Price slider */}
          <div className="space-y-xs">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-code-sm text-secondary font-bold">${maxPrice}.00</span>
            </div>
            <input
              type="range"
              min="5"
              max="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>
        </aside>

        {/* Right column listings grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass glass-shine rounded-xl p-md h-[220px] animate-pulse flex flex-col gap-sm">
                  <div className="aspect-video bg-white/5 rounded-lg w-full h-24"></div>
                  <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-xl glass rounded-xl border border-white/5">
              <Sparkles className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-md animate-bounce" />
              <p className="text-on-surface-variant font-semibold text-sm">
                No prompt templates matched your filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedModel("");
                  setSearchQuery("");
                  setMaxPrice(100);
                }}
                className="mt-md text-xs text-secondary hover:underline font-bold"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/marketplace/${product.slug}`}
                  className="glass glass-shine rounded-xl p-md flex flex-col group hover:border-secondary/40 transition-all duration-300 active:scale-[0.99]"
                >
                  {/* Thumbnail and score */}
                  <div className="aspect-video bg-surface-container-high border border-white/5 rounded-lg relative overflow-hidden mb-sm shrink-0 shadow-inner">
                    <Image
                      alt={product.title}
                      src={product.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
                      fill
                      sizes="(max-width: 768px) 100vw, 30vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-103"
                      unoptimized
                    />
                    <div className="absolute top-xs right-xs px-xs py-0.5 bg-black/80 backdrop-blur rounded font-code-sm text-[10px] text-tertiary flex items-center gap-0.5 font-bold">
                      <Star className="w-3 h-3 fill-tertiary text-tertiary shrink-0" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Metadata info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-xs mb-1">
                        <span className="bg-secondary-container/10 text-secondary px-xs py-[2px] rounded text-[9px] font-label-caps border border-secondary-container/20 font-bold shrink-0">
                          {product.model}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium truncate">
                          {product.category?.name}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-on-surface group-hover:text-secondary transition-colors leading-tight line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-md pt-sm border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant">
                        By {product.seller?.companyName || product.seller?.user?.name || "Verified Creator"}
                      </span>
                      <span className="font-code-sm text-sm font-bold text-on-surface select-none">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
