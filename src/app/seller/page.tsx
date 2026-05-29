"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Plus, Sparkles, LayoutDashboard, Sliders, Settings, DollarSign, Archive, HelpCircle, FileText, Check, Trash2 } from "lucide-react";

export default function SellerPage() {
  const { data: session, status } = useSession();
  const [activeSubTab, setActiveSubTab] = useState<"listings" | "create">("listings");
  
  // Analytics and products list state
  const [stats, setStats] = useState<any>({ totalSales: 0, totalOrders: 0, totalEarnings: 0, listedProductsCount: 0 });
  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [model, setModel] = useState("GPT-4o");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "SELLER") {
      const loadSellerDashboard = async () => {
        try {
          // Fetch analytics
          const statsRes = await fetch("/api/seller/analytics");
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }

          // Fetch categories for product form
          const catRes = await fetch("/api/products"); // querying products can trigger category load or we fetch catalog
          // Alternatively, let's load a standard fallback list of seeded categories
          // We can fetch category list or seed them in state. Let's seed categories state for 100% robust render:
          setCategories([
            { id: "coding", name: "Coding Prompts" },
            { id: "data", name: "Data Analysis" },
            { id: "academic", name: "Academic Tools" },
            { id: "visuals", name: "High-Fidelity Visuals" },
          ]);

          // Fetch listings
          const listingsRes = await fetch("/api/products");
          if (listingsRes.ok) {
            const allProducts = await listingsRes.json();
            // Filter to products belonging to this user
            const sellerListings = allProducts.filter((p: any) => p.seller?.user?.name === session?.user?.name);
            setListings(sellerListings);
          }
        } catch (err) {
          console.error("Dashboard failed to load:", err);
        } finally {
          setLoading(false);
        }
      };
      loadSellerDashboard();
    } else if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "SELLER")) {
      setLoading(false);
    }
  }, [status, session]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    setFormLoading(true);

    try {
      const selectedCat = categories.find(c => c.name === categoryId || c.id === categoryId);
      // Fallback matching
      const resolvedCatId = selectedCat?.id || "coding";

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          promptContent,
          model,
          categoryId: resolvedCatId === "coding" ? "coding-prompts" : resolvedCatId, // match seeded slugs/uuids
          imageUrl: imageUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create listing.");
      }

      setFormSuccess(true);
      setTitle("");
      setDescription("");
      setPrice("");
      setPromptContent("");
      setImageUrl("");
      setActiveSubTab("listings");

      // Reload listings and stats
      const listingsRes = await fetch("/api/products");
      if (listingsRes.ok) {
        const allProducts = await listingsRes.json();
        const sellerListings = allProducts.filter((p: any) => p.seller?.user?.name === session?.user?.name);
        setListings(sellerListings);
      }
      const statsRes = await fetch("/api/seller/analytics");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err: any) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteListing = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setListings(listings.filter((l) => l.id !== productId));
        // Refresh stats
        const statsRes = await fetch("/api/seller/analytics");
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  // Enforce BUYER block, rendering applying creator redirect card
  if (status === "unauthenticated" || session?.user?.role !== "SELLER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-md">
        <div className="max-w-md text-center glass glass-shine p-lg rounded-2xl space-y-md">
          <LayoutDashboard className="w-12 h-12 text-tertiary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-on-surface">Creator Privileges Required</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Sellers can post high-performance prompt architectures, view sales analytics, and manage listed developer assets. Become a creator inside settings!
          </p>
          <Link
            href="/settings"
            className="w-full bg-gradient-to-r from-secondary to-tertiary text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer"
          >
            Become a Creator Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-md">
        <div>
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
            Creator Command Center
          </span>
          <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
            Seller Dashboard
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Publish prompt instructions, manage active listings, and audit earnings.
          </p>
        </div>
      </section>

      {/* Simplified MVP Analytics Dashboard Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Total Sales */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-secondary/35 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full shrink-0 flex items-center justify-center text-secondary">
            <Archive className="w-6 h-6 rotate-12" />
          </div>
          <span className="font-label-caps text-[10px] text-on-surface-variant font-bold tracking-wider uppercase block mb-1">
            Total Sales
          </span>
          <span className="text-3xl font-bold text-on-surface font-code-sm">{stats.totalSales}</span>
          <p className="text-[10px] text-on-surface-variant mt-2">Successful prompt asset downloads</p>
        </div>

        {/* Total Orders */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-tertiary/35 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary/5 rounded-bl-full shrink-0 flex items-center justify-center text-tertiary">
            <FileText className="w-6 h-6 rotate-12" />
          </div>
          <span className="font-label-caps text-[10px] text-on-surface-variant font-bold tracking-wider uppercase block mb-1">
            Total Orders
          </span>
          <span className="text-3xl font-bold text-on-surface font-code-sm">{stats.totalOrders}</span>
          <p className="text-[10px] text-on-surface-variant mt-2">Unique shopping cart invoices</p>
        </div>

        {/* Total Earnings */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-emerald-500/35 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full shrink-0 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6 rotate-12" />
          </div>
          <span className="font-label-caps text-[10px] text-on-surface-variant font-bold tracking-wider uppercase block mb-1">
            Total Earnings
          </span>
          <span className="text-3xl font-bold text-secondary font-code-sm">${Number(stats.totalEarnings).toFixed(2)}</span>
          <p className="text-[10px] text-on-surface-variant mt-2">Calculated net seller revenues</p>
        </div>
      </section>

      {/* Sub Tabs: Manage vs Create */}
      <section className="space-y-lg">
        <div className="flex gap-md border-b border-white/5 pb-sm">
          <button
            onClick={() => setActiveSubTab("listings")}
            className={`text-sm font-semibold tracking-wide cursor-pointer transition-colors relative pb-sm ${
              activeSubTab === "listings" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>My Listings ({listings.length})</span>
            {activeSubTab === "listings" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary"></span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("create")}
            className={`text-sm font-semibold tracking-wide cursor-pointer transition-colors relative pb-sm ${
              activeSubTab === "create" ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="flex items-center gap-1">
              <Plus className="w-4 h-4 shrink-0" />
              <span>Create New Listing</span>
            </span>
            {activeSubTab === "create" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary"></span>
            )}
          </button>
        </div>

        {/* Listings tab */}
        {activeSubTab === "listings" && (
          listings.length === 0 ? (
            <div className="text-center py-16 glass rounded-xl border border-white/5 space-y-sm">
              <Archive className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
              <p className="text-xs text-on-surface-variant">
                You haven't listed any prompts in the marketplace yet. Let's create your first!
              </p>
              <button
                onClick={() => setActiveSubTab("create")}
                className="mt-xs bg-secondary text-on-secondary font-bold text-xs py-1.5 px-md rounded-lg active:scale-95 transition-all cursor-pointer"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {listings.map((item) => (
                <div key={item.id} className="glass p-md rounded-xl flex items-center justify-between gap-md hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-md overflow-hidden">
                    <div className="w-12 h-12 bg-surface-container border border-white/10 rounded-lg overflow-hidden relative shrink-0">
                      <img
                        alt={item.title}
                        src={item.thumbnail}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[9px] text-secondary font-semibold font-label-caps uppercase">{item.model}</span>
                      <h4 className="text-sm font-bold text-on-surface truncate leading-tight mt-0.5">{item.title}</h4>
                      <span className="font-code-sm text-xs text-on-surface-variant font-medium">${Number(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteListing(item.id)}
                    className="p-sm text-on-surface-variant hover:text-error hover:bg-error-container/10 border border-white/5 hover:border-error/20 rounded-lg transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Create new Prompt listing form tab */}
        {activeSubTab === "create" && (
          <form onSubmit={handleCreateListing} className="glass glass-shine p-lg rounded-2xl space-y-lg shadow-xl max-w-3xl">
            {formError && (
              <div className="p-sm bg-error-container/10 border border-error/20 rounded-lg text-error text-xs">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* Title */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                  Listing Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                  placeholder="e.g. Next.js Boilerplate Builder"
                />
              </div>

              {/* Price */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                  Pricing (Decimal USD)
                </label>
                <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-xs text-on-surface-variant/70 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2 text-xs text-on-surface focus:ring-0 focus:outline-none"
                    placeholder="24.00"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider block">
                  Marketplace Domain Category
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg text-xs py-2 px-md text-on-surface focus:ring-0 focus:outline-none focus:border-secondary"
                >
                  <option value="">Select Domain...</option>
                  <option value="coding-prompts">Coding Prompts</option>
                  <option value="data-analysis">Data Analysis</option>
                  <option value="academic-tools">Academic Tools</option>
                  <option value="visuals">High-Fidelity Visuals</option>
                </select>
              </div>

              {/* AI Model */}
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider block">
                  Target AI Engine Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-surface-container border border-white/10 rounded-lg text-xs py-2 px-md text-on-surface focus:ring-0 focus:outline-none focus:border-secondary"
                >
                  <option value="GPT-4o">GPT-4o</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="Midjourney V6">Midjourney V6</option>
                  <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-xs">
              <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                Listing Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40 leading-relaxed font-sans"
                placeholder="Inspected features, capabilities, instructions, and mock outcomes..."
              />
            </div>

            {/* screenshots URL mock */}
            <div className="space-y-xs">
              <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider">
                Screenshot / Media Cover URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2 text-xs text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                placeholder="https://images.unsplash.com/... (optional fallback cover applied)"
              />
            </div>

            {/* Sensitive Prompt Content */}
            <div className="space-y-xs">
              <label className="text-xs font-semibold text-on-surface-variant font-label-caps uppercase tracking-wider flex items-center justify-between">
                <span>Raw Prompt Instructions (AES-256 Encrypted on DB Write)</span>
                <span className="text-[10px] text-tertiary font-bold tracking-widest lowercase border border-tertiary/20 bg-tertiary/5 px-1 rounded font-label-caps select-none">SECURE KEYLOCK</span>
              </label>
              <textarea
                required
                rows={5}
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2 text-xs text-secondary focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40 leading-normal font-mono"
                placeholder="SYSTEM PROMPT: You are a senior engineer... Enforce strict copy-on-write variables..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-gradient-to-r from-secondary via-tertiary to-on-tertiary-container hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg active:scale-98 transition-all shadow-lg flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer text-xs font-sans"
            >
              {formLoading ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <>
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Publish Prompt Template</span>
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
