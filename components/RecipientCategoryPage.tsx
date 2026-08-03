"use client";

import Link from "next/link";
import { useState } from "react";
import GiftCard from "@/components/GiftCard";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import type { Gift } from "@/lib/data";

type Props = {
  /** Recipient display name, e.g. "For Her" */
  heading: string;
  /** Short eyebrow, e.g. "For Her" */
  label: string;
  /** Slug used for breadcrumb / index, e.g. "for-her" */
  slug: string;
  /** Ordinal out of 6, e.g. 2 -> "02 / 06" */
  index: number;
  /** Lede paragraph (supports JSX for italic accents) */
  lede: React.ReactNode;
  /** Marquee items */
  marquee: string[];
  /** "ranked by" tail, e.g. "what she'd love" */
  rankedBy: string;
  /** Gift list */
  gifts: Gift[];
  /** Computed filter list — usually ["All", ...unique categories] */
  filters: string[];
  /** Starting price, e.g. "$24" */
  fromPrice: string;
};

export default function RecipientCategoryPage({
  heading,
  label,
  slug,
  index,
  lede,
  marquee,
  rankedBy,
  gifts,
  filters,
  fromPrice,
}: Props) {
  const [active, setActive] = useState("All");

  const visible =
    active === "All"
      ? gifts
      : gifts.filter((g) => g.category === active);

  return (
    <section className="relative overflow-hidden">
      {/* ============ Category header ============ */}
      <div className="relative overflow-hidden border-b border-ink/8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />
          <div className="paper-texture absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-ink/45">
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span className="text-ink/25">/</span>
            <span className="text-ink/70">{label}</span>
          </nav>

          <div className="mt-6 grid items-end gap-8 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm italic text-ink/40">
                  Category
                </span>
                <span className="h-px w-8 bg-ink/20" />
                <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                  {String(index).padStart(2, "0")} / 06
                </span>
              </div>

              <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.95] tracking-tightest text-ink md:text-[8rem]">
                {heading}
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink/65">
                {lede}
              </p>
            </div>

            {/* Stats */}
            <div className="md:col-span-4">
              <div className="grid grid-cols-3 gap-4 rounded-3xl border border-ink/8 bg-cream-warm/40 p-6">
                {[
                  { n: `${gifts.length}`, l: "picks" },
                  { n: `${filters.length - 1}`, l: "tags" },
                  { n: fromPrice, l: "from" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="font-display text-3xl font-semibold tracking-tight text-ink">
                      {s.n}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-t border-ink/8 bg-cream-warm/30 py-4">
          <Marquee items={marquee} />
        </div>
      </div>

      {/* ============ Filters (functional) ============ */}
      <div className="glass sticky top-[68px] z-30 border-b border-white/30 md:top-[76px]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-4 md:px-8">
          {filters.map((f) => {
            const isActive = f === active;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                aria-pressed={isActive}
                className={`flex-none rounded-full border px-4 py-2 text-sm font-medium transition-all duration-500 ease-editorial ${
                  isActive
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/15 text-ink/65 hover:border-ink/40 hover:text-ink"
                }`}
              >
                {f}
              </button>
            );
          })}
          <span className="ml-auto hidden flex-none items-center gap-2 text-xs text-ink/40 md:flex">
            <span className="font-display italic">Ranked by</span>
            <span>{rankedBy}</span>
          </span>
        </div>
      </div>

      {/* ============ Grid ============ */}
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        {visible.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((gift, i) => (
              <Reveal key={gift.id} delay={(i % 3) * 80}>
                <GiftCard gift={gift} index={i + 1} ctaLabel="Shop" />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-2xl italic text-ink/50">
              No picks in this category yet.
            </p>
            <p className="mt-2 text-sm text-ink/45">
              Try another tag, or let the finder choose.
            </p>
          </div>
        )}

        {/* ============ End CTA ============ */}
        <div className="mt-14 flex flex-col items-center gap-4 border-t border-ink/8 pt-12 text-center">
          <div className="ornament-rule w-full max-w-xs">
            <span className="font-display text-xs italic text-ink/35">✦</span>
          </div>
          <p className="text-sm text-ink/55">
            Still nothing?{" "}
            <span className="accent-italic text-ink">
              Then let the finder do it.
            </span>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/quiz" className="group btn-primary">
              <span>Try the finder</span>
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link href="/" className="btn-ghost">
              Back home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
