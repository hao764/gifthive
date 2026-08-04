import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-60" />
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
        <span className="font-display text-8xl font-semibold tracking-tighter text-ember-deep">
          404
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tighter text-ink md:text-4xl">
          This page wrapped itself
          <br />
          <span className="accent-italic text-ember-deep">but there&rsquo;s no gift inside.</span>
        </h1>
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink/60">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
          Let&rsquo;s get you back to finding the right gift.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="group btn-primary">
            <span>Back home</span>
            <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
          <Link
            href="/quiz"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink"
          >
            Try the gift finder
            <span className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
