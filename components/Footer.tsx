import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Marquee from "@/components/Marquee";
import NewsletterForm from "@/components/NewsletterForm";

const footerNavKeys = [
  {
    titleKey: "recipients",
    links: [
      { labelKey: "forHim", href: "/for-him" },
      { labelKey: "forHer", href: "/for-her" },
      { labelKey: "forKids", href: "/for-kids" },
      { labelKey: "forParents", href: "/for-parents" },
    ],
  },
  {
    titleKey: "tools",
    links: [
      { labelKey: "finder", href: "/quiz" },
      { labelKey: "results", href: "/results" },
      { labelKey: "budget", href: "#" },
      { labelKey: "calendar", href: "#" },
    ],
  },
  {
    titleKey: "about",
    links: [
      { labelKey: "howWePick", href: "#" },
      { labelKey: "team", href: "#" },
      { labelKey: "contact", href: "#" },
      { labelKey: "submit", href: "#" },
    ],
  },
];

export default async function Footer() {
  const t = await getTranslations("Footer");
  const marqueeItems = [
    t("marquee.line1"),
    t("marquee.line2"),
    t("marquee.line3"),
    t("marquee.line4"),
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      <div className="h-[3px] w-full bg-gradient-to-r from-ember-deep via-ember to-ember-soft" />

      <div className="border-b border-cream/10 py-5">
        <Marquee dark items={marqueeItems} />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 border-b border-cream/10 pb-14 md:grid-cols-2 md:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.5 8.5h-17M12 8.5v12M4.5 8.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2Z" />
                  <path d="M12 6.5c-1.5-2-4-2-4-3.5a1.5 1.5 0 0 1 3-1 1.5 1.5 0 0 1 1 1Zm0 0c1.5-2 4-2 4-3.5a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-1 1Z" />
                </svg>
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl font-semibold tracking-tighter">
                  GiftHive
                </span>
                <span className="mt-0.5 font-display text-[0.62rem] italic text-cream/40">
                  est. 2026 · The Gift Studio
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-cream/65">
              {t("description")}
            </p>
          </div>

          <NewsletterForm />
        </div>

        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
              Navigation
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-cream/70 transition-colors hover:text-ember"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-sm text-cream/70 transition-colors hover:text-ember"
                >
                  {t("nav.finder")}
                </Link>
              </li>
            </ul>
          </div>

          {footerNavKeys.map((col) => (
            <div key={col.titleKey}>
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-cream/40">
                {t(`columns.${col.titleKey}`)}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.labelKey}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-ember"
                    >
                      {t(`links.${link.labelKey}`)}
                      <span className="opacity-0 transition-all duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:opacity-100">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.03] p-7 md:p-8">
          <div className="grain absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="font-display text-xs italic text-ember-soft">§</span>
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
                {t("disclosureTitle")}
              </p>
            </div>
            <p className="mt-4 max-w-3xl text-pretty text-xs leading-relaxed text-cream/55">
              {t("disclosure")}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/45 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} GiftHive.{" "}
            <span className="italic">{t("copyright")}</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-cream/80">
              {t("legal.privacy")}
            </Link>
            <Link href="#" className="transition-colors hover:text-cream/80">
              {t("legal.terms")}
            </Link>
            <Link href="#" className="transition-colors hover:text-cream/80">
              {t("legal.cookies")}
            </Link>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/2 -z-0 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-semibold leading-none text-cream/[0.025] md:text-[16vw]"
      >
        GiftHive
      </div>
    </footer>
  );
}
