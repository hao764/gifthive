import Link from "next/link";
import Marquee from "@/components/Marquee";
import NewsletterForm from "@/components/NewsletterForm";

const footerNav = [
  {
    title: "Recipients",
    links: [
      { label: "For Him", href: "/for-him" },
      { label: "For Her", href: "/for-her" },
      { label: "For Kids", href: "/for-kids" },
      { label: "For Parents", href: "/for-parents" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Gift Finder", href: "/quiz" },
      { label: "My Results", href: "/results" },
      { label: "Budget Lists", href: "#" },
      { label: "Gifting Calendar", href: "#" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "How We Pick", href: "#" },
      { label: "The Team", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Submit", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-cream">
      {/* Top gradient ember bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-ember-deep via-ember to-ember-soft" />

      {/* Marquee manifesto */}
      <div className="border-b border-cream/10 py-5">
        <Marquee
          dark
          items={[
            "GIFTHIVE · The Gift Studio",
            "Pick the right gift, skip the guessing",
            "Six steps, five picks, truly chosen",
            "EST. 2026",
          ]}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        {/* Brand + newsletter */}
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
              We turn "what should I get?" into a six-step quiz you might
              actually enjoy. Every pick was held and used by a real person —{" "}
              <span className="accent-italic text-cream/85">
                not invented by an algorithm.
              </span>
            </p>
          </div>

          {/* Newsletter */}
          <NewsletterForm />
        </div>

        {/* Nav columns */}
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
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/quiz"
                  className="text-sm text-cream/70 transition-colors hover:text-ember"
                >
                  Gift Finder
                </Link>
              </li>
            </ul>
          </div>

          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-cream/40">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-ember"
                    >
                      {link.label}
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

        {/* Affiliate disclosure */}
        <div className="relative overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.03] p-7 md:p-8">
          <div className="grain absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="font-display text-xs italic text-ember-soft">
                §
              </span>
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-soft">
                Affiliate Disclosure
              </p>
            </div>
            <p className="mt-4 max-w-3xl text-pretty text-xs leading-relaxed text-cream/55">
              GiftHive uses affiliate links. When you buy through a link on this
              site, we may earn a commission paid by the retailer — it{" "}
              <span className="accent-italic text-cream/80">
                doesn't change what you pay
              </span>
              . Every recommendation is based on our editors' real use and
              judgement; commission never moves a gift up or down the list. If
              we don't stand behind a product, no commission is high enough to
              put it here.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/45 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} GiftHive.{" "}
            <span className="italic">All rights reserved.</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-cream/80">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-cream/80">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-cream/80">
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Background watermark */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/2 -z-0 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-semibold leading-none text-cream/[0.025] md:text-[16vw]"
      >
        GiftHive
      </div>
    </footer>
  );
}
