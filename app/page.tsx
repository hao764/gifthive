import Link from "next/link";
import { getTranslations } from "next-intl/server";
import GiftCard from "@/components/GiftCard";
import HeroShowcase from "@/components/HeroShowcase";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { recipients, articles } from "@/lib/data";
import {
  getEditorsPicksFallback,
  getTotalGiftsCountFallback,
} from "@/lib/supabase";

export const runtime = "edge";

function formatGiftsFound(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
}

export default async function HomePage() {
  const t = await getTranslations("Home");
  const [editorsPicks, totalCount] = await Promise.all([
    getEditorsPicksFallback(4),
    getTotalGiftsCountFallback(),
  ]);

  const marqueeItems = [
    t("marquee.line1"),
    t("marquee.line2"),
    t("marquee.line3"),
    t("marquee.line4"),
    t("marquee.line5"),
  ];

  const finderSteps = [
    { n: "01", t: t("finder.steps.s1_title"), d: t("finder.steps.s1_desc") },
    { n: "02", t: t("finder.steps.s2_title"), d: t("finder.steps.s2_desc") },
    { n: "03", t: t("finder.steps.s3_title"), d: t("finder.steps.s3_desc") },
    { n: "04", t: t("finder.steps.s4_title"), d: t("finder.steps.s4_desc") },
    { n: "05", t: t("finder.steps.s5_title"), d: t("finder.steps.s5_desc") },
    { n: "06", t: t("finder.steps.s6_title"), d: t("finder.steps.s6_desc") },
  ];

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-moss/10 blur-3xl" />
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-ember/8 blur-[80px]" />
          <div className="paper-texture absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-8 md:pb-28 md:pt-16">
          <Reveal className="mb-10 flex items-center justify-between text-[0.66rem] uppercase tracking-widest text-ink/40">
            <span className="font-display italic">{t("brandLine")}</span>
            <span className="hidden font-display italic sm:block">
              {t("estLine")}
            </span>
          </Reveal>

          <div className="grid items-end gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <Reveal>
                <span className="eyebrow">{t("hero.eyebrow")}</span>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-6 font-display font-semibold leading-[0.98] tracking-tightest text-ink text-[3.25rem] sm:text-6xl md:text-[5.5rem]">
                  {t("hero.title1")}
                  <br />
                  {t("hero.title2")}
                  <span className="relative inline-block px-1">
                    <span className="relative z-10 accent-italic text-ember-deep">
                      {t("hero.title3")}
                    </span>
                    <span className="absolute -bottom-1 left-0 z-0 h-3 w-full origin-left -skew-x-6 animate-draw-line bg-ember/25" />
                  </span>
                  <span className="text-ember-deep">.</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink/65">
                  {t("hero.description")}
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link href="/quiz" className="group btn-primary">
                    <span>{t("hero.ctaPrimary")}</span>
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/for-him"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    {t("hero.ctaSecondary")}
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={320}>
                <div className="glass mt-12 grid max-w-md grid-cols-3 gap-6 rounded-2xl p-6">
                  {[
                    { num: "6", label: t("hero.stats.questions") },
                    { num: "5", label: t("hero.stats.picks") },
                    {
                      num: formatGiftsFound(totalCount),
                      label: t("hero.stats.catalog"),
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-3xl font-semibold tracking-tight text-ink">
                        {s.num}
                      </p>
                      <p className="mt-1 text-xs text-ink/50">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="md:col-span-5">
              <Reveal delay={200}>
                <HeroShowcase />
              </Reveal>
            </div>
          </div>
        </div>

        <div className="border-y border-ink/8 bg-cream-warm/40 py-4">
          <Marquee items={marqueeItems} />
        </div>
      </section>

      <section className="bg-cream-warm/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">{t("browse.sectionIndex")}</span>
              <span className="eyebrow ml-4">{t("browse.eyebrow")}</span>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                {t("browse.title1")}{" "}
                <span className="accent-italic text-ember-deep">
                  {t("browse.title2")}
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink/60">
                {t("browse.description")}
              </p>
            </div>
            <Link
              href="/for-him"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              {t("browse.seeAll")}
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
            {recipients.map((r, i) => (
              <Reveal
                key={r.slug}
                delay={i * 70}
                className={
                  i === 0
                    ? "col-span-2 md:col-span-2 md:row-span-2"
                    : ""
                }
              >
                <Link
                  href={`/${r.slug}`}
                  className="group relative block h-full overflow-hidden rounded-[1.5rem] border border-ink/8 bg-cream"
                >
                  <div
                    className={`relative w-full ${
                      i === 0
                        ? "aspect-square md:aspect-auto md:h-full md:min-h-[28rem]"
                        : "aspect-[4/5]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                    <div className="grain absolute inset-0 opacity-20" />
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs italic text-cream/55">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px w-5 bg-cream/30" />
                      <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-cream/70">
                        {r.label}
                      </span>
                    </div>
                    <h3
                      className={`mt-1.5 font-display font-semibold tracking-tight text-cream ${
                        i === 0 ? "text-3xl md:text-4xl" : "text-xl"
                      }`}
                    >
                      {r.heading}
                    </h3>
                    {i === 0 && (
                      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-cream/75">
                        {r.description}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-cream/90 transition-all duration-500 ease-editorial group-hover:gap-3">
                      {t("browse.browse")}
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 bg-ink p-8 text-cream md:p-14">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-ember/25 blur-3xl" />
                <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-ember-deep/20 blur-3xl" />
                <div className="grain absolute inset-0 opacity-50" />
              </div>

              <div className="relative grid items-center gap-10 md:grid-cols-2 md:gap-16">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm italic text-cream/40">
                      {t("finder.sectionIndex")}
                    </span>
                    <span className="h-px w-8 bg-cream/20" />
                    <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
                      {t("finder.eyebrow")}
                    </span>
                  </div>

                  <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tighter md:text-[3.25rem]">
                    {t("finder.title1")}
                    <br />
                    <span className="accent-italic text-ember">
                      {t("finder.title2")}
                    </span>
                    {t("finder.title3")}
                  </h2>
                  <p className="mt-5 max-w-md text-pretty leading-relaxed text-cream/65">
                    {t("finder.description")}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/quiz"
                      className="group inline-flex items-center gap-2 overflow-hidden rounded-full bg-ember px-7 py-3.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial hover:bg-ember-soft hover:shadow-glow"
                    >
                      <span>{t("finder.ctaStart")}</span>
                      <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                    <span className="text-xs text-cream/50">
                      {t("finder.aboutTime")}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <div className="grid gap-3">
                    {finderSteps.map((s) => (
                      <div
                        key={s.n}
                        className="group glass-dark flex items-center gap-4 rounded-2xl p-4 transition-all duration-500 ease-editorial hover:border-ember/40"
                      >
                        <span className="font-display text-lg font-semibold italic text-ember">
                          {s.n}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-cream">
                            {s.t}
                          </p>
                          <p className="text-xs text-cream/50">{s.d}</p>
                        </div>
                        <span className="h-1.5 w-1.5 rounded-full bg-cream/30 transition-colors group-hover:bg-ember" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-ink/8 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">{t("editors.sectionIndex")}</span>
              <span className="eyebrow ml-4">{t("editors.eyebrow")}</span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                {t("editors.title1")}{" "}
                <span className="accent-italic text-ember-deep">
                  {t("editors.title2")}
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink/60">
                {t("editors.description")}
              </p>
            </div>
            <Link
              href="/for-him"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              {t("editors.seeAll")}
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {editorsPicks.map((gift, i) => (
              <Reveal key={gift.id} delay={i * 80}>
                <GiftCard
                  gift={gift}
                  index={i + 1}
                  ctaLabel={t("editors.seeAll")}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/8 bg-cream-warm/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">{t("journal.sectionIndex")}</span>
              <span className="eyebrow ml-4">{t("journal.eyebrow")}</span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                {t("journal.title1")}{" "}
                <span className="accent-italic text-ember-deep">
                  {t("journal.title2")}
                </span>
              </h2>
            </div>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              {t("journal.seeAll")}
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {articles.map((article, i) => (
              <Reveal key={article.slug} delay={i * 90}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/8 bg-cream-paper transition-all duration-700 ease-editorial hover:-translate-y-1.5 hover:shadow-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream-deep">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1100ms] ease-editorial group-hover:scale-[1.06]"
                    />
                    <div className="grain absolute inset-0 opacity-25" />
                    <span className="absolute left-4 top-4 rounded-full bg-cream/95 px-3 py-1 text-[0.66rem] font-medium text-ink backdrop-blur-sm">
                      {article.category}
                    </span>
                    <span className="absolute right-4 top-4 font-display text-xs italic text-cream/85">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs text-ink/45">{article.readTime}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-tighter text-ink transition-colors duration-300 group-hover:text-ember-deep">
                      {article.title}
                    </h3>
                    <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-ink/60">
                      {article.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial group-hover:gap-3">
                      {t("journal.keepReading")}
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 md:py-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <span className="eyebrow eyebrow-center">{t("closing.eyebrow")}</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-6xl">
              {t("closing.title1")}{" "}
              <span className="accent-italic text-ember-deep">
                {t("closing.title2")}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink/60">
              {t("closing.description")}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex justify-center">
              <Link href="/quiz" className="group btn-primary">
                <span>{t("closing.cta")}</span>
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
