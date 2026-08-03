"use client";

import { useState } from "react";

type Status = "idle" | "done";

export default function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend yet — show a success state so the user knows it landed.
    // Wire to a real endpoint later.
    setStatus("done");
    setEmail("");
  };

  if (status === "done") {
    return (
      <div className="md:self-end">
        <p className="font-display text-lg tracking-tight">You&apos;re in.</p>
        <p className="mt-1 text-sm leading-relaxed text-cream/65">
          Thanks — first email arrives at the start of next month. No spam, ever.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs text-cream/45 underline-offset-2 transition-colors hover:text-cream/80 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="md:self-end">
      <p className="font-display text-lg tracking-tight">
        A shortlist, once a month
      </p>
      <p className="mt-1 text-sm text-cream/55">
        No noise, no selling your inbox. One email a month, three minutes to
        read.
      </p>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full flex-1 rounded-full border border-cream/20 bg-cream/5 px-5 py-3 text-sm text-cream placeholder:text-cream/40 transition-colors focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember"
        />
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-ink transition-all duration-500 ease-editorial hover:bg-ember-soft"
        >
          Subscribe
          <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </form>
    </div>
  );
}
