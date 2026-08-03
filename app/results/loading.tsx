export default function Loading() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-ember/10 blur-3xl" />
        <div className="paper-texture absolute inset-0 opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="mb-12 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm italic text-ink/40">
              Your results
            </span>
            <span className="h-px w-8 bg-ink/20" />
            <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ember-deep">
              AI is analyzing…
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-ember/20 border-t-ember-deep" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              🤖
            </span>
          </div>

          <div className="mt-8 space-y-2 text-center">
            <p className="font-display text-2xl font-semibold tracking-tight text-ink">
              AI is reading the catalog
            </p>
            <div className="space-y-1 text-sm text-ink/50">
              <p className="animate-pulse" style={{ animationDelay: "0ms" }}>
                → Scanning candidates from the product database
              </p>
              <p className="animate-pulse" style={{ animationDelay: "300ms" }}>
                → Scoring fit based on your answers
              </p>
              <p className="animate-pulse" style={{ animationDelay: "600ms" }}>
                → Writing personalized reasons for each pick
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
