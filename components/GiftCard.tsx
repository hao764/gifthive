"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Gift, formatPrice, getAmazonUrl } from "@/lib/data";

type Props = {
  gift: Gift & { aiReason?: string; aiMatchScore?: number };
  index?: number;
  featured?: boolean;
  ctaLabel?: string;
  locked?: boolean;
};

const IMG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#f0ebe3"/><circle cx="400" cy="270" r="50" fill="#d4cec3"/><rect x="320" y="340" width="160" height="10" rx="5" fill="#d4cec3"/></svg>'
  );

export default function GiftCard({
  gift,
  index,
  featured = false,
  ctaLabel,
  locked = false,
}: Props) {
  const t = useTranslations("GiftCard");
  const indexStr =
    typeof index === "number" ? String(index).padStart(2, "0") : null;

  const resolvedCta = ctaLabel || t("shopOnAmazon");

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== IMG_FALLBACK) {
      img.src = IMG_FALLBACK;
    }
  };

  const handleShopClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getAmazonUrl(gift);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      window.location.href = url;
    }
  };

  const detailHref = gift.amazonUrl
    ? `/gift/${extractAsin(gift.amazonUrl)}`
    : null;

  if (locked) {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-ink/8 bg-cream-paper shadow-soft">
        <div className="relative overflow-hidden bg-cream-deep">
          <div className="relative aspect-[4/3] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gift.image}
              alt=""
              aria-hidden
              loading="lazy"
              onError={handleImgError}
              className="h-full w-full scale-105 object-cover blur-xl brightness-75 saturate-50"
            />
            <div className="absolute inset-0 bg-ink/45" />
            <div className="grain absolute inset-0 opacity-30 mix-blend-overlay" />
          </div>

          {indexStr && (
            <div className="absolute left-5 top-5 flex h-9 items-center rounded-full bg-cream/90 px-3 font-display text-xs font-medium italic text-ink/55 shadow-soft backdrop-blur-sm">
              N° {indexStr}
            </div>
          )}

          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[0.68rem] font-medium text-cream shadow-soft backdrop-blur-sm">
            <LockIcon />
            <span>{t("locked")}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-cream/95 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-widest text-ember-deep shadow-soft">
              <span className="text-[0.8rem]">🎁</span>
              {t("shareToReveal")}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-widest text-ink/30">
            <span className="h-2 w-16 rounded-full bg-ink/10" />
            <span className="h-1 w-1 rounded-full bg-ink/15" />
            <span className="h-2 w-10 rounded-full bg-ink/10" />
          </div>
          <div className="mt-3 h-5 w-3/4 rounded-full bg-ink/10" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-ink/8" />
          <div className="mt-5 flex-1 space-y-2">
            <div className="h-2.5 w-full rounded-full bg-ink/8" />
            <div className="h-2.5 w-5/6 rounded-full bg-ink/8" />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-5">
            <div className="h-5 w-14 rounded-full bg-ink/10" />
            <div className="h-9 w-28 rounded-full bg-ink/10" />
          </div>
        </div>
      </article>
    );
  }

  const Wrapper: any = detailHref ? Link : "article";
  const wrapperProps: any = detailHref
    ? { href: detailHref, scroll: false }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative flex flex-col overflow-hidden rounded-[1.75rem] border bg-cream-paper transition-all duration-700 ease-editorial hover:-translate-y-1.5 hover:shadow-lift ${
        featured
          ? "border-ember/30 shadow-card md:col-span-2 md:flex-row"
          : "border-ink/8 shadow-soft"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-cream-deep ${
          featured ? "md:w-1/2" : ""
        }`}
      >
        <div
          className={`relative w-full ${
            featured ? "aspect-[4/3] md:h-full" : "aspect-[4/3]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gift.image}
            alt={gift.name}
            loading="lazy"
            onError={handleImgError}
            className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/0 to-ink/0 opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="grain absolute inset-0 opacity-30 mix-blend-overlay" />
        </div>

        {indexStr && (
          <div className="absolute left-5 top-5 flex h-9 items-center rounded-full bg-cream/90 px-3 font-display text-xs font-medium italic text-ink/55 shadow-soft backdrop-blur-sm">
            N° {indexStr}
          </div>
        )}

        {gift.match > 0 && (
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 text-[0.68rem] font-medium text-cream shadow-soft backdrop-blur-sm">
            {gift.aiMatchScore !== undefined && (
              <span className="text-[0.7rem]">🤖</span>
            )}
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            <span className="tabular-nums">{gift.match}%</span>
            <span className="text-cream/50">{t("match")}</span>
          </div>
        )}

        {featured && (
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-widest text-ink shadow-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" />
            {t("editorsPick")}
          </div>
        )}
      </div>

      <div
        className={`flex flex-1 flex-col p-6 ${
          featured ? "md:w-1/2 md:p-9 md:justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-widest text-ink/40">
          <span>{gift.category}</span>
          <span className="h-1 w-1 rounded-full bg-ink/25" />
          <span className="italic normal-case tracking-normal">
            {t("from")} {gift.shop}
          </span>
        </div>

        <h3
          className={`mt-3 font-display font-semibold tracking-tighter text-ink ${
            featured ? "text-3xl md:text-[2.5rem] md:leading-[1.1]" : "text-xl"
          }`}
        >
          {gift.name}
        </h3>

        <p
          className={`mt-2 text-pretty leading-relaxed text-ink/65 ${
            featured ? "text-base md:text-lg" : "text-sm"
          }`}
        >
          {gift.tagline}
        </p>

        {gift.reason && (
          <div className="mt-5 border-l-2 border-ember/40 bg-cream-warm/40 py-3 pl-4 pr-3 glass">
            <p className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
              {gift.aiReason ? (
                <>
                  <span className="text-[0.75rem]">🤖</span>
                  {t("aiSays")}
                </>
              ) : (
                t("whyThisOne")
              )}
            </p>
            <p
              className={`mt-1.5 text-pretty leading-relaxed text-ink/70 ${
                featured ? "text-sm md:text-base" : "text-[0.82rem]"
              }`}
            >
              {gift.reason}
            </p>
          </div>
        )}

        {gift.tags?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {gift.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-ink/8 pt-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.62rem] uppercase tracking-widest text-ink/40">
                {t("price")}
              </p>
              <p className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-ink">
                {formatPrice(gift.price, gift.currency)}
              </p>
              <p className="mt-1 text-[0.62rem] leading-snug text-ink/40">
                {t("priceNote")}
                <br />
                {t("priceNote2")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleShopClick}
                className="group/btn inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-3 text-xs font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember"
              >
                {resolvedCta}
                <span className="transition-transform duration-500 ease-editorial group-hover/btn:translate-x-1">
                  →
                </span>
              </button>
              <p className="text-right text-[0.6rem] text-ink/40">
                {t("viewOnAmazon")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}

function extractAsin(url: string): string | null {
  if (!url) return null;
  const m =
    url.match(/\/dp\/([A-Z0-9]{10})/) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/) ||
    url.match(/\/product\/([A-Z0-9]{10})/) ||
    url.match(/[?&]asin=([A-Z0-9]{10})/);
  return m?.[1] ?? null;
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
