"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QuizStep from "@/components/QuizStep";
import { quizQuestions } from "@/lib/data";

export default function QuizPage() {
  const router = useRouter();
  const total = quizQuestions.length;
  const [current, setCurrent] = useState(1); // starts at 1
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const question = quizQuestions[current - 1];
  const selected = answers[question.key];

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const handleNext = () => {
    if (current < total) {
      setCurrent((c) => c + 1);
      return;
    }
    // Last question — go to results
    setLoading(true);
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(answers))
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
              Gift Finder
            </span>
            <span className="h-px w-8 bg-ink/20" />
            <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
              6 questions
            </span>
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-6xl">
            Six steps to the gift
            <br />
            <span className="accent-italic text-ember-deep">
              they'll actually use
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-ink/60">
            There are no right answers. The more honest you are, the closer it
            lands.
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
                Picking five gifts for you…
              </p>
              <p className="mt-1 text-sm text-ink/50">
                Matching 200+ picks by interest, budget, and relationship.
              </p>
            </div>
          </div>
        ) : (
          <QuizStep
            question={question}
            total={total}
            current={current}
            selected={selected}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* ============ Answered so far ============ */}
        {!loading && Object.keys(answers).length > 0 && (
          <div className="mx-auto mt-16 max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-widest text-ink/40">
              <span className="h-px w-6 bg-ink/20" />
              Answered so far
            </p>
            <div className="flex flex-wrap gap-2">
              {quizQuestions
                .filter((q) => answers[q.key])
                .map((q) => {
                  const opt = q.options.find((o) => o.value === answers[q.key]);
                  return (
                    <span
                      key={q.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-cream-paper px-3 py-1.5 text-xs text-ink/65"
                    >
                      <span className="font-display italic text-ink/35">
                        {String(q.id).padStart(2, "0")}
                      </span>
                      {opt?.label}
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
