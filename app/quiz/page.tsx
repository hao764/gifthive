"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import QuizStep from "@/components/QuizStep";
import { quizQuestions } from "@/lib/data";

export const runtime = "edge";

// Map quiz option values to translation keys
const OPTION_LABEL_KEYS: Record<string, Record<string, string>> = {
  recipient: {
    him: "him", her: "her", kids: "kids", parents: "parents",
    friends: "friends", other: "other",
  },
  age: {
    "under-18": "under18", "18-25": "range18to25", "25-35": "range25to35",
    "35-50": "range35to50", "50-65": "range50to65", "over-65": "over65",
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
  giftStyle: {
    "practical-item": "practicalItem", experience: "experience",
    creative: "creative", classic: "classic",
  },
  closeness: {
    partner: "partner", family: "family", "close-friend": "closeFriend",
    colleague: "colleague", acquaintance: "acquaintance", client: "client",
  },
};

const OPTION_DESC_KEYS: Record<string, Record<string, string>> = {
  recipient: {
    him: "himDesc", her: "herDesc", kids: "kidsDesc",
    parents: "parentsDesc", friends: "friendsDesc", other: "otherDesc",
  },
  giftStyle: {
    "practical-item": "practicalItemDesc", experience: "experienceDesc",
    creative: "creativeDesc", classic: "classicDesc",
  },
  personality: {
    practical: "practicalDesc", romantic: "romanticDesc",
    minimal: "minimalDesc", playful: "playfulDesc",
  },
};

export default function QuizPage() {
  const router = useRouter();
  const t = useTranslations("Quiz");
  const total = quizQuestions.length;
  const [current, setCurrent] = useState(1); // starts at 1
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const question = quizQuestions[current - 1];
  const selected = answers[question.key];

  // Build translated question
  const qKey = question.key as keyof typeof OPTION_LABEL_KEYS;
  const labelMap = OPTION_LABEL_KEYS[qKey];
  const descMap = OPTION_DESC_KEYS[qKey];
  const translatedQuestion = {
    ...question,
    title: t(`questions.${qKey}.title`),
    subtitle: t(`questions.${qKey}.subtitle`),
    options: question.options.map((opt) => {
      const labelKey = labelMap?.[opt.value];
      const descKey = descMap?.[opt.value];
      return {
        ...opt,
        label: labelKey ? t(`questions.${qKey}.${labelKey}`) : opt.label,
        description: descKey ? t(`questions.${qKey}.${descKey}`) : opt.description,
      };
    }),
  };

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
    // Selecting a preset clears the custom text
    if (value) {
      setCustomTexts((prev) => ({ ...prev, [question.key]: "" }));
    }
  };

  const handleCustomTextChange = (text: string) => {
    setCustomTexts((prev) => ({ ...prev, [question.key]: text }));
    // Typing custom text clears preset selection (unless it's being cleared)
    if (text.trim()) {
      setAnswers((prev) => ({ ...prev, [question.key]: "" }));
    }
  };

  const handleNext = () => {
    if (current < total) {
      setCurrent((c) => c + 1);
      return;
    }
    // Last question — merge custom texts into answers, then go to results
    setLoading(true);
    const finalAnswers: Record<string, string> = { ...answers };
    for (const [key, text] of Object.entries(customTexts)) {
      if (text.trim()) {
        finalAnswers[key] = `custom:${text.trim()}`;
      }
    }
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(finalAnswers))
    ).toString();
    router.push(`/results?${query}`);
  };

  const handleBack = () => {
    if (current > 1) setCurrent((c) => c - 1);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-ember/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-moss/10 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-60" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        {/* ============ Header ============ */}
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-sm italic text-ink/40">
              {t("eyebrow")}
            </span>
            <span className="h-px w-8 bg-ink/20" />
            <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
              {t("badge")}
            </span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-6xl">
            {t("title1")}
            <br />
            <span className="accent-italic text-ember-deep">
              {t("title2")}
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-ink/60">
            {t("subtitle")}
          </p>
        </div>

        {/* ============ Loading ============ */}
        {loading ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-20 text-center">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-ink/10 border-t-ember" />
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-ember/10">
                <span className="text-lg">🎁</span>
              </div>
            </div>
            <div>
              <p className="font-display text-lg font-medium tracking-tight text-ink">
                {t("loadingTitle")}
              </p>
              <p className="mt-1 text-sm text-ink/50">
                {t("loadingSubtitle")}
              </p>
            </div>
          </div>
        ) : (
          <QuizStep
            question={translatedQuestion}
            total={total}
            current={current}
            selected={selected}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
            labels={{
              back: t("back"),
              next: t("next"),
              seeResults: t("seeResults"),
            }}
            customText={customTexts[question.key] || ""}
            onCustomTextChange={handleCustomTextChange}
            customLabel={t(`questions.${qKey}.customLabel`)}
            customPlaceholder={t(`questions.${qKey}.customPlaceholder`)}
          />
        )}

        {/* ============ Answered so far ============ */}
        {!loading && (Object.keys(answers).length > 0 || Object.values(customTexts).some(v => v.trim())) && (
          <div className="mx-auto mt-16 max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-widest text-ink/40">
              <span className="h-px w-6 bg-ink/20" />
              {t("answeredSoFar")}
            </p>
            <div className="flex flex-wrap gap-2">
              {quizQuestions
                .filter((q) => {
                  const ct = (customTexts[q.key] || "").trim();
                  return answers[q.key] || ct;
                })
                .map((q) => {
                  const ct = (customTexts[q.key] || "").trim();
                  let displayLabel = "";
                  if (ct) {
                    displayLabel = ct.length > 40 ? ct.slice(0, 40) + "…" : ct;
                  } else {
                    const opt = q.options.find((o) => o.value === answers[q.key]);
                    const qk = q.key as keyof typeof OPTION_LABEL_KEYS;
                    const lm = OPTION_LABEL_KEYS[qk];
                    const labelKey = lm?.[answers[q.key]];
                    displayLabel = labelKey
                      ? t(`questions.${qk}.${labelKey}`)
                      : opt?.label || "";
                  }
                  return (
                    <span
                      key={q.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream-paper px-3 py-1.5 text-xs text-ink/65"
                    >
                      <span className="font-display italic text-ink/35">
                        {String(q.id).padStart(2, "0")}
                      </span>
                      {displayLabel}
                    </span>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
