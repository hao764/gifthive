export default function Loading() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-ember/15 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-50" />
      </div>
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-ember/20 bg-cream-warm/50 shadow-glow backdrop-blur-sm">
          <span className="text-5xl">🎁</span>
        </div>
        <div className="mt-6 h-6 w-48 animate-pulse rounded-full bg-ink/10" />
        <div className="mt-3 h-4 w-32 animate-pulse rounded-full bg-ink/8" />
      </div>
    </section>
  );
}
