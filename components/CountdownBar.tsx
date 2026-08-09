"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// 倒计时窗口：23 小时 59 分（从用户首次访问 Results 页开始算）
const WINDOW_MS = 23 * 60 * 60 * 1000 + 59 * 60 * 1000;
const STORAGE_KEY = "gifthive:offer_deadline";

export default function CountdownBar() {
  const t = useTranslations("Countdown");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let dl: number;
      if (saved) {
        dl = Number(saved);
        if (dl <= Date.now()) {
          // 过期了，重新开一个窗口
          dl = Date.now() + WINDOW_MS;
          localStorage.setItem(STORAGE_KEY, String(dl));
        }
      } else {
        dl = Date.now() + WINDOW_MS;
        localStorage.setItem(STORAGE_KEY, String(dl));
      }
      setDeadline(dl);
    } catch {
      // localStorage 不可用：直接用内存的一个窗口
      setDeadline(Date.now() + WINDOW_MS);
    }

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!deadline) return null;

  const diff = Math.max(0, deadline - now);
  const h = Math.floor(diff / (60 * 60 * 1000));
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const s = Math.floor((diff % (60 * 1000)) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");

  const expired = diff === 0;

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-ember/25 bg-gradient-to-r from-ember/[0.08] via-cream-warm/60 to-ember/[0.08] p-4 md:p-5 glass">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute left-1/2 top-1/2 h-24 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-between gap-3 md:flex-row md:gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ember/20 text-lg shadow-soft">
            ⏰
          </span>
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
              {expired ? t("expiredBadge") : t("badge")}
            </p>
            <p className="mt-0.5 font-display text-sm font-medium leading-snug text-ink md:text-base">
              {expired ? t("expiredTitle") : t("title")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {expired ? (
            <span className="font-display text-sm italic text-ink/40">
              {t("expiredCta")}
            </span>
          ) : (
            <>
              <TimeBlock label={t("hours")} value={pad(h)} />
              <Sep />
              <TimeBlock label={t("mins")} value={pad(m)} />
              <Sep />
              <TimeBlock label={t("secs")} value={pad(s)} pulse />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeBlock({
  label,
  value,
  pulse = false,
}: {
  label: string;
  value: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`inline-flex min-w-[2.4rem] items-center justify-center rounded-xl bg-ink px-2.5 py-1.5 font-display text-lg font-semibold tabular-nums text-cream shadow-soft md:min-w-[2.8rem] md:px-3 md:py-2 md:text-xl ${
          pulse ? "animate-soft-pulse" : ""
        }`}
      >
        {value}
      </span>
      <span className="mt-1 text-[0.6rem] uppercase tracking-widest text-ink/40">
        {label}
      </span>
    </div>
  );
}

function Sep() {
  return (
    <span className="pb-4 font-display text-2xl font-semibold text-ember/60 md:pb-5">
      :
    </span>
  );
}
