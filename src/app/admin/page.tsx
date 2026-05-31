"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Users, 
  ShieldCheck, 
  ShoppingBag, 
  DollarSign, 
  Search, 
  Trash2, 
  XCircle, 
  Activity, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  UserMinus, 
  UserPlus,
  Archive,
  Loader2,
  Lock,
  Unlock,
  Check,
  X
} from "lucide-react";

type TabType = "overview" | "users" | "sellers" | "products" | "monitor";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // Filtering & Search states
  const [userQuery, setUserQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [productFilter, setProductFilter] = useState<"all" | "reported" | "archived">("all");
  
  // Page level loaders
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Action loaders
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [actionSellerId, setActionSellerId] = useState<string | null>(null);
  const [actionProductId, setActionProductId] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setRefreshing(true);
      
      // 1. Fetch Analytics
      const analRes = await fetch("/api/admin/analytics");
      if (analRes.ok) {
        const analData = await analRes.json();
        setAnalytics(analData);
      }

      // 2. Fetch Users
      const usersRes = await fetch(`/api/admin/users?q=${encodeURIComponent(userQuery)}&role=${userRoleFilter}`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      // 3. Fetch Sellers
      const sellersRes = await fetch("/api/admin/sellers");
      if (sellersRes.ok) {
        const sellersData = await sellersRes.json();
        setSellers(sellersData);
      }

      // 4. Fetch Products
      const productsRes = await fetch(`/api/admin/products?filter=${productFilter}`);
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchAllData();
    } else if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      setLoading(false);
    }
  }, [status, session, userRoleFilter, productFilter]);

  // Live trigger on userQuery with debounce-like behavior
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      const delayDebounce = setTimeout(() => {
        fetchAllData();
      }, 300);
      return () => clearTimeout(delayDebounce);
    }
  }, [userQuery]);

  // User Actions
  const handleToggleUserSuspension = async (userId: string, currentSuspension: boolean) => {
    try {
      setActionUserId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, suspended: !currentSuspension })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, suspended: !currentSuspension } : u));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update suspension status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionUserId(null);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      setActionUserId(userId);
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to change role.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user account? All associated orders and activities will be destroyed.")) return;
    try {
      setActionUserId(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete user account.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionUserId(null);
    }
  };

  // Seller Actions
  const handleToggleSellerVerify = async (sellerId: string, currentVerify: boolean) => {
    try {
      setActionSellerId(sellerId);
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, verified: !currentVerify })
      });
      if (res.ok) {
        setSellers(sellers.map(s => s.id === sellerId ? { ...s, verified: !currentVerify } : s));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update verification status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionSellerId(null);
    }
  };

  const handleRejectSeller = async (sellerId: string) => {
    if (!confirm("Rejecting this seller will delete their Creator Profile and demote their user account back to Buyer. Active listings owned by this seller will be removed. Proceed?")) return;
    try {
      setActionSellerId(sellerId);
      const res = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, action: "reject" })
      });
      if (res.ok) {
        setSellers(sellers.filter(s => s.id !== sellerId));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to reject seller profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionSellerId(null);
    }
  };

  // Product Actions
  const handleToggleProductArchive = async (productId: string, currentArchive: boolean) => {
    try {
      setActionProductId(productId);
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, archived: !currentArchive })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === productId ? { ...p, archived: !currentArchive } : p));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update product archive status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProductId(null);
    }
  };

  const handleToggleProductReport = async (productId: string, currentReport: boolean) => {
    try {
      setActionProductId(productId);
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reported: !currentReport })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === productId ? { ...p, reported: !currentReport } : p));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update product moderation report.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProductId(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product template permanently?")) return;
    try {
      setActionProductId(productId);
      const res = await fetch(`/api/admin/products?productId=${productId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete product template.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProductId(null);
    }
  };

  // Rendering Loader States
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-md">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        <p className="text-on-surface-variant text-sm tracking-wide">Synthesizing command node...</p>
      </div>
    );
  }

  // Enforce unauthorized page view if non-admin attempts access
  if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-md">
        <div className="max-w-md text-center glass glass-shine p-lg rounded-2xl space-y-md border border-error/20">
          <XCircle className="w-16 h-16 text-error mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-on-surface">403 Unauthorized Access</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Administrative terminal access is strictly prohibited. Your IP address and credential coordinates have been logged to the central monitor system.
          </p>
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-error/80 to-red-600 hover:brightness-110 text-white font-bold py-sm rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer"
          >
            Evacuate to Safety
          </Link>
        </div>
      </div>
    );
  }

  // Ready metrics variables with fallbacks
  const metrics = analytics?.metrics || {
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0
  };

  const monitor = analytics?.monitor || {
    recentRegistrations: [],
    recentOrders: [],
    recentProductUploads: []
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded";
      case "SELLER":
        return "bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded";
      default:
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded";
    }
  };

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      
      {/* Brand Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
        <div>
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            System Control Terminal
          </span>
          <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
            Admin command center
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Oversee user coordinates, verify creator applications, moderate listings, and monitor live metrics.
          </p>
        </div>

        <button 
          onClick={fetchAllData}
          disabled={refreshing}
          className="bg-surface-container border border-white/10 hover:border-white/20 text-on-surface px-md py-sm rounded-lg text-xs font-semibold flex items-center gap-sm active:scale-95 duration-100 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Database</span>
        </button>
      </section>

      {/* Overview Analytics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        
        {/* Total Users */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5 translate-x-1.5 -translate-y-1.5" />
          </div>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
            Total Accounts
          </span>
          <span className="text-3xl font-bold text-on-surface font-code-sm">{metrics.totalUsers}</span>
          <div className="text-[10px] text-blue-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{metrics.newUsersThisMonth} new this month</span>
          </div>
        </div>

        {/* Total Creators */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5 translate-x-1.5 -translate-y-1.5" />
          </div>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
            Verified Creators
          </span>
          <span className="text-3xl font-bold text-on-surface font-code-sm">{metrics.totalSellers}</span>
          <p className="text-[10px] text-on-surface-variant mt-2">Active prompt architects</p>
        </div>

        {/* Total Prompts Listed */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-teal-500/30 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-bl-full flex items-center justify-center text-teal-400">
            <ShoppingBag className="w-5 h-5 translate-x-1.5 -translate-y-1.5" />
          </div>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
            Prompt Catalog
          </span>
          <span className="text-3xl font-bold text-on-surface font-code-sm">{metrics.totalProducts}</span>
          <p className="text-[10px] text-on-surface-variant mt-2">Listed AI architectures</p>
        </div>

        {/* Total revenue */}
        <div className="glass glass-shine p-lg rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5 translate-x-1.5 -translate-y-1.5" />
          </div>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1">
            Marketplace Volume
          </span>
          <span className="text-3xl font-bold text-amber-400 font-code-sm">${metrics.totalRevenue.toFixed(2)}</span>
          <div className="text-[10px] text-on-surface-variant mt-2 flex items-center gap-1">
            <span>{metrics.totalOrders} total sales transactions</span>
          </div>
        </div>

      </section>

      {/* Main Terminal Tab Controls */}
      <section className="space-y-lg">
        <div className="flex gap-md border-b border-white/5 pb-sm overflow-x-auto whitespace-nowrap scrollbar-none">
          
          {(["overview", "users", "sellers", "products", "monitor"] as TabType[]).map((tab) => {
            const getIcon = () => {
              switch (tab) {
                case "overview": return Activity;
                case "users": return Users;
                case "sellers": return ShieldCheck;
                case "products": return ShoppingBag;
                case "monitor": return FileText;
              }
            };
            const Icon = getIcon();
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-semibold tracking-wide cursor-pointer transition-all relative pb-sm flex items-center gap-sm capitalize shrink-0 ${
                  activeTab === tab ? "text-on-surface font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab ? "text-secondary" : ""}`} />
                <span>{tab === "monitor" ? "System Monitor" : tab}</span>
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-secondary"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="space-y-lg">

          {/* OVERVIEW PANEL */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              
              {/* Analytics graph placeholders / mini widgets */}
              <div className="lg:col-span-2 glass p-lg rounded-2xl space-y-md">
                <h4 className="text-sm font-bold text-on-surface flex items-center gap-sm">
                  <Activity className="w-4 h-4 text-secondary" />
                  Live Platform Stats
                </h4>
                <div className="h-64 rounded-xl border border-white/5 bg-surface-container/30 flex flex-col items-center justify-center p-md text-center">
                  <TrendingUp className="w-10 h-10 text-secondary/30 mb-sm animate-bounce" />
                  <p className="text-xs text-on-surface font-semibold">Real-Time Invoicing System Active</p>
                  <p className="text-[10px] text-on-surface-variant max-w-sm mt-1">
                    Marketplace net revenues, active subscriptions, and seller payout queues are fully synced with PostgreSQL server.
                  </p>
                </div>
              </div>

              {/* Status checklist */}
              <div className="glass p-lg rounded-2xl space-y-md">
                <h4 className="text-sm font-bold text-on-surface flex items-center gap-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Security Coordinators
                </h4>
                <div className="space-y-sm">
                  
                  <div className="p-sm bg-surface-container rounded-lg border border-white/5 flex items-center justify-between gap-sm">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-on-surface truncate">Admin Middleware</p>
                      <p className="text-[10px] text-on-surface-variant opacity-70">Strict route blocker active</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded uppercase">SECURE</span>
                  </div>

                  <div className="p-sm bg-surface-container rounded-lg border border-white/5 flex items-center justify-between gap-sm">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-on-surface truncate">AES-256 Crypto Shield</p>
                      <p className="text-[10px] text-on-surface-variant opacity-70">Prompt body key locked</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded uppercase">SECURE</span>
                  </div>

                  <div className="p-sm bg-surface-container rounded-lg border border-white/5 flex items-center justify-between gap-sm">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-on-surface truncate">Session Engine</p>
                      <p className="text-[10px] text-on-surface-variant opacity-70">NextAuth JWT token validation</p>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1.5 py-0.5 rounded uppercase">SECURE</span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* USER MANAGEMENT PANEL */}
          {activeTab === "users" && (
            <div className="glass p-lg rounded-2xl space-y-md">
              <div className="flex flex-col sm:flex-row gap-sm justify-between items-start sm:items-center">
                
                {/* Search query */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-lg pl-xl pr-sm py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary/50 placeholder:text-on-surface-variant/40"
                    placeholder="Search coordinate credentials..."
                  />
                </div>

                {/* Role filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="bg-surface-container border border-white/10 rounded-lg text-xs py-2 px-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="BUYER">Buyers</option>
                  <option value="SELLER">Sellers</option>
                  <option value="ADMIN">Admins</option>
                </select>

              </div>

              {/* Users table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-on-surface-variant font-bold font-label-caps tracking-wider uppercase text-[10px]">
                      <th className="pb-sm px-sm">User Details</th>
                      <th className="pb-sm px-sm">Security Role</th>
                      <th className="pb-sm px-sm">Creation Timestamp</th>
                      <th className="pb-sm px-sm">Status</th>
                      <th className="pb-sm px-sm text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Name/Email */}
                        <td className="py-md px-sm flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-surface-container border border-white/5 relative overflow-hidden shrink-0">
                            <img src={u.avatar || "https://api.dicebear.com/7.x/pixel-art/svg"} className="object-cover w-full h-full" alt="Avatar" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-on-surface truncate block">{u.name || "Developer"}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-60 truncate block">{u.email}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-md px-sm">
                          <span className={getRoleBadge(u.role)}>{u.role}</span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-md px-sm text-on-surface-variant font-medium font-code-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Suspended indicator */}
                        <td className="py-md px-sm">
                          {u.suspended ? (
                            <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">SUSPENDED</span>
                          ) : (
                            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">ACTIVE</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-md px-sm text-right space-x-xs shrink-0">
                          {actionUserId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-secondary inline-block" />
                          ) : (
                            <>
                              {/* Suspend / Unsuspend */}
                              <button
                                onClick={() => handleToggleUserSuspension(u.id, u.suspended)}
                                disabled={u.id === session?.user?.id}
                                className={`p-1.5 rounded border active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-30 ${
                                  u.suspended 
                                    ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                                    : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                }`}
                                title={u.suspended ? "Unsuspend account" : "Suspend account"}
                              >
                                {u.suspended ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Promote / Demote */}
                              {u.role === "BUYER" && (
                                <button
                                  onClick={() => handleUpdateUserRole(u.id, "SELLER")}
                                  className="p-1.5 border border-purple-500/20 text-purple-400 hover:bg-purple-500/10 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer"
                                  title="Elevate to Creator (Seller)"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {u.role === "SELLER" && (
                                <button
                                  onClick={() => handleUpdateUserRole(u.id, "BUYER")}
                                  className="p-1.5 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer"
                                  title="Demote to Buyer"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {u.role !== "ADMIN" && (
                                <button
                                  onClick={() => handleUpdateUserRole(u.id, "ADMIN")}
                                  className="p-1.5 border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer"
                                  title="Promote to System Admin"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {u.role === "ADMIN" && u.id !== session?.user?.id && (
                                <button
                                  onClick={() => handleUpdateUserRole(u.id, "BUYER")}
                                  className="p-1.5 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer"
                                  title="Demote Admin to Buyer"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Hard Delete */}
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === session?.user?.id}
                                className="p-1.5 border border-red-500/10 hover:border-red-500/30 text-on-surface-variant hover:text-red-400 hover:bg-red-500/5 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer disabled:opacity-30"
                                title="Permanently delete account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>

                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-xl text-center text-on-surface-variant opacity-60">
                          No matching developer credentials found in database directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SELLER MANAGEMENT PANEL */}
          {activeTab === "sellers" && (
            <div className="glass p-lg rounded-2xl space-y-md">
              <h3 className="text-sm font-bold text-on-surface">Creator Profile Audits</h3>

              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-on-surface-variant font-bold font-label-caps tracking-wider uppercase text-[10px]">
                      <th className="pb-sm px-sm">Creator Identity</th>
                      <th className="pb-sm px-sm">Bio Architecture</th>
                      <th className="pb-sm px-sm">Verification Badge</th>
                      <th className="pb-sm px-sm">Listings Volume</th>
                      <th className="pb-sm px-sm text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sellers.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Creator details */}
                        <td className="py-md px-sm flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-surface-container border border-white/5 relative overflow-hidden shrink-0">
                            <img src={s.user?.avatar || "https://api.dicebear.com/7.x/pixel-art/svg"} className="object-cover w-full h-full" alt="Avatar" />
                          </div>
                          <div className="overflow-hidden">
                            <span className="font-bold text-on-surface truncate block">{s.companyName || "Freelance Studio"}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-60 truncate block">{s.user?.name} ({s.user?.email})</span>
                          </div>
                        </td>

                        {/* Bio description */}
                        <td className="py-md px-sm max-w-xs overflow-hidden">
                          <p className="text-on-surface-variant truncate text-[11px] leading-normal" title={s.bio}>{s.bio || "No biography provided."}</p>
                        </td>

                        {/* Verification badge */}
                        <td className="py-md px-sm">
                          {s.verified ? (
                            <span className="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-400" />
                              VERIFIED
                            </span>
                          ) : (
                            <span className="text-on-surface-variant bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">PENDING</span>
                          )}
                        </td>

                        {/* Active Listings count */}
                        <td className="py-md px-sm font-medium font-code-sm">
                          {s._count?.products || 0} listed prompts
                        </td>

                        {/* Controls */}
                        <td className="py-md px-sm text-right space-x-xs shrink-0">
                          {actionSellerId === s.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-secondary inline-block" />
                          ) : (
                            <>
                              {/* Toggle verified */}
                              <button
                                onClick={() => handleToggleSellerVerify(s.id, s.verified)}
                                className={`p-1.5 rounded border active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  s.verified 
                                    ? "border-amber-500/20 text-amber-400 hover:bg-amber-500/10" 
                                    : "border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                                }`}
                                title={s.verified ? "Revoke Creator Badge" : "Approve & Verify Creator"}
                              >
                                {s.verified ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                <span>{s.verified ? "Revoke" : "Approve"}</span>
                              </button>

                              {/* Reject profile (demotes user) */}
                              <button
                                onClick={() => handleRejectSeller(s.id)}
                                className="p-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 rounded active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
                                title="Demote creator & remove catalog"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </td>

                      </tr>
                    ))}
                    {sellers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-xl text-center text-on-surface-variant opacity-60">
                          No registered Creator Profiles found in directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCT MODERATION PANEL */}
          {activeTab === "products" && (
            <div className="glass p-lg rounded-2xl space-y-md">
              <div className="flex flex-col sm:flex-row gap-sm justify-between items-start sm:items-center">
                
                <h3 className="text-sm font-bold text-on-surface">Listed Asset Moderation</h3>

                {/* Filter selects */}
                <div className="flex gap-xs">
                  {(["all", "reported", "archived"] as const).map((pf) => (
                    <button
                      key={pf}
                      onClick={() => setProductFilter(pf)}
                      className={`text-xs font-semibold px-sm py-1.5 rounded-lg active:scale-95 transition-all capitalize border ${
                        productFilter === pf 
                          ? "bg-secondary text-on-secondary border-secondary font-bold" 
                          : "bg-surface-container text-on-surface-variant border-white/5 hover:text-on-surface"
                      }`}
                    >
                      {pf}
                    </button>
                  ))}
                </div>

              </div>

              {/* Products Table */}
              <div className="overflow-x-auto w-full">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-on-surface-variant font-bold font-label-caps tracking-wider uppercase text-[10px]">
                      <th className="pb-sm px-sm">Asset Listing</th>
                      <th className="pb-sm px-sm">Creator</th>
                      <th className="pb-sm px-sm">Pricing Model</th>
                      <th className="pb-sm px-sm">Status</th>
                      <th className="pb-sm px-sm text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        
                        {/* Product listing title, model, thumbnail */}
                        <td className="py-md px-sm flex items-center gap-sm">
                          <div className="w-12 h-8 bg-surface-container border border-white/5 rounded overflow-hidden shrink-0 relative">
                            <img src={p.thumbnail} className="object-cover w-full h-full" alt="Thumbnail" />
                          </div>
                          <div className="overflow-hidden max-w-xs">
                            <span className="text-[9px] text-secondary font-semibold font-label-caps uppercase">{p.model}</span>
                            <span className="font-bold text-on-surface truncate block leading-tight">{p.title}</span>
                          </div>
                        </td>

                        {/* Owner Seller */}
                        <td className="py-md px-sm">
                          <div className="overflow-hidden">
                            <span className="font-medium text-on-surface truncate block">{p.seller?.companyName || "Freelance Studio"}</span>
                            <span className="text-[10px] text-on-surface-variant opacity-60 truncate block">{p.seller?.user?.name}</span>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-md px-sm font-semibold font-code-sm text-on-surface">
                          ${Number(p.price).toFixed(2)}
                        </td>

                        {/* Status (reported, archived) */}
                        <td className="py-md px-sm space-y-0.5">
                          <div>
                            {p.reported ? (
                              <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] inline-flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                REPORTED
                              </span>
                            ) : (
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">CLEAN</span>
                            )}
                          </div>
                          <div>
                            {p.archived && (
                              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold uppercase text-[9px] inline-flex items-center gap-0.5">
                                <Archive className="w-2.5 h-2.5" />
                                ARCHIVED
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Moderation Controls */}
                        <td className="py-md px-sm text-right space-x-xs shrink-0">
                          {actionProductId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-secondary inline-block" />
                          ) : (
                            <>
                              {/* Toggle reported status */}
                              <button
                                onClick={() => handleToggleProductReport(p.id, p.reported)}
                                className={`p-1.5 rounded border active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  p.reported 
                                    ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                                    : "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                }`}
                                title={p.reported ? "Resolve Report (Clear flag)" : "Mark as Inappropriate (Flag)"}
                              >
                                {p.reported ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                <span>{p.reported ? "Resolve" : "Flag"}</span>
                              </button>

                              {/* Toggle archive status */}
                              <button
                                onClick={() => handleToggleProductArchive(p.id, p.archived)}
                                className={`p-1.5 rounded border active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer ${
                                  p.archived 
                                    ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" 
                                    : "border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
                                }`}
                                title={p.archived ? "Restore to Public Catalog" : "Archive Listing"}
                              >
                                <Archive className="w-3.5 h-3.5" />
                                <span>{p.archived ? "Restore" : "Archive"}</span>
                              </button>

                              {/* Hard delete */}
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 rounded active:scale-95 transition-all inline-flex items-center cursor-pointer"
                                title="Permanently Delete Listing"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>

                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-xl text-center text-on-surface-variant opacity-60">
                          No product listings matches the selected moderation filter parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYSTEM MONITOR AUDIT LOGS */}
          {activeTab === "monitor" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              
              {/* Recent registrations */}
              <div className="glass p-lg rounded-2xl space-y-md">
                <h4 className="text-xs font-bold text-on-surface font-label-caps uppercase tracking-wider text-blue-400 flex items-center gap-sm">
                  <UserPlus className="w-4 h-4" />
                  Recent Registrations
                </h4>
                <div className="space-y-sm">
                  {monitor.recentRegistrations?.map((reg: any) => (
                    <div key={reg.id} className="p-sm bg-surface-container rounded-lg border border-white/5 space-y-xs">
                      <div className="flex items-center gap-xs justify-between">
                        <span className="font-bold text-on-surface text-xs truncate max-w-[120px] block">{reg.name || "New User"}</span>
                        <span className="font-code-sm text-[9px] text-on-surface-variant opacity-60 block">{new Date(reg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant truncate block">{reg.email}</span>
                      <span className={getRoleBadge(reg.role)}>{reg.role}</span>
                    </div>
                  ))}
                  {(!monitor.recentRegistrations || monitor.recentRegistrations.length === 0) && (
                    <p className="text-xs text-on-surface-variant opacity-60 py-md text-center">No registrations audited yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="glass p-lg rounded-2xl space-y-md">
                <h4 className="text-xs font-bold text-on-surface font-label-caps uppercase tracking-wider text-amber-400 flex items-center gap-sm">
                  <FileText className="w-4 h-4" />
                  Recent Invoiced Orders
                </h4>
                <div className="space-y-sm">
                  {monitor.recentOrders?.map((ord: any) => (
                    <div key={ord.id} className="p-sm bg-surface-container rounded-lg border border-white/5 space-y-xs">
                      <div className="flex items-center gap-xs justify-between">
                        <span className="font-bold text-on-surface text-xs truncate block">ID: {ord.id.slice(0, 8)}...</span>
                        <span className="font-code-sm text-[9px] text-on-surface-variant opacity-60 block">{new Date(ord.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-on-surface-variant truncate block max-w-[120px]">{ord.user?.name}</span>
                        <span className="font-bold text-secondary font-code-sm">${Number(ord.totalPrice).toFixed(2)}</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-1 py-0.5 rounded block text-center uppercase">{ord.status}</span>
                    </div>
                  ))}
                  {(!monitor.recentOrders || monitor.recentOrders.length === 0) && (
                    <p className="text-xs text-on-surface-variant opacity-60 py-md text-center">No invoiced orders audited yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Prompt Uploads */}
              <div className="glass p-lg rounded-2xl space-y-md">
                <h4 className="text-xs font-bold text-on-surface font-label-caps uppercase tracking-wider text-purple-400 flex items-center gap-sm">
                  <ShoppingBag className="w-4 h-4" />
                  Recent Asset Uploads
                </h4>
                <div className="space-y-sm">
                  {monitor.recentProductUploads?.map((up: any) => (
                    <div key={up.id} className="p-sm bg-surface-container rounded-lg border border-white/5 space-y-xs">
                      <div className="flex items-center gap-xs justify-between overflow-hidden">
                        <span className="font-bold text-on-surface text-xs truncate max-w-[120px] block">{up.title}</span>
                        <span className="font-code-sm text-[9px] text-on-surface-variant opacity-60 block shrink-0">{new Date(up.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-purple-400 font-medium font-code-sm uppercase">{up.model}</span>
                        <span className="font-semibold text-on-surface font-code-sm">${Number(up.price).toFixed(2)}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant truncate block">By: {up.seller?.companyName || "Creator"}</span>
                    </div>
                  ))}
                  {(!monitor.recentProductUploads || monitor.recentProductUploads.length === 0) && (
                    <p className="text-xs text-on-surface-variant opacity-60 py-md text-center">No prompt uploads audited yet.</p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

    </div>
  );
}
