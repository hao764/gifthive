import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import GiftCard from "@/components/GiftCard";
import Reveal from "@/components/Reveal";
import {
  ALL_SEO_LANDING_SLUGS,
  getSeoLanding,
  type SeoLanding,
} from "@/lib/seo-landing-data";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";
export const dynamicParams = false; // 只允许 generateStaticParams() 里的 20 个 slug 进路由
export const revalidate = 604800; // 7 天重生成一次 —— 长尾内容不怎么变

export function generateStaticParams(): { slug: string }[] {
  return ALL_SEO_LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const land = getSeoLanding(slug);
  if (!land) return { title: "Not found — GiftHive" };
  const base = getSiteURL().replace(/\/$/, "");
  const url = `${base}/best-gifts/${slug}`;

  return {
    title: land.seoTitle,
    description: land.seoDescription,
    keywords: land.keywords,
    alternates: { canonical: `/best-gifts/${slug}` },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      url,
      siteName: "GiftHive",
      title: land.seoTitle,
      description: land.seoDescription,
      locale: "en_US",
      images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: land.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@gifthive",
      creator: "@gifthive",
      title: land.seoTitle,
      description: land.seoDescription,
      images: ["/og-default.svg"],
    },
  };
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const land = getSeoLanding(slug);
  if (!land) notFound();
  const base = getSiteURL().replace(/\/$/, "");
  const url = `${base}/best-gifts/${slug}`;

  const t = await getTranslations("Landing").catch(() => null as any);

  const gifts = land.giftPool.slice(0, land.giftCount);

  // ——— BlogPosting JSON-LD：告诉 Google 这是一篇内容长文（利于排名成 Featured Snippet）———
  const today = new Date();
  const isoDate = today.toISOString();
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: land.h1,
    description: land.seoDescription,
    image: [`${base}/og-default.svg`],
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      "@type": "Organization",
      name: "GiftHive Editorial",
      url: base,
    },
    publisher: {
      "@type": "Organization",
      name: "GiftHive",
      url: base,
      logo: { "@type": "ImageObject", url: `${base}/favicon.svg` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: land.keywords.join(", "),
    wordCount: Math.round(land.intro.length / 5) +
      land.whyHard.paragraphs.reduce((acc, p) => acc + p.length / 5, 0) +
      land.howWePicked.length / 5 +
      land.faq.reduce((acc, f) => acc + f.q.length / 5 + f.a.length / 5, 0),
    articleSection: "Gift Guide",
    inLanguage: "en",
    isPartOf: {
      "@type": "Blog",
      "@id": `${base}/#website`,
      name: "GiftHive Gift Guides",
    },
  };

  // ——— FAQPage JSON-LD：Google 搜索结果里的 FAQ accordion（拿 Featured Snippet 的关键）———
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: land.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // ——— BreadcrumbList JSON-LD：Home → Gift Guides → [This Page] ———
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Gift Guides", item: `${base}/journal` },
      { "@type": "ListItem", position: 3, name: land.h1.slice(0, 60) },
    ],
  };

  return (
    <article className="relative min-h-screen bg-cream text-ink">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-moss/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 md:px-8 md:pt-20">
        {/* ===== Breadcrumb ===== */}
        <Reveal className="mb-8 flex items-center gap-2 text-xs text-ink/45">
          <Link href="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/journal" className="transition-colors hover:text-ink">
            Gift Guides
          </Link>
          <span>/</span>
          <span className="text-ink/70 truncate">{land.h1.slice(0, 50)}</span>
        </Reveal>

        {/* ===== H1 + Meta line ===== */}
        <Reveal>
          <div className="mb-4 flex items-center gap-2">
            <span className="eyebrow">Gift Guide · 2026</span>
            <span className="h-px w-8 bg-ink/20" />
            <span className="text-[0.66rem] font-semibold uppercase tracking-widest text-ember-deep/80">
              {gifts.length} hand-picked picks
            </span>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <h1 className="font-display text-4xl font-semibold leading-[1.03] tracking-tighter text-ink md:text-[3.25rem]">
            {land.h1}
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-ink/70">
            {land.intro}
          </p>
        </Reveal>

        {/* ===== Table of contents (anchor links help SEO) ===== */}
        <Reveal delay={220}>
          <nav
            aria-label="Table of contents"
            className="glass mt-10 rounded-2xl border border-ink/8 bg-cream/60 p-6"
          >
            <p className="text-[0.66rem] font-semibold uppercase tracking-widest text-ink/45">
              In this guide
            </p>
            <ol className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { href: "#why-hard", label: land.whyHard.h2 },
                { href: "#how-we-picked", label: "How we picked these gifts" },
                { href: "#picks", label: `The ${gifts.length} best gifts` },
                { href: "#cta", label: "Take the 6-question Gift Finder" },
                { href: "#faq", label: `Frequently asked questions (${land.faq.length})` },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-ink/70 transition-colors hover:text-ember-deep"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-ember/40 transition-all duration-300 group-hover:bg-ember-deep group-hover:scale-125" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        {/* ===== Why hard section ===== */}
        <Reveal>
          <section id="why-hard" className="mt-20">
            <div className="mb-6 flex items-center gap-3">
              <span className="section-index">01</span>
              <h2 className="font-display text-3xl font-semibold tracking-tighter md:text-4xl">
                {land.whyHard.h2}
              </h2>
            </div>
            <div className="space-y-5">
              {land.whyHard.paragraphs.map((p, i) => (
                <p key={i} className="text-pretty leading-relaxed text-ink/70 md:text-[1.05rem]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ===== How we picked section ===== */}
        <Reveal>
          <section id="how-we-picked" className="mt-20">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-ink/8 bg-ink p-8 text-cream md:p-12">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-ember/25 blur-3xl" />
                <div className="grain absolute inset-0 opacity-40" />
              </div>
              <div className="relative">
                <div className="mb-5 flex items-center gap-3">
                  <span className="font-display text-sm italic text-cream/40">
                    02
                  </span>
                  <span className="h-px w-8 bg-cream/20" />
                  <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
                    Methodology
                  </span>
                </div>
                <h2 className="font-display text-3xl font-semibold leading-[1.05] tracking-tighter md:text-[2.75rem]">
                  How we picked these gifts
                </h2>
                <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-cream/75">
                  {land.howWePicked}
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ===== Product grid (the 6-8 gift cards) ===== */}
        <Reveal>
          <section id="picks" className="mt-20">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-index">03</span>
                  <span className="eyebrow">The picks</span>
                </div>
                <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tighter md:text-4xl">
                  The <span className="accent-italic text-ember-deep">{gifts.length}</span>{" "}
                  best gifts on this list
                </h2>
                <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink/60">
                  Every gift below is vetted, in-stock, linked through our affiliate partner,
                  and chosen specifically for this guide. Click any card to see full details.
                </p>
              </div>
              <Link
                href={`/${land.audienceCategorySlug}`}
                className="hidden group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink md:flex"
              >
                See all {land.audienceCategorySlug.replace(/^for-/, "").replace(/-/g, " ")} gifts
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gifts.map((gift, i) => (
                <Reveal key={gift.id} delay={i * 70}>
                  <GiftCard gift={gift} index={i + 1} ctaLabel="See details" />
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ===== CTA to quiz / category page ===== */}
        <Reveal>
          <section id="cta" className="mt-24">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-ink/8 bg-cream-warm/60 p-8 md:p-14">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/10 blur-3xl" />
              </div>
              <div className="relative mx-auto max-w-3xl text-center">
                <span className="eyebrow eyebrow-center">Still not sure?</span>
                <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tighter md:text-6xl">
                  Get 5 gifts{" "}
                  <span className="accent-italic text-ember-deep">
                    picked just for you
                  </span>
                  .
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink/60">
                  Answer 6 quick questions about the person you're buying for. Takes 90 seconds.
                  No personal info required.
                </p>
                <div className="mt-9 flex justify-center">
                  <Link href="/quiz" className="group btn-primary">
                    <span>Start the Gift Finder</span>
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ===== FAQ (mapped 1:1 from faq list — powers FAQPage JSON-LD) ===== */}
        <Reveal>
          <section id="faq" className="mt-24">
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="section-index">04</span>
                <span className="eyebrow">FAQ</span>
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tighter md:text-4xl">
                Frequently asked{" "}
                <span className="accent-italic text-ember-deep">questions</span>
              </h2>
            </div>

            <div className="divide-y divide-ink/8 rounded-2xl border border-ink/8 bg-cream/40">
              {land.faq.map((f, i) => (
                <details
                  key={i}
                  id={`faq-${i}`}
                  name="faq-group"
                  className="group p-6 open:bg-cream"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
                    <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-ink md:text-xl">
                      {f.q}
                    </h3>
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-all duration-300 group-open:rotate-45 group-open:border-ember/60 group-open:bg-ember/10 group-open:text-ember-deep"
                    >
                      +
                    </span>
                  </summary>
                  <div
                    className="mt-4 max-w-3xl text-pretty leading-relaxed text-ink/70"
                    dangerouslySetInnerHTML={{ __html: f.a.replace(/\n/g, "<br />") }}
                  />
                </details>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ===== Back to Home ===== */}
        <div className="mt-20 text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
          >
            <span className="transition-transform duration-500 ease-editorial group-hover:-translate-x-1">
              ←
            </span>
            Back to GiftHive home
          </Link>
        </div>
      </div>
    </article>
  );
}
