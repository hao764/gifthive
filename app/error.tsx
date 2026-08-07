"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
        <span className="font-display text-8xl font-semibold tracking-tighter text-ember-deep">
          Oops
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tighter text-ink md:text-4xl">
          Something got tangled up
          <br />
          <span className="accent-italic text-ember-deep">
            while we were wrapping the gift.
          </span>
        </h1>
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink/60">
          We hit a temporary snag. Try refreshing, or head back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button onClick={reset} className="group btn-primary">
            <span>Try again</span>
          </button>
          <Link href="/" className="group inline-flex items-center gap-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink">
            Back home
            <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
