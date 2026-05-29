"use client";

import Link from "next/link";
import Image from "next/image";
import { Terminal, LineChart, GraduationCap, Palette, Star } from "lucide-react";

export default function LandingPage() {
  const specializedDomains = [
    {
      title: "Coding Prompts",
      desc: "Complex refactoring, architectural patterns, and boilerplate generation for 20+ languages.",
      tags: ["Py", "Ts", "Go"],
      icon: Terminal,
      color: "text-secondary hover:border-secondary/40",
      bgGradient: "from-secondary/5",
      isLarge: true,
    },
    {
      title: "Data Analysis",
      desc: "Automate SQL optimization and complex ETL workflows with zero effort.",
      icon: LineChart,
      color: "text-tertiary hover:border-tertiary/40",
      isLarge: false,
    },
    {
      title: "Academic Tools",
      desc: "Citation generators and research summarization chains.",
      icon: GraduationCap,
      color: "text-on-tertiary-container hover:border-on-tertiary-container/40",
      isLarge: false,
    },
  ];

  const trendingPrompts = [
    {
      title: "Full-Stack Architect GPT",
      creator: "DevScale Labs",
      price: "$24.00",
      rating: "4.9",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAicJrrLuWVEls7kf8HkmmFd77Lkx1pH-dq5iCt4ZPu-2bkk1OpAiqJLHB_F3Up4UR6TXUlXXppo8AkOb9WM52V3URkdly4qzc4jhzCNo_LfB9VxdfMb5KVW8zuPAMiroWe0e5WLP6UfZaFhGFM6hzi3M-T0MJTlmMCX-cuZ48aIHpFre210LaUOtts_OtrdZO9RFUY6wz3pGf5EmJeJMmLTBLWIJ52cHyQrJJwgQXinZs2UIroNaTogiGigqaBe4QXPiKsn6dgVIzd",
      slug: "full-stack-architect-gpt",
    },
    {
      title: "Data Science Pipeline v2",
      creator: "QuantModel",
      price: "$39.00",
      rating: "5.0",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgrk1QN5eog4Kv-bCxKilRnQ2f2vIx3VaPuN75Lm2j-1wr0zf2eALG9Tqza2ih_eCNEOv6MuHtodtrXWQfdK60dbassPO9RuVc1tQiLS7PDVPlggY8W32LGp9bxuQvmaNFZA0ujZp3LhxR5fsuqiavmRt0LIVSYPMh-OpfVD0w3JttpdlwxFuaigdXn1BJKmaM50MY0ivN-4SjPfKJH6WU4oi2CPHzQEkqQs-6dCPu4_H7x8X6Ka-sH-IlEPu8Fjd20JOiRPMFeoKr",
      slug: "data-science-pipeline-v2",
    },
    {
      title: "Cinematic Vision Midjourney",
      creator: "StudioZero",
      price: "$12.00",
      rating: "4.8",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVRfF5peSxrIBDRAKwBHQi9skoqTHDGOGvuDn6Q865JL4bmZ59ZVtyfcd0v-ei3NJQXQ9hwThVcRTr_ykxetTtDuOI86BP_e-T_xvtUGCFuU-YJEz49v1JYnpZHT8Pa7XItdnftXQBc2jpI01IOPDlNxfx03j3NDTFUFS6l3lTZRFGmA3542LRYyNttByGOfBqW3lF9Tr8F2lbpJgqzmTtswRk6p37zwEQIPZdORNSYsWpXXaInToNhTe0GkSFPtIjPkRSDnSoNvrK",
      slug: "cinematic-vision-midjourney",
    },
  ];

  return (
    <div className="relative min-h-screen pb-24 bg-background overflow-hidden">
      {/* Background Glow Atmospheric Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-on-tertiary-container glow-accent -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-container glow-accent translate-y-1/2 -translate-x-1/4 rounded-full pointer-events-none"></div>

      {/* HERO SECTION */}
      <section className="relative pt-xl pb-24 px-lg md:pt-36 md:px-xl flex flex-col justify-center max-w-5xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full border border-tertiary/20 bg-tertiary/5 text-tertiary font-label-caps text-xs mb-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            NEW VERSION 4.2 NOW LIVE
          </div>
          <h2 className="font-display-lg text-display-lg md:text-[68px] md:leading-[76px] font-bold text-on-surface mb-md tracking-tight">
            Stop Arguing with AI. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-tertiary to-on-tertiary-container">
              Buy Prompts that Work.
            </span>
          </h2>
          <p className="font-body-lg text-lg text-on-surface-variant max-w-2xl mb-xl opacity-80 leading-relaxed">
            CodeCrate is the world's most advanced repository for high-fidelity prompt engineering. Access pre-validated instructions for GPT-4, Claude, and Midjourney built by senior developers.
          </p>
          <div className="flex flex-wrap gap-md">
            <Link
              href="/marketplace"
              className="px-xl py-md bg-white hover:bg-neutral-200 text-black font-bold rounded-lg hover:scale-103 transition-all cursor-pointer shadow-lg active:scale-98"
            >
              Browse the Vault
            </Link>
            <Link
              href="/settings"
              className="px-xl py-md glass-panel text-on-surface font-bold rounded-lg hover:bg-white/10 transition-colors cursor-pointer active:scale-98"
            >
              Sell Your Prompts
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORY BENTO GRID */}
      <section className="px-lg md:px-xl py-xl bg-surface-container-lowest/30 border-y border-white/5">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-xl">
            <span className="font-label-caps text-xs text-tertiary tracking-widest uppercase font-bold">
              Ecosystem
            </span>
            <h3 className="font-headline-md text-2xl font-bold text-on-surface mt-xs">
              Specialized Domains
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {specializedDomains.map((domain, index) => {
              const Icon = domain.icon;
              return (
                <div
                  key={index}
                  className={`${
                    domain.isLarge ? "md:col-span-2" : ""
                  } group relative overflow-hidden rounded-xl glass-panel p-lg ${domain.color} transition-all duration-300 cursor-pointer`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${domain.bgGradient || "from-white/5"} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <Icon className="w-12 h-12 mb-md shrink-0" />
                  <h4 className="font-headline-md text-xl font-bold text-on-surface mb-xs">
                    {domain.title}
                  </h4>
                  <p className="text-on-surface-variant text-sm opacity-70 leading-relaxed">
                    {domain.desc}
                  </p>
                  {domain.tags && (
                    <div className="mt-xl flex gap-xs">
                      {domain.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-code-sm text-xs px-xs py-1 bg-surface-variant/50 border border-white/10 rounded text-on-surface-variant"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Visuals Category Card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-high p-lg border border-white/5 hover:border-white/20 transition-all cursor-pointer">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-md">
                <div className="flex-1">
                  <Palette className="w-8 h-8 text-primary mb-md" />
                  <h4 className="font-bold text-on-surface text-xl mb-xs">
                    High-Fidelity Visuals
                  </h4>
                  <p className="text-on-surface-variant text-sm opacity-70 leading-relaxed max-w-sm">
                    Master Midjourney V6 and DALL-E 3 with photorealistic prompts.
                  </p>
                </div>
                <div className="w-28 h-28 rounded-lg bg-surface overflow-hidden border border-white/10 shrink-0 relative self-center sm:self-start">
                  <Image
                    alt="Generative Art"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNP_4OLvpiKYSD9Ut541uTM6Bo3WN-1eZai9AK6XkD1gxde9IWXPjO5CaUNIXeR-vJvx-z29ob9rfRT_2xl49Q7Y3nV_5vCehPp2v-ltZJs0fPsIXmf6tduJKpXIKfqwG5t9CcUeLQD0d17JlPX5eoyeSNoo_h0IRgEojhMK7-IkAAhHD-hC6q51MjyJiOOkwXO0xqvIciTvGvEj2hfc11gDHz8okDZFDQoGV0twBetYQ7Qu26K_3uxdhB8D9v16gcOgmtKiT1Pkng"
                    fill
                    sizes="112px"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING SECTION */}
      <section className="px-lg md:px-xl py-xl max-w-[1440px] mx-auto">
        <div className="flex items-center gap-md mb-xl">
          <h3 className="font-headline-md text-2xl font-bold text-on-surface shrink-0">
            Trending Prompts
          </h3>
          <div className="h-[1px] flex-1 bg-white/10"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {trendingPrompts.map((prompt, index) => (
            <Link key={index} href={`/marketplace/${prompt.slug}`} className="group block">
              <div className="aspect-video rounded-xl bg-surface-container-high border border-white/10 mb-md overflow-hidden relative shadow-lg">
                <Image
                  alt={prompt.title}
                  src={prompt.img}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-104"
                  unoptimized
                />
                <div className="absolute top-xs right-xs px-xs py-0.5 bg-black/80 backdrop-blur rounded font-code-sm text-xs text-tertiary flex items-center gap-1 font-bold">
                  <Star className="w-3 h-3 fill-tertiary text-tertiary shrink-0" />
                  <span>{prompt.rating}</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-on-surface group-hover:text-secondary transition-colors leading-tight">
                    {prompt.title}
                  </h5>
                  <p className="text-on-surface-variant text-sm mt-0.5">{prompt.creator}</p>
                </div>
                <span className="font-code-sm font-semibold text-on-surface select-none px-2 py-0.5 bg-white/5 rounded border border-white/5 shrink-0">
                  {prompt.price}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-xl py-xl px-xl border-t border-white/5 bg-surface-container-lowest/50 max-w-[1440px] mx-auto rounded-xl glass">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg">
          <div>
            <h4 className="font-display-lg text-lg font-bold text-on-surface">CodeCrate</h4>
            <p className="text-on-surface-variant text-sm mt-xs opacity-60">
              The professional standard for generative AI assets.
            </p>
          </div>
          <div className="flex gap-xl">
            <div className="flex flex-col gap-xs">
              <span className="font-label-caps text-[10px] text-tertiary font-bold">RESOURCES</span>
              <a className="text-sm text-on-surface-variant hover:text-white transition-colors" href="#">
                Documentation
              </a>
              <a className="text-sm text-on-surface-variant hover:text-white transition-colors" href="#">
                API Access
              </a>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-caps text-[10px] text-tertiary font-bold">LEGAL</span>
              <a className="text-sm text-on-surface-variant hover:text-white transition-colors" href="#">
                Privacy
              </a>
              <a className="text-sm text-on-surface-variant hover:text-white transition-colors" href="#">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="mt-xl pt-lg border-t border-white/5 flex justify-between items-center text-xs text-on-surface-variant">
          <span>© 2026 CodeCrate Inc. All rights reserved.</span>
          <div className="flex gap-md items-center">
            <span className="material-symbols-outlined text-sm">language</span>
            <span>Global / USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
