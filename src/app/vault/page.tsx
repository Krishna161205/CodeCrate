"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FolderHeart, ShieldCheck, Copy, Check, Eye, EyeOff, Loader2, Sparkles, Terminal } from "lucide-react";

export default function VaultPage() {
  const { data: session, status } = useSession();
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Decrypt content view states
  const [activeDecryptedId, setActiveDecryptedId] = useState<string | null>(null);
  const [decryptedText, setDecryptedText] = useState<string>("");
  const [decryptLoadingId, setDecryptLoadingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchVault = async () => {
        try {
          const res = await fetch("/api/vault");
          if (res.ok) {
            const data = await res.json();
            setVaultItems(data);
          }
        } catch (err) {
          console.error("Failed to load vault items:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchVault();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleCopyPrompt = async (productId: string) => {
    setCopyingId(productId);
    try {
      const res = await fetch(`/api/vault/${productId}`);
      if (!res.ok) {
        throw new Error("Failed to decrypt prompt.");
      }
      const data = await res.json();
      
      // Copy to Clipboard
      await navigator.clipboard.writeText(data.prompt);
      
      // Flash Checkmark
      setTimeout(() => setCopyingId(null), 2000);
    } catch (err) {
      console.error(err);
      setCopyingId(null);
    }
  };

  const handleToggleDecrypt = async (productId: string) => {
    if (activeDecryptedId === productId) {
      setActiveDecryptedId(null);
      setDecryptedText("");
      return;
    }

    setDecryptLoadingId(productId);
    try {
      const res = await fetch(`/api/vault/${productId}`);
      if (!res.ok) {
        throw new Error("Failed to decrypt prompt.");
      }
      const data = await res.json();
      setDecryptedText(data.prompt);
      setActiveDecryptedId(productId);
    } catch (err) {
      console.error(err);
    } finally {
      setDecryptLoadingId(null);
    }
  };

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
        <div className="max-w-md text-center glass glass-shine p-lg rounded-2xl space-y-md">
          <FolderHeart className="w-12 h-12 text-secondary mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-on-surface">Vault Access Restricted</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Please authenticate to view your personal prompt vault and copy your purchased high-fidelity developer assets.
          </p>
          <Link
            href="/auth"
            className="w-full bg-gradient-to-r from-secondary to-tertiary text-on-secondary font-bold py-sm rounded-lg flex items-center justify-center active:scale-95 transition-all text-xs font-semibold cursor-pointer"
          >
            Authenticate Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-md">
        <div>
          <span className="font-label-caps text-xs text-secondary tracking-widest uppercase font-bold">
            Buyer Dashboard
          </span>
          <h2 className="font-headline-md text-3xl font-bold text-on-surface mt-xs">
            My Vault
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage, test, and decrypt your premium AI instructions and code assets.
          </p>
        </div>
        <div className="flex gap-sm">
          <div className="glass glass-shine px-md py-sm rounded-xl">
            <span className="font-label-caps text-[9px] text-on-surface-variant block mb-1">TOTAL ASSETS</span>
            <span className="text-2xl font-bold text-secondary font-code-sm">{vaultItems.length}</span>
          </div>
          <div className="glass glass-shine px-md py-sm rounded-xl">
            <span className="font-label-caps text-[9px] text-on-surface-variant block mb-1">SYSTEM NODES</span>
            <span className="text-2xl font-bold text-on-surface font-code-sm">ACTIVE</span>
          </div>
        </div>
      </section>

      {/* Digital Delivery Timeline Tracker (Simulated delivery workflow) */}
      <section className="space-y-md">
        <div className="flex items-center gap-sm text-sm font-semibold">
          <span className="w-2 h-2 bg-secondary rounded-full animate-ping"></span>
          <h3>Digital Provisioning Pipeline</h3>
        </div>
        
        <div className="glass glass-shine p-lg rounded-xl overflow-x-auto">
          <div className="flex min-w-[800px] justify-between relative">
            <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-white/5 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center gap-sm w-48">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-[0_0_20px_rgba(173,198,255,0.4)] shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold font-label-caps text-secondary mb-0.5">COMPLETED</p>
                <p className="text-xs font-bold text-on-surface">Payment Verified</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center gap-sm w-48">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-[0_0_20px_rgba(173,198,255,0.4)] shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold font-label-caps text-secondary mb-0.5">SYNCHRONIZED</p>
                <p className="text-xs font-bold text-on-surface">Node Provisioning</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center gap-sm w-48">
              <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-secondary flex items-center justify-center text-secondary relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold font-label-caps text-secondary mb-0.5">DECRYPTING</p>
                <p className="text-xs font-bold text-on-surface">Vault Sync</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center gap-sm w-48 opacity-45">
              <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0 text-on-surface-variant">
                <FolderHeart className="w-4 h-4" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold font-label-caps text-on-surface-variant mb-0.5">QUEUED</p>
                <p className="text-xs font-bold text-on-surface">Keys Ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prompts list grid */}
      {vaultItems.length === 0 ? (
        <div className="text-center py-24 glass rounded-xl border border-white/5 space-y-md">
          <FolderHeart className="w-16 h-16 text-on-surface-variant/40 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-on-surface">Your Vault is Empty</h3>
            <p className="text-xs text-on-surface-variant/80 mt-1">
              Unlock high-fidelity prompt architectures by acquiring them from our catalog.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-xs px-md py-sm bg-secondary text-on-secondary font-bold rounded-lg text-xs hover:opacity-90 active:scale-98 transition-all"
          >
            <span>Browse Marketplace</span>
          </Link>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {vaultItems.map((item) => {
            const isCopying = copyingId === item.id;
            const isDecrypted = activeDecryptedId === item.id;
            const isDecryptLoading = decryptLoadingId === item.id;

            return (
              <div
                key={item.id}
                className="glass glass-shine rounded-xl p-md flex flex-col justify-between group hover:border-secondary/40 transition-all duration-300 relative"
              >
                <div>
                  <div className="flex justify-between items-start mb-md">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-white/10 overflow-hidden relative shrink-0">
                      <Image
                        alt={item.title}
                        src={item.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-xs py-[2px] rounded text-[9px] font-label-caps font-bold">
                      {item.model}
                    </span>
                  </div>

                  <span className="text-[10px] text-on-surface-variant block font-medium">
                    {item.category?.name}
                  </span>
                  <h4 className="text-base font-bold text-on-surface leading-tight mt-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed opacity-85">
                    {item.description}
                  </p>

                  {/* Decrypted Prompt Code block overlay */}
                  {isDecrypted && (
                    <div className="mt-md p-sm bg-surface-container-low border border-white/10 rounded-lg text-xs leading-normal select-text font-mono overflow-x-auto whitespace-pre-wrap max-h-48 text-secondary relative group-inner">
                      {decryptedText}
                    </div>
                  )}
                </div>

                <div className="mt-md pt-md border-t border-white/5 flex items-center justify-between gap-sm shrink-0">
                  <button
                    onClick={() => handleToggleDecrypt(item.id)}
                    disabled={isDecryptLoading}
                    className="text-xs text-secondary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isDecryptLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isDecrypted ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 shrink-0" />
                        <span>Hide Prompt</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span>Decrypt Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyPrompt(item.id)}
                    disabled={isCopying}
                    className="w-8 h-8 rounded-full glass border border-white/10 hover:border-secondary/35 flex items-center justify-center hover:bg-secondary/15 text-on-surface hover:text-secondary transition-all cursor-pointer active:scale-95 duration-100 disabled:opacity-50"
                    title="Copy prompt content to clipboard"
                  >
                    {isCopying ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                    ) : (
                      <Copy className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
