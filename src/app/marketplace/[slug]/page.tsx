import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { Star, ShieldCheck, Terminal, Cpu, ShoppingBag } from "lucide-react";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      seller: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
      images: true,
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Calculate rating distribution or fallback
  const averageRating = product.rating || 5.0;
  const reviewCount = product.reviews.length;

  const sellerProducts = await prisma.product.findMany({
    where: { sellerId: product.sellerId },
    select: { rating: true }
  });
  const sellerRating = sellerProducts.length > 0
    ? sellerProducts.reduce((sum, p) => sum + p.rating, 0) / sellerProducts.length
    : 5.0;

  // Format pricing snapshot
  const formattedPrice = Number(product.price).toFixed(2);

  // Load related prompts from the same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      model: true,
      thumbnail: true,
      rating: true,
    },
  });

  // Prepare CartItem serialization format
  const cartItemData = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: Number(product.price),
    thumbnail: product.thumbnail,
    model: product.model,
    sellerName: product.seller.companyName || product.seller.user.name || "Creator",
  };

  return (
    <div className="min-h-screen pb-24 px-gutter md:px-xl py-xl bg-background max-w-[1440px] mx-auto space-y-xl">
      {/* Breadcrumb Header */}
      <div className="text-xs text-on-surface-variant flex items-center gap-xs">
        <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-on-surface-variant/60">{product.category.name}</span>
        <span>/</span>
        <span className="text-white truncate font-semibold">{product.title}</span>
      </div>

      {/* Main split details panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left Column: Media Gallery Carousel and Prompt specs */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Main Cover Image */}
          <div className="aspect-video rounded-2xl bg-surface-container-high border border-white/10 overflow-hidden relative shadow-2xl">
            <Image
              alt={product.title}
              src={product.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Product Gallery Carousel Images */}
          {product.images.length > 1 && (
            <div className="flex gap-sm overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <div key={img.id} className="w-28 aspect-video rounded-lg overflow-hidden border border-white/15 relative shrink-0">
                  <Image
                    alt={`${product.title} screenshot ${i + 1}`}
                    src={img.url}
                    fill
                    sizes="112px"
                    className="object-cover cursor-pointer hover:opacity-85 transition-opacity"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {/* Product Info Block */}
          <div className="space-y-md">
            <div className="flex flex-wrap items-center gap-sm">
              <span className="bg-secondary-container/15 text-secondary px-sm py-[3px] rounded-lg text-xs font-label-caps border border-secondary-container/20 font-bold">
                {product.model}
              </span>
              <span className="bg-surface-variant text-on-surface px-sm py-[3px] rounded-lg text-xs font-medium border border-white/5">
                {product.category.name}
              </span>
              <div className="flex items-center gap-1 text-tertiary text-sm font-bold">
                <Star className="w-4 h-4 fill-tertiary text-tertiary" />
                <span>{averageRating.toFixed(1)}</span>
                <span className="text-xs text-on-surface-variant font-normal">({reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="font-display-lg text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
              {product.title}
            </h2>

            <div className="text-on-surface-variant leading-relaxed text-sm opacity-90 whitespace-pre-line border-t border-white/5 pt-md">
              {product.description}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Card and Seller details */}
        <div className="lg:col-span-1 space-y-lg">
          {/* Main Purchase Card */}
          <div className="glass glass-shine rounded-2xl p-lg space-y-lg shadow-2xl">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-on-surface-variant font-label-caps">ASSET PRICE</span>
              <span className="text-3xl font-bold font-code-sm text-on-surface">${formattedPrice}</span>
            </div>

            <div className="space-y-sm">
              {/* Client Action AddToCart Button */}
              <AddToCartButton item={cartItemData} />

              <div className="text-center py-xs">
                <span className="text-[10px] text-on-surface-variant opacity-65 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
                  Immediate delivery to My Vault after payment check.
                </span>
              </div>
            </div>

            {/* Platform Trust / Verified badge */}
            <div className="pt-md border-t border-white/5 flex items-start gap-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-xs">
                  Verified by Peers Badge
                </h5>
                <p className="text-[11px] text-on-surface-variant opacity-75 mt-0.5 leading-normal">
                  This prompt was inspected by independent engineers and pre-validated to generate accurate, high-fidelity model workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Seller / Creator Card */}
          <div className="glass glass-shine rounded-2xl p-lg space-y-md">
            <h4 className="text-xs font-bold text-on-surface-variant font-label-caps uppercase tracking-wider">
              Asset Creator
            </h4>
            <div className="flex items-center gap-sm">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 relative shrink-0 bg-surface-container">
                <Image
                  alt={product.seller.companyName || "Seller Profile"}
                  src={product.seller.user.avatar || "/default-avatar.png"}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h5 className="font-bold text-on-surface flex items-center gap-xs leading-none">
                  {product.seller.companyName || "Studio Developer"}
                  {product.seller.verified && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 font-label-caps">
                      VERIFIED
                    </span>
                  )}
                </h5>
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Creator score: <span className="text-secondary font-bold font-code-sm">{sellerRating.toFixed(1)} ★</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-normal opacity-80 pt-xs border-t border-white/5">
              {product.seller.bio || "No biography provided by the creator."}
            </p>
          </div>
        </div>
      </div>

      {/* Review Ratings List Section */}
      <section className="space-y-md">
        <div className="border-t border-white/5 pt-lg flex items-center gap-xs">
          <Cpu className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-bold">Buyer Reviews & Trust</h3>
        </div>

        {product.reviews.length === 0 ? (
          <div className="glass rounded-xl p-lg text-center text-xs text-on-surface-variant opacity-70">
            No reviews yet. Purchase this prompt to post the first peer review rating!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="glass p-md rounded-xl space-y-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-xs">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 relative shrink-0 bg-surface-container">
                      <Image
                        alt={rev.user.name || "Reviewer"}
                        src={rev.user.avatar || "/default-avatar.png"}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="text-xs font-bold">{rev.user.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-xs text-tertiary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 shrink-0 ${
                          i < rev.rating ? "fill-tertiary" : "text-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="space-y-md">
          <div className="border-t border-white/5 pt-lg">
            <h3 className="text-lg font-bold">Related Prompt Assets</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {relatedProducts.map((rel) => (
              <Link key={rel.id} href={`/marketplace/${rel.slug}`} className="glass p-sm rounded-xl flex flex-col gap-xs hover:border-secondary/30 transition-colors group">
                <div className="aspect-video bg-surface-container rounded-lg overflow-hidden relative shrink-0 mb-1">
                  <Image
                    alt={rel.title}
                    src={rel.thumbnail || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop"}
                    fill
                    sizes="150px"
                    className="object-cover group-hover:scale-102 transition-transform duration-200"
                    unoptimized
                  />
                  <div className="absolute top-xs right-xs px-1 py-0.5 bg-black/80 backdrop-blur rounded font-code-sm text-[9px] text-tertiary flex items-center font-bold">
                    <span>{rel.rating.toFixed(1)} ★</span>
                  </div>
                </div>
                <div className="flex justify-between items-baseline px-xs">
                  <h4 className="text-sm font-bold text-on-surface group-hover:text-secondary transition-colors truncate max-w-[150px]">
                    {rel.title}
                  </h4>
                  <span className="font-code-sm text-xs text-on-surface-variant font-semibold">
                    ${Number(rel.price).toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] text-secondary font-label-caps px-xs pb-xs font-semibold uppercase">{rel.model}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
