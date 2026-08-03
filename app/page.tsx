import Link from "next/link";
import GiftCard from "@/components/GiftCard";
import HeroShowcase from "@/components/HeroShowcase";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import { recipients, articles } from "@/lib/data";
import {
  getEditorsPicksFallback,
  getTotalGiftsCountFallback,
} from "@/lib/supabase";

function formatGiftsFound(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 100) return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
}

export default async function HomePage() {
  const [editorsPicks, totalCount] = await Promise.all([
    getEditorsPicksFallback(4),
    getTotalGiftsCountFallback(),
  ]);
  return (
    <>
      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[28rem] w-[28rem] rounded-full bg-moss/10 blur-3xl" />
          <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-ember/8 blur-[80px]" />
          <div className="paper-texture absolute inset-0 opacity-60" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-8 md:pb-28 md:pt-16">
          {/* Editorial top row — 去掉假刊号，换成真实品牌线 */}
          <Reveal className="mb-10 flex items-center justify-between text-[0.66rem] uppercase tracking-widest text-ink/40">
            <span className="font-display italic">GiftHive · The Gift Studio</span>
            <span className="hidden font-display italic sm:block">EST. 2026</span>
          </Reveal>

          <div className="grid items-end gap-10 md:grid-cols-12 md:gap-8">
            {/* Left: headline + glass panel */}
            <div className="md:col-span-7">
              <Reveal>
                <span className="eyebrow">No. 01 · Pick the right gift, skip the guessing</span>
              </Reveal>

              <Reveal delay={80}>
                <h1 className="mt-6 font-display font-semibold leading-[0.98] tracking-tightest text-ink text-[3.25rem] sm:text-6xl md:text-[5.5rem]">
                  Finding a gift
                  <br />
                  doesn't have to be
                  <span className="relative inline-block px-1">
                    <span className="relative z-10 accent-italic text-ember-deep">
                      this hard
                    </span>
                    <span className="absolute -bottom-1 left-0 z-0 h-3 w-full origin-left -skew-x-6 animate-draw-line bg-ember/25" />
                  </span>
                  <span className="text-ember-deep">.</span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-ink/65">
                  Answer{" "}
                  <span className="accent-italic text-ink">six questions</span>,
                  get five gifts picked by{" "}
                  <span className="underline-mark">
                    AI that reads the whole catalog
                  </span>{" "}
                  — five, not 200.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link href="/quiz" className="group btn-primary">
                    <span>Start the 6-step finder</span>
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/for-him"
                    className="group inline-flex items-center gap-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
                  >
                    Or browse by recipient
                    <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </Reveal>

              {/* Stats — Apple glass card（数字全部真实，非编造） */}
              <Reveal delay={320}>
                <div className="glass mt-12 grid max-w-md grid-cols-3 gap-6 rounded-2xl p-6">
                  {[
                    { num: "6", label: "questions" },
                    { num: "5", label: "AI picks" },
                    { num: formatGiftsFound(totalCount), label: "in the catalog" },
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

            {/* Right: hero image + floating cards */}
            <div className="md:col-span-5">
              <Reveal delay={200}>
                <HeroShowcase />
              </Reveal>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-ink/8 bg-cream-warm/40 py-4">
          <Marquee
            items={[
              "GIFTHIVE · The Gift Studio",
              "Pick the right gift, skip the guessing",
              "Six steps, five picks, truly chosen",
              "EST. 2026",
              "A gift they'll actually use",
            ]}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* No.02 · Browse by recipient                                  */}
      {/* ============================================================ */}
      <section className="bg-cream-warm/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">No. 02</span>
              <span className="eyebrow ml-4">Browse by recipient</span>
              <h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                Know the person first,{" "}
                <span className="accent-italic text-ember-deep">the gift second</span>.
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink/60">
                Everyone plays a different role in your life. Starting from who
                they are beats starting from what's trending.
              </p>
            </div>
            <Link
              href="/for-him"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              See all recipients
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
                className={i === 0 ? "col-span-2 md:col-span-2 md:row-span-2" : ""}
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
                      Browse
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* No.03 · Embedded finder                                      */}
      {/* ============================================================ */}
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
                      No. 03
                    </span>
                    <span className="h-px w-8 bg-cream/20" />
                    <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
                      Embedded finder
                    </span>
                  </div>

                  <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tighter md:text-[3.25rem]">
                    Skip the endless scroll.
                    <br />
                    <span className="accent-italic text-ember">AI reads</span>,
                    you pick.
                  </h2>
                  <p className="mt-5 max-w-md text-pretty leading-relaxed text-cream/65">
                    We split "what should I get?" into six small questions —
                    who, occasion, budget, interests, personality, your
                    relationship.{" "}
                    <span className="accent-italic text-cream/85">
                      No personal stuff, just sharper than you'd expect.
                    </span>
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link
                      href="/quiz"
                      className="group inline-flex items-center gap-2 overflow-hidden rounded-full bg-ember px-7 py-3.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial hover:bg-ember-soft hover:shadow-glow"
                    >
                      <span>Start now</span>
                      <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                        →
                      </span>
                    </Link>
                    <span className="text-xs text-cream/50">
                      About 2 minutes · No sign-up
                    </span>
                  </div>
                </div>

                {/* Steps preview */}
                <div className="relative">
                  <div className="grid gap-3">
                    {[
                      { n: "01", t: "Who it's for", d: "Partner · Parent · Sibling · Friend" },
                      { n: "02", t: "The occasion", d: "Birthday · Anniversary · Holiday · Thanks" },
                      { n: "03", t: "The budget", d: "A range, or let us decide" },
                      { n: "04", t: "Interests", d: "Tech · Coffee · Outdoors · Reading" },
                      { n: "05", t: "Personality", d: "Practical / Romantic / Minimalist" },
                      { n: "06", t: "Relationship", d: "Partner · Family · Close friend · Coworker" },
                    ].map((s) => (
                      <div
                        key={s.n}
                        className="group glass-dark flex items-center gap-4 rounded-2xl p-4 transition-all duration-500 ease-editorial hover:border-ember/40"
                      >
                        <span className="font-display text-lg font-semibold italic text-ember">
                          {s.n}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-cream">{s.t}</p>
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

      {/* ============================================================ */}
      {/* No.04 · Editor's picks                                       */}
      {/* ============================================================ */}
      <section className="border-t border-ink/8 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">No. 04</span>
              <span className="eyebrow ml-4">Editor's picks</span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                This week, we picked{" "}
                <span className="accent-italic text-ember-deep">these</span>.
              </h2>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink/60">
                Not a best-seller list — what our editors wanted to buy, or just
                bought. With the reason why.
              </p>
            </div>
            <Link
              href="/for-him"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              See all picks
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {editorsPicks.map((gift, i) => (
              <Reveal key={gift.id} delay={i * 80}>
                <GiftCard gift={gift} index={i + 1} ctaLabel="Shop" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* No.05 · Journal                                              */}
      {/* ============================================================ */}
      <section className="border-t border-ink/8 bg-cream-warm/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-index">No. 05</span>
              <span className="eyebrow ml-4">Journal</span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tighter text-ink md:text-5xl">
                Before you pick,{" "}
                <span className="accent-italic text-ember-deep">read two lines</span>.
              </h2>
            </div>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink/60 transition-colors hover:text-ink"
            >
              All articles
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
                      Keep reading
                      <span>→</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* No.06 · Closing CTA                                          */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/8 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <span className="eyebrow eyebrow-center">No. 06 · Still unsure?</span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-6xl">
              Hand the headache to a{" "}
              <span className="accent-italic text-ember-deep">six-step quiz</span>.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink/60">
              No sign-up, no email. Two minutes, five picks chosen with care.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex justify-center">
              <Link href="/quiz" className="group btn-primary">
                <span>Start the finder</span>
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
