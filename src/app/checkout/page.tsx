"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useCartStore from "@/store/useCartStore";
import { ShieldCheck, Lock, CreditCard, ChevronRight } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const serviceFee = subtotal > 0 ? 2.50 : 0.00;
  const grandTotal = subtotal + serviceFee;

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0 && !loading) {
      router.push("/cart");
    }
  }, [items, router, loading]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const productIds = items.map((i) => i.id);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds, cardName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order authorization failed.");
      }

      // Successful payment processing
      clearCart();
      
      // Redirect to Order Dispatch Timeline page
      router.push(`/orders/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during payment.");
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Header */}
      <section>
        <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
          Checkout Phase 2
        </span>
        <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
          Secure Payment Portal
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Complete the simulated payment authorization transaction to unlock prompt assets.
        </p>
      </section>

      {/* Main split form panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left Column: Card Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleCheckoutSubmit} className="glass glass-shine rounded-2xl p-lg space-y-lg shadow-2xl">
            <div className="flex items-center gap-xs text-on-surface font-semibold border-b border-white/5 pb-sm">
              <CreditCard className="w-5 h-5 text-secondary shrink-0" />
              <span>Card Details (Mock Payment)</span>
            </div>

            {error && (
              <div className="p-sm bg-error-container/10 border border-error/20 rounded-lg text-error text-xs">
                {error}
              </div>
            )}

            <div className="space-y-md">
              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div className="space-y-xs">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                  Card Number
                </label>
                <div className="relative bg-surface-container border border-white/5 rounded-lg group focus-within:ring-2 focus-within:ring-secondary/40 transition-all">
                  <CreditCard className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-transparent border-none rounded-lg pl-xl pr-sm py-2.5 text-sm text-on-surface focus:ring-0 focus:outline-none"
                    placeholder="4000 1234 5678 9010"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label-caps">
                    Security CVC
                  </label>
                  <input
                    type="text"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full bg-surface-container border border-white/5 rounded-lg px-md py-2.5 text-sm text-on-surface focus:ring-2 focus:ring-secondary/40 focus:outline-none placeholder:text-on-surface-variant/40"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            {/* Complete secure payment */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary via-tertiary to-on-tertiary-container hover:brightness-110 text-on-secondary font-bold py-md rounded-lg active:scale-98 transition-all shadow-lg flex items-center justify-center gap-xs disabled:opacity-50 cursor-pointer text-sm font-sans"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-on-secondary border-t-transparent rounded-full animate-spin"></span>
                  <span>Provisioning Vault keys...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Complete Secure Payment (${grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Invoice summary */}
        <div className="lg:col-span-1 space-y-md">
          <div className="glass glass-shine rounded-2xl p-lg space-y-lg shadow-2xl">
            <h3 className="text-xs font-bold text-on-surface-variant font-label-caps uppercase tracking-wider">
              Order Breakdown
            </h3>

            <div className="space-y-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center gap-sm">
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-secondary font-semibold font-label-caps tracking-wider block">
                      {item.model}
                    </span>
                    <h5 className="text-xs text-on-surface truncate leading-normal">
                      {item.title}
                    </h5>
                  </div>
                  <span className="font-code-sm text-xs font-bold shrink-0 text-on-surface">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-md space-y-sm text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-code-sm">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Replication Fee</span>
                <span className="font-code-sm">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/5 pt-sm flex justify-between text-sm font-bold text-on-surface">
                <span>Total Amount</span>
                <span className="font-code-sm text-secondary">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-md border-t border-white/5 flex items-start gap-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-[10px] text-on-surface-variant leading-normal opacity-75">
                <span className="font-bold text-on-surface">Secure Checkout Guarantee</span>
                <p className="mt-0.5">
                  Simulated transaction processing. The card will not be charged. Instant vault key deployment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
