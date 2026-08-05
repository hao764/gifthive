import Link from "next/link";
import { notFound } from "next/navigation";
import GiftCard from "@/components/GiftCard";
import Reveal from "@/components/Reveal";
import {
  getProductByAsin,
  getRelatedProducts,
} from "@/lib/supabase";
import {
  AFFILIATE_TAG,
  fixImageUrl,
  formatPrice,
  productToGift,
  type Gift,
} from "@/lib/data";
import type { Metadata } from "next";

// ---------- 静态生成 ----------
// 构建时尽量预渲染所有 ASIN（给 SEO + CDN），但如果构建时没拿到数据库 ASIN（例如构建环境变量缺失），
// 则允许 dynamicParams=true，让访问时再按需动态渲染（SSR），避免直接 404 "没找到有效网页"
export const dynamicParams = true;
export const revalidate = 86400;
// Cloudflare Pages 需要 Edge Runtime
export const runtime = "edge";

export async function generateStaticParams() {
  // 通过 REST API 直接拿所有 ASIN，避免在 build 时依赖 Supabase JS 客户端的运行时
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const res = await fetch(`${url}/rest/v1/products?select=asin&asin=not.is.null&limit=1000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      // 构建期间允许用新数据
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const rows: { asin: string }[] = await res.json();
    return rows.map((r) => ({ asin: r.asin }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ asin: string }>;
}): Promise<Metadata> {
  const { asin } = await params;
  const product = await getProductByAsin(asin);
  if (!product) return { title: "Gift not found — GiftHive" };
  return {
    title: `${product.name} — GiftHive`,
    description: product.description,
    openGraph: {
      title: `${product.name} — GiftHive`,
      description: product.description,
      images: [{ url: fixImageUrl(product.name, product.image_url) }],
    },
  };
}

export default async function GiftDetailPage({
  params,
}: {
  params: Promise<{ asin: string }>;
}) {
  const { asin } = await params;
  const product = await getProductByAsin(asin);
  if (!product) {
    notFound();
  }

  const gift = productToGift(product);
  const related = await getRelatedProducts(product, 4);
  const relatedGifts: Gift[] = related.map(productToGift);

  // 人群标签 → 人类可读
  const audienceLabel = (a?: string) => {
    const map: Record<string, string> = {
      "for-him": "For Him",
      "for-her": "For Her",
      "for-kids": "For Kids",
      "for-parents": "For Parents",
      "for-friends": "For Friends",
      "for-coworkers": "For Coworkers",
    };
    return a ? map[a] ?? a : "";
  };

  return (
    <article className="relative">
      {/* 顶部留白 + 背景光晕 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-moss/8 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
        {/* 面包屑 */}
        <Reveal className="mb-8 flex items-center gap-2 text-xs text-ink/45">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          {product.audience_tags?.[0] && (
            <>
              <Link
                href={`/${product.audience_tags[0]}`}
                className="transition-colors hover:text-ink"
              >
                {audienceLabel(product.audience_tags[0])}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-ink/70">{product.name}</span>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {/* ============ 左：大图 ============ */}
          <Reveal>
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-ink/10 shadow-lift">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gift.image}
                alt={gift.name}
                className="h-full w-full object-cover"
              />
              <div className="grain absolute inset-0 opacity-20" />
              <div className="absolute left-5 top-5 rounded-full bg-cream/90 px-3 py-1 text-[0.66rem] font-medium uppercase tracking-widest text-ink shadow-soft backdrop-blur-sm">
                {gift.category}
              </div>
              {product.asin && (
                <div className="absolute bottom-5 left-5 rounded-full bg-ink/85 px-3 py-1 text-[0.6rem] font-medium tracking-wider text-cream backdrop-blur-sm">
                  ASIN · {product.asin}
                </div>
              )}
            </div>
          </Reveal>

          {/* ============ 右：商品信息 + CTA ============ */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col">
              {/* 标签 */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {product.audience_tags.map((t) => (
                  <Link
                    key={t}
                    href={`/${t}`}
                    className="tag-pill transition-colors hover:bg-ember/20"
                  >
                    {audienceLabel(t)}
                  </Link>
                ))}
                {product.occasion_tags.map((t) => (
                  <span key={t} className="tag-pill capitalize">
                    {t}
                  </span>
                ))}
                <span className="tag-pill capitalize">{product.price_range}</span>
              </div>

              {/* 商品名 */}
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-5xl">
                {product.name}
              </h1>

              {/* 描述 */}
              <p className="mt-5 text-pretty text-lg leading-relaxed text-ink/70">
                {product.description}
              </p>

              {/* 用户评价金句 */}
              {product.review_quote && (
                <blockquote className="mt-6 border-l-2 border-ember/50 bg-cream-warm/40 py-3 pl-5 pr-4 glass">
                  <p className="font-display text-base italic leading-relaxed text-ink/80">
                    &ldquo;{product.review_quote}&rdquo;
                  </p>
                  <p className="mt-2 text-[0.66rem] uppercase tracking-widest text-ink/40">
                    — Verified Amazon review
                  </p>
                </blockquote>
              )}

              {/* 价格 + CTA */}
              <div className="mt-8 border-t border-ink/8 pt-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-widest text-ink/40">
                      Price
                    </p>
                    <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink">
                      {formatPrice(gift.price, gift.currency)}
                    </p>
                    <p className="mt-1.5 text-[0.66rem] leading-snug text-ink/45">
                      Price as of Aug 2026 · Affiliate link
                      <br />
                      Prices may vary on Amazon.
                    </p>
                  </div>
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember"
                  >
                    Shop on Amazon
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>

              {/* 透明披露 */}
              <p className="mt-6 text-[0.62rem] leading-relaxed text-ink/35">
                As an Amazon Associate, GiftHive earns from qualifying purchases.
                This page may contain affiliate links — clicking them costs you
                nothing but supports our editorial work.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ============ 相关推荐 ============ */}
        {relatedGifts.length > 0 && (
          <section className="mt-24">
            <Reveal className="mb-10 flex items-end justify-between">
              <div>
                <span className="eyebrow">You might also like</span>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-tighter text-ink md:text-4xl">
                  More from{" "}
                  <span className="accent-italic text-ember-deep">
                    {audienceLabel(product.audience_tags?.[0])}
                  </span>
                </h2>
              </div>
              {product.audience_tags?.[0] && (
                <Link
                  href={`/${product.audience_tags[0]}`}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
                >
                  See all
                  <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedGifts.map((g, i) => (
                <Reveal key={g.id} delay={i * 70}>
                  <GiftCard gift={g} index={i + 1} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* 返回首页 */}
        <div className="mt-20 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
          >
            <span className="transition-transform duration-500 ease-editorial group-hover:-translate-x-1">
              ←
            </span>
            Back to home
          </Link>
        </div>
      </div>
    </article>
  );
}
