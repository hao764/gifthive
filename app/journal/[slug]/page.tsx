import Link from "next/link";
import { notFound } from "next/navigation";
import GiftCard from "@/components/GiftCard";
import Reveal from "@/components/Reveal";
import { articles } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const runtime = "edge";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("Journal");
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return { title: t("notFound") };
  return {
    title: `${article.title} ${t("articleMetaTitle")}`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const t = await getTranslations("Journal");
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) notFound();

  const others = articles.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <article>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden border-b border-ink/8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
          <div className="paper-texture absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto max-w-3xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
          <Reveal>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-ink/45 transition-colors hover:text-ink"
            >
              <span className="transition-transform duration-500 ease-editorial group-hover:-translate-x-1">
                ←
              </span>
              {t("backToJournal")}
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-6 flex items-center gap-3 text-[0.66rem] font-medium uppercase tracking-widest text-ink/45">
              <span className="rounded-full bg-ember/15 px-3 py-1 text-ember-deep">
                {article.category}
              </span>
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              <span>{article.readTime}</span>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tighter text-ink md:text-5xl md:text-[3.25rem]">
              {article.title}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-ink/65 md:text-xl">
              {article.excerpt}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ Cover image ============ */}
      <section className="border-b border-ink/8 bg-cream-deep/30">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem] shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={article.title}
                className="h-full w-full object-cover"
              />
              <div className="grain absolute inset-0 opacity-25" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Body ============ */}
      <section className="relative">
        <div className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="ornament-rule mb-12">
              <span className="font-display text-xs italic text-ink/35">✦</span>
            </div>
          </Reveal>

          <div className="space-y-6">
            {article.body.map((para, i) => (
              <Reveal key={i} delay={i * 40}>
                <p
                  className={`text-pretty leading-[1.75] text-ink/80 ${
                    i === 0
                      ? "first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-ember-deep"
                      : "text-base md:text-[1.05rem]"
                  }`}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Disclosure */}
          <Reveal>
            <div className="mt-14 rounded-[1rem] border border-ink/8 bg-cream-warm/40 p-5 text-xs leading-relaxed text-ink/55">
              <span className="font-semibold text-ink/70">{t("disclosureTitle")}</span>{" "}
              {t("disclosure")}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ Related picks ============ */}
      {article.relatedGifts && article.relatedGifts.length > 0 && (
        <section className="border-t border-ink/8 bg-cream-warm/40 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal className="mb-10 flex flex-col items-start gap-3">
              <span className="section-index">{t("relatedSectionIndex")}</span>
              <span className="eyebrow ml-4">{t("relatedEyebrow")}</span>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tighter text-ink md:text-4xl">
                {t("relatedTitle")}
              </h2>
              <p className="mt-2 text-pretty text-ink/60">
                {t("relatedDesc")}
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {article.relatedGifts.map((gift, i) => (
                <Reveal key={gift.id} delay={i * 90}>
                  <GiftCard gift={gift} index={i + 1} ctaLabel={t("keepReading")} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ More from the Journal ============ */}
      {others.length > 0 && (
        <section className="border-t border-ink/8 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal className="mb-10 flex items-end justify-between gap-6">
              <div>
                <span className="section-index">{t("moreSectionIndex")}</span>
                <span className="eyebrow ml-4">{t("moreEyebrow")}</span>
                <h2 className="mt-5 font-display text-3xl font-semibold tracking-tighter text-ink md:text-4xl">
                  {t("moreTitle")}
                </h2>
              </div>
              <Link
                href="/journal"
                className="group hidden items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink md:inline-flex"
              >
                {t("allArticles")}
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2">
              {others.map((a, i) => (
                <Reveal key={a.slug} delay={i * 90}>
                  <Link
                    href={`/journal/${a.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-cream-paper transition-all duration-700 ease-editorial hover:-translate-y-1.5 hover:shadow-card sm:flex-row"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep sm:w-2/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.image}
                        alt={a.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.06]"
                      />
                      <div className="grain absolute inset-0 opacity-25" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.66rem] font-medium uppercase tracking-widest text-ink/45">
                        {a.category} · {a.readTime}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tighter text-ink transition-colors duration-300 group-hover:text-ember-deep">
                        {a.title}
                      </h3>
                      <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-ink/60">
                        {a.excerpt}
                      </p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial group-hover:gap-3">
                        {t("keepReading")}
                        <span>→</span>
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
