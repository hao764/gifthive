"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const DISMISS_KEY = "gifthive:exit_intent_dismissed";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function ExitIntentModal() {
  const t = useTranslations("ExitIntent");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 检查是否已经在冷却期内 dismiss 过
    try {
      const ts = localStorage.getItem(DISMISS_KEY);
      if (ts && Date.now() - Number(ts) < DISMISS_TTL) {
        return; // 7 天内不再弹
      }
    } catch {
      /* ignore */
    }

    let fired = false;

    const handleMouseLeave = (e: MouseEvent) => {
      if (fired) return;
      // 只有从顶部离开才算真正想退出（向下滚动不算）
      if (e.clientY <= 0) {
        fired = true;
        setOpen(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    const handleBeforeUnload = () => {
      // 备用：某些浏览器不触发 mouseleave（如移动端），这里留空
      // 真正的 beforeunload 需要字符串返回值，浏览器不允许自定义文案
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleDismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  if (!mounted) return null;
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-md animate-fade-in"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2rem] border border-ember/25 bg-cream-paper shadow-lift animate-scale-in">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-moss/10 blur-3xl" />
          <div className="grain absolute inset-0 opacity-30" />
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-cream/80 text-ink/50 transition-all hover:border-ink/30 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-0 px-7 pb-8 pt-10 md:px-10 md:pb-10 md:pt-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ember/15 text-3xl shadow-glow">
            🎁
          </div>

          <p className="font-display text-xs italic text-ember-deep">
            {t("beforeYouGo")}
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-4xl">
            {t("title1")}
            <br />
            <span className="accent-italic text-ember-deep">
              {t("title2")}
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-pretty text-sm leading-relaxed text-ink/60">
            {t("description")}
          </p>

          {/* 社会认同条 */}
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-cream-warm/60 px-4 py-2 glass">
            <span className="flex -space-x-2">
              <span className="h-5 w-5 rounded-full bg-ember/70 border-2 border-cream-paper" />
              <span className="h-5 w-5 rounded-full bg-moss/60 border-2 border-cream-paper" />
              <span className="h-5 w-5 rounded-full bg-ink/40 border-2 border-cream-paper" />
            </span>
            <span className="text-[0.68rem] font-medium text-ink/65">
              {t("socialProof")}
            </span>
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-sm font-medium text-ink transition-all duration-500 ease-editorial hover:bg-ember-deep hover:shadow-glow"
            >
              <span>{t("ctaPrimary")}</span>
              <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm font-medium text-ink/50 transition-colors hover:text-ink"
            >
              {t("ctaSecondary")}
            </button>
          </div>

          <p className="mt-5 text-[0.62rem] text-ink/35">
            {t("footnote")}
          </p>
        </div>
      </div>
    </div>
  );
}
