"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "./LocaleSwitcher";

const navLinkKeys = [
  { href: "/for-him", key: "forHim" },
  { href: "/for-her", key: "forHer" },
  { href: "/for-kids", key: "forKids" },
  { href: "/for-parents", key: "forParents" },
  { href: "/journal", key: "journal" },
];

export default function Navbar() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-editorial ${
          scrolled
            ? "glass border-b border-white/30"
            : "border-b border-transparent bg-cream/0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 md:py-5">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label={t("ariaLabel")}
          >
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-ink text-cream transition-transform duration-700 ease-editorial group-hover:rotate-[24deg]">
              <span className="absolute inset-0 translate-y-full bg-ember transition-transform duration-500 ease-editorial group-hover:translate-y-0" />
              <svg
                viewBox="0 0 24 24"
                className="relative h-5 w-5"
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
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tighter text-ink">
                GiftHive
              </span>
              <span className="mt-0.5 font-display text-[0.6rem] italic text-ink/40">
                {t("brandTagline")}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-9 md:flex">
            {navLinkKeys.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative text-sm font-medium transition-colors duration-300 ${
                    active ? "text-ink" : "text-ink/65 hover:text-ink"
                  }`}
                >
                  {t(`links.${link.key}`)}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-500 ease-editorial ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* CTA + Locale + hamburger */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />

            <Link
              href="/quiz"
              className="group hidden items-center gap-2 overflow-hidden rounded-full border border-ember/25 bg-ember/10 px-5 py-2.5 text-sm font-medium text-ember-deep backdrop-blur-md transition-all duration-500 ease-editorial hover:bg-ember hover:text-ink md:inline-flex"
            >
              <span>🎯</span>
              <span>{t("finder.label")}</span>
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                →
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative z-[90] flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-cream transition-colors duration-300 hover:border-ink/30 md:hidden"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              aria-expanded={open}
            >
              <div className="flex flex-col items-center justify-center gap-[5px]">
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all duration-400 ease-editorial ${
                    open ? "translate-y-[6.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all duration-400 ease-editorial ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-5 bg-ink transition-all duration-400 ease-editorial ${
                    open ? "-translate-y-[6.5px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {mounted &&
        createPortal(
          <div
            className={`md:hidden ${
              open ? "pointer-events-auto" : "pointer-events-none"
            }`}
          >
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-[60] bg-ink/55 backdrop-blur-md transition-opacity duration-500 ease-editorial ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              className={`fixed right-0 top-0 z-[70] flex h-full w-[84%] max-w-sm flex-col bg-cream-paper px-6 pb-10 pt-24 shadow-lift transition-transform duration-500 ease-editorial ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <p className="absolute left-6 top-7 font-display text-[0.62rem] uppercase tracking-widest text-ink/40">
                {t("menuLabel")}
              </p>

              <div className="flex flex-col gap-0">
                {navLinkKeys.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-b border-ink/8 py-5 transition-colors"
                    style={{
                      transitionDelay: open ? `${120 + i * 60}ms` : "0ms",
                    }}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-xs italic text-ink/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-2xl tracking-tight transition-all duration-500 ease-editorial ${
                          open
                            ? "translate-x-0 opacity-100"
                            : "translate-x-3 opacity-0"
                        } group-hover:text-ember-deep`}
                      >
                        {t(`links.${link.key}`)}
                      </span>
                    </span>
                    <span className="text-ink/30 transition-transform duration-500 ease-editorial group-hover:translate-x-1 group-hover:text-ember">
                      →
                    </span>
                  </Link>
                ))}
              </div>

              <Link
                href="/quiz"
                onClick={() => setOpen(false)}
                className="group btn-primary mt-8"
              >
                <span>{t("finder.start")}</span>
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              <div className="mt-auto">
                <div className="ornament-rule">
                  <span className="font-display text-xs italic text-ink/35">✦</span>
                </div>
                <p className="text-center text-xs leading-relaxed text-ink/50">
                  {t("footer.disclaimer1")}
                  <br />
                  {t("footer.disclaimer2")}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
