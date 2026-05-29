"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Check, ArrowRight, ShieldCheck, HelpCircle, Activity, Hourglass, Lock } from "lucide-react";

export default function OrderTimelinePage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Timeline simulated state progression
  const [phase, setPhase] = useState(1);

  useEffect(() => {
    if (status === "authenticated") {
      const loadOrder = async () => {
        try {
          // Alternatively, we query the order details or mock load from cart snaps
          setOrder({
            id: params.id,
            paymentIntent: "PAY-REF-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
            totalPrice: 26.50,
            date: new Date().toLocaleDateString(),
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadOrder();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, params.id]);

  useEffect(() => {
    if (order) {
      // Simulate live pipeline progress: Phase 1 -> Phase 2 -> Phase 3 -> Phase 4
      const t1 = setTimeout(() => setPhase(2), 2500);
      const t2 = setTimeout(() => setPhase(3), 5500);
      const t3 = setTimeout(() => setPhase(4), 8500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [order]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-md">
        <div className="max-w-md text-center glass p-lg rounded-2xl space-y-md">
          <HelpCircle className="w-12 h-12 text-secondary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-on-surface">Order Access Denied</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please authenticate to track active digital deliveries and monitor your prompt key unlocks.
          </p>
          <Link
            href="/auth"
            className="w-full bg-gradient-to-r from-secondary to-tertiary text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer"
          >
            Authenticate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
        <div>
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
            Delivery timeline
          </span>
          <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
            Order Dispatch Timeline
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Tracking order <span className="text-secondary font-bold font-code-sm">#{order?.id?.substring(0, 8)}</span> • Authorized on {order?.date}
          </p>
        </div>
      </section>

      {/* Grid of central timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left/Center Column: Interactive timeline progress */}
        <div className="lg:col-span-2 space-y-lg glass glass-shine p-lg rounded-2xl shadow-xl">
          <div className="relative border-l-2 border-white/5 pl-lg ml-xs space-y-xl py-xs">
            
            {/* Phase 1: Completed */}
            <div className="relative">
              <div className="absolute -left-[37px] top-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Payment Authenticated</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Mock payment gateway checkout completed successfully. Reference code: <span className="font-code-sm text-on-surface">{order?.paymentIntent}</span>.
                </p>
              </div>
            </div>

            {/* Phase 2: Host Node Replicating */}
            <div className="relative">
              <div className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                phase >= 2
                  ? "bg-secondary text-on-secondary shadow-[0_0_15px_rgba(173,198,255,0.4)]"
                  : "bg-surface-container-high border border-white/10 text-on-surface-variant"
              }`}>
                {phase === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : phase > 2 ? <Check className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
              </div>
              <div className={phase < 2 ? "opacity-45" : ""}>
                <h4 className={`text-sm font-bold ${phase === 2 ? "text-secondary animate-pulse" : phase > 2 ? "text-secondary" : "text-on-surface-variant"}`}>
                  Host Node Replicating Prompt Contents
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Replicating prompt key-value instructions to host instance segment. Node 04-B active.
                </p>
              </div>
            </div>

            {/* Phase 3: Vault Sync */}
            <div className="relative">
              <div className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                phase >= 3
                  ? "bg-secondary text-on-secondary shadow-[0_0_15px_rgba(173,198,255,0.4)]"
                  : "bg-surface-container-high border border-white/10 text-on-surface-variant"
              }`}>
                {phase === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : phase > 3 ? <Check className="w-3.5 h-3.5" /> : <Hourglass className="w-3.5 h-3.5" />}
              </div>
              <div className={phase < 3 ? "opacity-45" : ""}>
                <h4 className={`text-sm font-bold ${phase === 3 ? "text-secondary animate-pulse" : phase > 3 ? "text-secondary" : "text-on-surface-variant"}`}>
                  Vault Sync & Vector DB Proxy Indexing
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Syncing assets across relational indexes. Initializing vector proxy cache keys.
                </p>
              </div>
            </div>

            {/* Phase 4: Decryption Keys Ready */}
            <div className="relative">
              <div className={`absolute -left-[37px] top-0 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                phase >= 4
                  ? "bg-gradient-to-r from-secondary to-tertiary text-on-secondary shadow-[0_0_15px_rgba(173,198,255,0.4)]"
                  : "bg-surface-container-high border border-white/10 text-on-surface-variant"
              }`}>
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div className={phase < 4 ? "opacity-45" : ""}>
                <h4 className={`text-sm font-bold ${phase === 4 ? "text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary font-bold" : "text-on-surface-variant"}`}>
                  Decryption Keys Provisioned to My Vault
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
                  Private decryption keypair deployed. Code assets are fully unlocked and copyable in your vault dashboard.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Checkout Successful details card */}
        <div className="lg:col-span-1">
          <div className="glass glass-shine rounded-2xl p-lg space-y-md shadow-xl text-center">
            <ShieldCheck className="w-12 h-12 text-secondary mx-auto animate-bounce shrink-0" />
            <div>
              <h4 className="text-sm font-bold">Checkout Successful</h4>
              <p className="text-[11px] text-on-surface-variant opacity-85 mt-2 leading-relaxed">
                Your prompt assets have been securely provisioned to your profile vault. Decrypt them inside the vault to inspect details.
              </p>
            </div>
            <Link
              href="/vault"
              className="w-full bg-gradient-to-r from-secondary to-tertiary hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center gap-xs active:scale-98 transition-all shadow-lg text-xs cursor-pointer font-sans"
            >
              <span>Go to My Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
