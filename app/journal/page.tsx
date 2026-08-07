import Link from "next/link";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { articles } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const runtime = "edge";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Journal");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function JournalIndexPage() {
  const t = await getTranslations("Journal");

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
          <div className="paper-texture absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
          <Reveal>
            <div className="flex items-center gap-4 text-[0.66rem] uppercase tracking-widest text-ink/40">
              <span className="font-display italic">{t("brandLine")}</span>
              <span className="h-px flex-1 bg-ink/10" />
              <span className="font-display italic">{t("estLine")}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <span className="eyebrow mt-10 inline-block">{t("sectionIndex")}</span>
          </Reveal>

          <Reveal delay={140}>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tighter text-ink md:text-6xl md:text-[4rem]">
              {t("title")}
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink/65 md:text-xl">
              {t("description")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ Marquee ============ */}
      <Marquee
        items={[
          t("marquee.line1"),
          t("marquee.line2"),
          t("marquee.line3"),
          t("marquee.line4"),
        ]}
      />

      {/* ============ Articles list ============ */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="space-y-8">
            {articles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 80}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="group grid overflow-hidden rounded-[1.5rem] border border-ink/8 bg-cream-paper transition-all duration-700 ease-editorial hover:-translate-y-1 hover:shadow-card md:grid-cols-[1.4fr_1fr]"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep md:aspect-auto md:h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.05]"
                    />
                    <div className="grain absolute inset-0 opacity-25" />
                    <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1 text-[0.66rem] font-medium text-ink backdrop-blur-sm">
                      {article.category}
                    </span>
                    <span className="absolute right-4 top-4 font-display text-xs italic text-cream/85">
                      {t("numberPrefix")} {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center p-7 md:p-10">
                    <p className="text-[0.66rem] font-medium uppercase tracking-widest text-ink/45">
                      {article.readTime}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold leading-snug tracking-tighter text-ink transition-colors duration-300 group-hover:text-ember-deep md:text-3xl">
                      {article.title}
                    </h2>
                    <p className="mt-4 text-pretty leading-relaxed text-ink/65">
                      {article.excerpt}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial group-hover:gap-3">
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
    </>
  );
}
