"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import GiftCard from "@/components/GiftCard";
import Reveal from "@/components/Reveal";
import ShareBar from "@/components/ShareBar";
import ShareCardButton from "@/components/ShareCardButton";
import RevealModal from "@/components/RevealModal";
import type { AIGift } from "@/lib/deepseek";

const SHARE_UNLOCK_KEY = "gifthive:share_unlocked";
const SHARE_UNLOCK_TTL = 24 * 60 * 60 * 1000; // 24h

// Map quiz answer values to translation keys
const VALUE_TO_LABEL_KEY: Record<string, Record<string, string>> = {
  recipient: {
    him: "him", her: "her", kids: "kids", parents: "parents",
    friends: "friends", other: "other",
  },
  occasion: {
    birthday: "birthday", anniversary: "anniversary", holiday: "holiday",
    thanks: "thanks", apology: "apology", "no-reason": "noReason",
  },
  budget: {
    "0-30": "under30", "30-75": "range30to75", "75-150": "range75to150",
    "150-400": "range150to400", "400+": "over400", flexible: "flexible",
  },
  interests: {
    tech: "tech", coffee: "coffee", outdoor: "outdoor",
    reading: "reading", cooking: "cooking", music: "music",
  },
  personality: {
    practical: "practical", romantic: "romantic",
    minimal: "minimal", playful: "playful",
  },
  closeness: {
    partner: "partner", family: "family", "close-friend": "closeFriend",
    colleague: "colleague", acquaintance: "acquaintance", client: "client",
  },
};

type Props = {
  initialGifts: AIGift[];
  aiUsed?: boolean;
  totalCandidates?: number;
};

function ResultContent({ initialGifts, aiUsed, totalCandidates }: Props) {
  const params = useSearchParams();
  const t = useTranslations("Results");

  const profileTags = (
    ["recipient", "occasion", "budget", "interests", "personality", "closeness"] as const
  )
    .map((key) => {
      const val = params.get(key);
      if (!val) return null;
      const labelKey = VALUE_TO_LABEL_KEY[key]?.[val];
      return labelKey ? t(`labels.${labelKey}`) : val;
    })
    .filter(Boolean) as string[];

  const gifts = initialGifts.length > 0 ? initialGifts : [];
  const featured = gifts[0];

  // Labels for the share card
  const recipientVal = params.get("recipient");
  const occasionVal = params.get("occasion");
  const recipientLabel = recipientVal
    ? (() => {
        const key = VALUE_TO_LABEL_KEY.recipient?.[recipientVal];
        const label = key ? t(`labels.${key}`) : recipientVal;
        return label.replace(/^For\s+/i, "");
      })()
    : t("someoneSpecial");
  const occasionLabel = occasionVal
    ? (() => {
        const key = VALUE_TO_LABEL_KEY.occasion?.[occasionVal];
        return key ? t(`labels.${key}`) : occasionVal;
      })()
    : t("aSpecialDay");

  // Share-to-unlock: top 2 picks are always visible, the rest are gated.
  const [unlocked, setUnlocked] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  useEffect(() => {
    try {
      const ts = localStorage.getItem(SHARE_UNLOCK_KEY);
      if (ts && Date.now() - Number(ts) < SHARE_UNLOCK_TTL) {
        setUnlocked(true);
      }
    } catch {
      /* localStorage blocked — treat as locked */
    }
  }, []);

  const handleShare = () => {
    setUnlocked(true);
    try {
      localStorage.setItem(SHARE_UNLOCK_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  };

  const hasLockedPicks = gifts.length > 2 && !unlocked;
  const visibleRest = hasLockedPicks ? gifts.slice(1, 2) : gifts.slice(1, 5);
  const lockedPicks = hasLockedPicks ? gifts.slice(2, 5) : [];

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-ember/10 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="mb-12 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm italic text-ink/40">
              {t("eyebrow")}
            </span>
            <span className="h-px w-8 bg-ink/20" />
            {aiUsed ? (
              <span className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                <span className="text-sm">🤖</span>
                {t("aiPicks", { count: gifts.length, total: totalCandidates || 0 })}
              </span>
            ) : (
              <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                {t("picksRanked", { count: gifts.length })}
              </span>
            )}
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-6xl">
            {aiUsed ? (
              <>
                {t("aiTitle1")}
                <br />
                <span className="accent-italic text-ember-deep">
                  {t("aiTitle2")}
                </span>
                .
              </>
            ) : (
              <>
                {t("title1")}
                <br />
                <span className="accent-italic text-ember-deep">
                  {t("title2")}
                </span>
                .
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-pretty leading-relaxed text-ink/60">
            {aiUsed ? (
              t("aiDesc", { total: totalCandidates || 0 })
            ) : (
              t("desc")
            )}
          </p>

          {profileTags.length > 0 && (
            <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/8 bg-cream-warm/40 p-4 glass">
              <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ink/45">
                {t("yourProfile")}
              </span>
              <div className="flex flex-wrap gap-2">
                {profileTags.map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {featured && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ShareCardButton
                gift={featured}
                recipientLabel={recipientLabel}
                occasionLabel={occasionLabel}
                totalPicks={gifts.length || 5}
              />
              <span className="text-[0.62rem] text-ink/40">
                {t("saveCard")}
              </span>
            </div>
          )}
        </Reveal>

        {featured ? (
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal className="md:col-span-2">
              <GiftCard gift={featured} index={1} featured ctaLabel={t("shopNow")} />
            </Reveal>

            {visibleRest.map((gift, i) => (
              <Reveal key={gift.id} delay={i * 80}>
                <GiftCard gift={gift} index={i + 2} ctaLabel={t("shopNow")} />
              </Reveal>
            ))}

            {/* -------- Share-to-unlock banner + locked picks -------- */}
            {hasLockedPicks && (
              <>
                <Reveal className="md:col-span-2">
                  <div className="relative overflow-hidden rounded-[2rem] border border-ember/25 bg-gradient-to-br from-cream-warm/80 to-cream-paper p-7 md:p-9 glass">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember/15 blur-3xl"
                    />
                    <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-xs italic text-ember-deep">
                            §
                          </span>
                          <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                            {t("lockedPicks", { count: lockedPicks.length })}
                          </span>
                        </div>
                        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tighter text-ink md:text-3xl">
                          {t("aiHasMore", { count: lockedPicks.length })}
                          {profileTags[0]
                            ? ` ${profileTags[0].toLowerCase()}`
                            : ""}
                          .
                        </h3>
                        <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/60">
                          {t("lockedDesc")}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3">
                        <ShareBar onShare={handleShare} />
                        <p className="text-right text-[0.6rem] text-ink/40">
                          {t("unlocksInstantly")}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {lockedPicks.map((gift, i) => (
                  <Reveal key={gift.id} delay={i * 80}>
                    <GiftCard
                      gift={gift}
                      index={i + 2 + visibleRest.length}
                      locked
                    />
                  </Reveal>
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-ink/8 bg-cream-warm/40 p-12 text-center">
            <p className="font-display text-xl italic text-ink/50">
              {t("noPicks")}
            </p>
          </div>
        )}

        {/* -------- Hive Reveal 蜜语卡 CTA -------- */}
        {featured && (
          <Reveal>
            <div className="mt-10 overflow-hidden rounded-[2rem] border border-ember/20 bg-gradient-to-br from-cream-warm/70 to-cream-paper p-7 md:p-9 glass">
              <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                <div className="max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🐝</span>
                    <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                      {t("hiveReveal")}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-tighter text-ink md:text-2xl">
                    {t("hiveRevealTitle")}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-ink/60">
                    {t("hiveRevealDesc")}
                    <span className="accent-italic text-ink">
                      {" "}{t("hiveRevealCta")}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowRevealModal(true)}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-xs font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember"
                >
                  <span className="text-sm">✦</span>
                  {t("createRevealCard")}
                </button>
              </div>
            </div>
          </Reveal>
        )}

        <Reveal>
          <div className="mt-14 overflow-hidden rounded-[2rem] border border-ink/8 bg-cream-warm/40 p-8 md:p-10 glass">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xs italic text-ember-deep">
                    §
                  </span>
                  <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
                    {t("notQuiteRight")}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tighter text-ink md:text-3xl">
                  {t("retakeTitle")}
                </h3>
                <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-ink/60">
                  {t("retakeDesc")}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/quiz" className="group btn-primary">
                  <span>{t("retake")}</span>
                </Link>
                <a href="/for-him" className="btn-ghost">
                  {t("browse")}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="mt-10 text-center text-xs leading-relaxed text-ink/40">
          {t("affiliateNote")}
          {aiUsed && (
            <>
              {" "}
              {t("aiNote")}
            </>
          )}
        </p>
      </div>

      {showRevealModal && featured && (
        <RevealModal
          gift={featured}
          quizUrl={
            typeof window !== "undefined" ? window.location.href : ""
          }
          onClose={() => setShowRevealModal(false)}
        />
      )}
    </section>
  );
}

export default function ResultsClient({
  initialGifts,
  aiUsed = false,
  totalCandidates = 0,
}: Props) {
  const t = useTranslations("Results");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-5 py-32 text-center">
          <p className="font-display text-2xl italic text-ink/50">
            {t("loading")}
          </p>
        </div>
      }
    >
      <ResultContent
        initialGifts={initialGifts}
        aiUsed={aiUsed}
        totalCandidates={totalCandidates}
      />
    </Suspense>
  );
}
