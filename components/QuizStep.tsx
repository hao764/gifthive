"use client";

import { QuizQuestion } from "@/lib/data";

type Props = {
  question: QuizQuestion;
  total: number;
  current: number; // starts at 1
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  labels: {
    back: string;
    next: string;
    seeResults: string;
  };
  customText?: string;
  onCustomTextChange?: (text: string) => void;
  customLabel?: string;
  customPlaceholder?: string;
};

export default function QuizStep({
  question,
  total,
  current,
  selected,
  onSelect,
  onNext,
  onBack,
  labels,
  customText = "",
  onCustomTextChange,
  customLabel = "Or describe in your own words",
  customPlaceholder = "Type here…",
}: Props) {
  const progress = Math.round((current / total) * 100);
  const isLast = current === total;
  const hasCustom = customText.trim().length > 0;
  const canProceed = Boolean(selected) || hasCustom;

  return (
    <div className="animate-fade-in mx-auto w-full max-w-3xl">
      {/* ============ Progress ============ */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl font-semibold italic text-ember-deep tabular-nums">
              {String(current).padStart(2, "0")}
            </span>
            <span className="h-px w-6 bg-ink/20" />
            <span className="font-display text-sm text-ink/40">
              {String(total).padStart(2, "0")}
            </span>
          </div>
          <span className="font-display text-sm italic text-ink/45">
            {progress}%
          </span>
        </div>
        <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-ink/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember-deep to-ember transition-all duration-700 ease-editorial"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ============ Question ============ */}
      <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tighter text-ink md:text-5xl">
        {question.title}
      </h2>
      <p className="mt-4 text-pretty text-base leading-relaxed text-ink/60 md:text-lg">
        {question.subtitle}
      </p>

      {/* ============ Options ============ */}
      <div className="mt-9 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              style={{ animationDelay: `${i * 50}ms` }}
              className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border p-5 text-left transition-all duration-500 ease-editorial animate-fade-up ${
                active
                  ? "border-ember bg-ember/[0.07] shadow-soft"
                  : "border-ink/10 bg-cream-paper hover:border-ink/30 hover:bg-cream"
              }`}
            >
              {/* Active left bar */}
              <span
                className={`absolute left-0 top-0 h-full w-[3px] origin-top bg-ember transition-transform duration-500 ease-editorial ${
                  active ? "scale-y-100" : "scale-y-0"
                }`}
              />
              <span className="flex flex-col gap-1 pl-1.5">
                <span className="flex items-baseline gap-2.5">
                  <span
                    className={`font-display text-xs italic transition-colors ${
                      active ? "text-ember-deep" : "text-ink/30"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-display text-lg font-medium tracking-tight transition-colors ${
                      active ? "text-ember-deep" : "text-ink"
                    }`}
                  >
                    {opt.label}
                  </span>
                </span>
                {opt.description && (
                  <span className="pl-7 text-xs text-ink/45">
                    {opt.description}
                  </span>
                )}
              </span>
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all duration-500 ease-editorial ${
                  active
                    ? "border-ember bg-ember text-cream"
                    : "border-ink/20 text-transparent group-hover:border-ink/40"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      {/* ============ Custom input ============ */}
      {onCustomTextChange && (
        <div
          className={`mt-3 overflow-hidden rounded-2xl border transition-all duration-500 ease-editorial ${
            hasCustom
              ? "border-ember bg-ember/[0.07] shadow-soft"
              : "border-ink/10 bg-cream-paper hover:border-ink/30"
          }`}
        >
          <div className="flex flex-col gap-2 p-5">
            <label className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all duration-500 ease-editorial ${
                  hasCustom
                    ? "border-ember bg-ember text-cream"
                    : "border-ink/20 text-transparent"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className={`font-display text-sm font-medium tracking-tight ${hasCustom ? "text-ember-deep" : "text-ink/50"}`}>
                {customLabel}
              </span>
            </label>
            <textarea
              value={customText}
              onChange={(e) => {
                onCustomTextChange(e.target.value);
                if (e.target.value.trim() && selected) {
                  onSelect("");
                }
              }}
              placeholder={customPlaceholder}
              rows={2}
              className="w-full resize-none rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/30 focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember/30"
            />
          </div>
        </div>
      )}

      {/* ============ Actions ============ */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-medium text-ink/55 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          disabled={current === 1}
        >
          <span className="transition-transform duration-500 ease-editorial group-hover:-translate-x-0.5">
            ←
          </span>
          {labels.back}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="group inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-7 py-3.5 text-sm font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember disabled:cursor-not-allowed disabled:bg-ink/25"
        >
          <span>{isLast ? labels.seeResults : labels.next}</span>
          <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
