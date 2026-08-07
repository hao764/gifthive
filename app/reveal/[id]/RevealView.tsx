"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { markRevealed, type Reveal } from "@/lib/supabase";

type Props = { reveal: Reveal };

export default function RevealView({ reveal }: Props) {
  const t = useTranslations("Reveal");
  const [revealed, setRevealed] = useState(reveal.revealed_at !== null);
  const [revealing, setRevealing] = useState(false);

  const handleReveal = () => {
    setRevealing(true);
    setRevealed(true);
    markRevealed(reveal.id).finally(() => setRevealing(false));
  };

  const senderLabel = reveal.sender_name
    ? reveal.sender_name
    : t("someoneSpecial");

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-ember/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-ember/10 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-50" />
      </div>

      <div className="mx-auto w-full max-w-xl px-5 py-16">
        {!revealed ? (
          /* ---------- Teaser state ---------- */
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-ember/20 bg-cream-warm/50 shadow-glow backdrop-blur-sm">
              <span className="text-5xl">🎁</span>
            </div>

            <p className="font-display text-sm italic text-ink/40">
              {t("hiveReveal")}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tighter text-ink md:text-5xl">
              {t("someoneLeftYou", { sender: senderLabel })}
              <br />
              <span className="accent-italic text-ember-deep">
                {t("giftMessage")}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-pretty leading-relaxed text-ink/60">
              {reveal.recipient_name
                ? t("hiNote", { name: reveal.recipient_name })
                : t("genericNote")}
            </p>

            <button
              onClick={handleReveal}
              disabled={revealing}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-cream shadow-lift transition-all duration-500 ease-editorial hover:bg-ember disabled:opacity-50"
            >
              <span className="text-lg transition-transform duration-500 ease-editorial group-hover:scale-110">
                ✦
              </span>
              {revealing ? t("opening") : t("tapToReveal")}
            </button>

            <p className="mt-6 text-[0.62rem] uppercase tracking-widest text-ink/30">
              {t("poweredBy")}
            </p>
          </div>
        ) : (
          /* ---------- Revealed state ---------- */
          <div className="reveal-fade-in">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ember/15">
                <span className="text-3xl">💌</span>
              </div>
              <p className="font-display text-sm italic text-ink/40">
                {t("from", { sender: senderLabel })}
                {reveal.recipient_name && t("to", { name: reveal.recipient_name })}
              </p>
            </div>

            {/* The message */}
            <div className="relative overflow-hidden rounded-[2rem] border border-ember/20 bg-cream-warm/50 p-8 shadow-card glass">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ember/10 blur-3xl"
              />
              <div className="relative">
                <span className="font-display text-5xl italic text-ember/30">
                  &ldquo;
                </span>
                <p className="mt-2 text-pretty font-display text-xl leading-relaxed text-ink md:text-2xl">
                  {reveal.message}
                </p>
                {reveal.sender_name && (
                  <p className="mt-4 text-right font-display text-sm italic text-ink/50">
                    — {reveal.sender_name}
                  </p>
                )}
              </div>
            </div>

            {/* The gift */}
            {reveal.gift_name && (
              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-cream-paper shadow-soft">
                <div className="flex flex-col sm:flex-row">
                  {reveal.gift_image && (
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-deep sm:w-2/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reveal.gift_image}
                        alt={reveal.gift_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                      🎁 {t("giftChose", { sender: senderLabel })}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-ink">
                      {reveal.gift_name}
                    </h3>
                    {reveal.gift_price != null && reveal.gift_price > 0 && (
                      <p className="mt-1 font-display text-xl font-semibold text-ink">
                        ${reveal.gift_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 rounded-[2rem] border border-ink/8 bg-gradient-to-br from-cream-warm/60 to-cream-paper p-7 text-center">
              <p className="font-display text-sm italic text-ember-deep">
                {t("wantPicks")}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tighter text-ink">
                {t("takeQuiz")}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                {t("quizDesc")}
              </p>
              <Link
                href="/quiz"
                className="group mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember"
              >
                {t("takeQuizBtn")}
                <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <p className="mt-6 text-center text-[0.62rem] uppercase tracking-widest text-ink/30">
              {t("footerTag")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
