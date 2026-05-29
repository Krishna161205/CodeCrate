"use client";

import useCartStore, { CartItem } from "@/store/useCartStore";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";

export default function AddToCartButton({ item }: { item: CartItem }) {
  const { items, addItem } = useCartStore();
  const exists = items.some((i) => i.id === item.id);
  const [success, setSuccess] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (exists) {
    return (
      <button
        disabled
        className="w-full bg-white/5 border border-white/10 text-on-surface-variant font-bold py-sm rounded-lg flex items-center justify-center gap-xs cursor-default select-none"
      >
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Added to Shopping Cart</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-gradient-to-r from-secondary to-tertiary hover:brightness-110 text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center gap-xs active:scale-98 transition-all shadow-lg cursor-pointer"
    >
      {success ? (
        <>
          <Check className="w-4 h-4 shrink-0 animate-bounce" />
          <span>Prompt Added!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 shrink-0" />
          <span>Add to Vault Cart</span>
        </>
      )}
    </button>
  );
}
