"use client";

import Link from "next/link";
import Image from "next/image";
import useCartStore from "@/store/useCartStore";
import { Trash2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();
  const serviceFee = subtotal > 0 ? 2.50 : 0.00;
  const grandTotal = subtotal + serviceFee;

  const crossSellItems = [
    {
      title: "Serverless Edge Middleware",
      creator: "EdgeLogic",
      price: "$19.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSZElzeNCbCx33yYaZkkVc9q-iKamb066Wc0p1Up6Kmebk82nJGr1JREB-HwL7N4q_88Y9AooCvfBlrrz1spstDgbn_9tY7feJVzfSqrzmBpgtHbAjTyZ7zspN-HcOyvReJvabIhwrv2GRekOs2JPZ6GOTMPUEi4wJiLdluMAIqgFRUlhM6Uko7TMn_hjASmDkhp3I944OQB0E4MAulohRAOBzUgULzELqGbjkJRkP1ezuVjyeDRovBkWZs0g6YLNuJAox-iQvvRn_",
      slug: "serverless-edge-middleware",
    },
    {
      title: "Postgres Vector Indexer",
      creator: "DBProxy",
      price: "$15.00",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgrk1QN5eog4Kv-bCxKilRnQ2f2vIx3VaPuN75Lm2j-1wr0zf2eALG9Tqza2ih_eCNEOv6MuHtodtrXWQfdK60dbassPO9RuVc1tQiLS7PDVPlggY8W32LGp9bxuQvmaNFZA0ujZp3LhxR5fsuqiavmRt0LIVSYPMh-OpfVD0w3JttpdlwxFuaigdXn1BJKmaM50MY0ivN-4SjPfKJH6WU4oi2CPHzQEkqQs-6dCPu4_H7x8X6Ka-sH-IlEPu8Fjd20JOiRPMFeoKr",
      slug: "postgres-vector-indexer",
    },
  ];

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Header */}
      <section>
        <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
          Checkout Phase 1
        </span>
        <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
          Shopping Cart
        </h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Review your selected high-fidelity prompt templates before processing.
        </p>
      </section>

      {items.length === 0 ? (
        <div className="text-center py-24 glass rounded-xl border border-white/5 space-y-md">
          <ShoppingBag className="w-16 h-16 text-on-surface-variant/40 mx-auto animate-pulse" />
          <div>
            <h3 className="text-base font-bold text-on-surface">Your Cart is Empty</h3>
            <p className="text-xs text-on-surface-variant/80 mt-1">
              Explore the CodeCrate catalog to discover pre-validated prompt templates.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-xs px-md py-sm bg-secondary text-on-secondary font-bold rounded-lg text-xs hover:opacity-90 active:scale-98 transition-all"
          >
            <span>Browse Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-md">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass glass-shine p-md rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md group hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-md w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-lg bg-surface-container border border-white/10 overflow-hidden relative shrink-0">
                    <Image
                      alt={item.title}
                      src={item.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-xs mb-0.5">
                      <span className="bg-secondary-container/10 text-secondary border border-secondary-container/20 px-xs py-[1px] rounded text-[9px] font-label-caps font-bold">
                        {item.model}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">By {item.sellerName}</span>
                    </div>
                    <Link href={`/marketplace/${item.slug}`}>
                      <h4 className="text-sm font-bold text-on-surface hover:text-secondary transition-colors truncate">
                        {item.title}
                      </h4>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-lg w-full sm:w-auto border-t border-white/5 sm:border-none pt-sm sm:pt-0 shrink-0">
                  <span className="font-code-sm font-bold text-sm text-on-surface">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-sm text-on-surface-variant hover:text-error hover:bg-error-container/10 border border-white/5 hover:border-error/20 rounded-lg transition-all active:scale-95 duration-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout sidebar aggregates */}
          <div className="lg:col-span-1">
            <div className="glass glass-shine rounded-2xl p-lg space-y-md shadow-2xl">
              <h3 className="text-sm font-bold text-on-surface-variant font-label-caps uppercase tracking-wider">
                Order Invoice
              </h3>

              <div className="space-y-sm text-xs leading-normal">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-code-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Replication Fee (Mock)</span>
                  <span className="font-code-sm">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/5 pt-sm flex justify-between text-sm font-bold text-on-surface">
                  <span>Total Due</span>
                  <span className="font-code-sm text-secondary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-secondary to-tertiary hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center gap-xs active:scale-98 transition-all shadow-lg text-sm text-center cursor-pointer font-sans"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-md border-t border-white/5 flex items-start gap-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-on-surface-variant leading-normal opacity-75">
                  Secure checkout backed by simulated 256-bit payment node gateways. Instant vault delivery guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CROSS SELLING RECOMMENDED FOR VAULT */}
      <section className="space-y-md border-t border-white/5 pt-xl">
        <h3 className="text-lg font-bold">Recommended for Your Vault</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {crossSellItems.map((item, index) => (
            <div
              key={index}
              className="glass p-md rounded-xl flex items-center gap-md hover:border-secondary/20 transition-colors group"
            >
              <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden border border-white/10 relative shrink-0">
                <Image
                  alt={item.title}
                  src={item.img}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="text-[10px] text-on-surface-variant">By {item.creator}</span>
                <h4 className="text-sm font-bold text-on-surface truncate leading-tight mt-0.5">
                  {item.title}
                </h4>
                <span className="font-code-sm text-xs text-secondary font-bold mt-1 block">
                  {item.price}
                </span>
              </div>
              <Link
                href={`/marketplace`}
                className="px-md py-1.5 border border-white/10 hover:border-secondary/30 hover:bg-secondary/5 text-on-surface text-xs font-bold rounded-lg transition-colors shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
