"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "done";

export default function NewsletterForm() {
  const t = useTranslations("Footer.newsletter");
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("done");
    setEmail("");
  };

  if (status === "done") {
    return (
      <div className="md:self-end">
        <p className="font-display text-lg tracking-tight">{t("doneTitle")}</p>
        <p className="mt-1 text-sm leading-relaxed text-cream/65">
          {t("doneDesc")}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-cream/45 underline-offset-2 transition-colors hover:text-cream/80 hover:underline"
        >
          {t("changeEmail")}
        </button>
      </div>
    );
  }

  return (
    <div className="md:self-end">
      <p className="font-display text-lg tracking-tight">{t("title")}</p>
      <p className="mt-1 text-sm text-cream/55">{t("description")}</p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full flex-1 rounded-full border border-cream/20 bg-cream/5 px-5 py-3 text-sm text-cream placeholder:text-cream/40 transition-colors focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
        />
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-ink transition-all duration-500 ease-editorial hover:bg-ember-soft"
        >
          {t("subscribe")}
          <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </form>
    </div>
  );
}
