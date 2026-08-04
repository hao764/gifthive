"use client";

import { useEffect, useState } from "react";

type Slide = {
  /** 主图 */
  image: string;
  /** 主图左下角标题 */
  caption: string;
  /** 主图右下角 plate 编号 */
  plate: string;
  /** 浮卡 1：左上角的 match 卡 */
  float1: {
    match: number;
    name: string;
    note: string;
  };
  /** 浮卡 2：右下角的商品卡 */
  float2: {
    name: string;
    badge?: string;
    desc: string;
    price: string;
  };
};

const SLIDES: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=600&fit=crop&q=80",
    caption: "A gift, truly chosen",
    plate: "Plate 01",
    float1: {
      match: 96,
      name: "75% Mechanical Keyboard",
      note: "He said he wanted a better one",
    },
    float2: {
      name: "Cedar & Smoke Candle",
      badge: "Editor's",
      desc: "Cedar and smoke — a kind of safety, late at night.",
      price: "$32",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop&q=80",
    caption: "Slow mornings, kept",
    plate: "Plate 02",
    float1: {
      match: 94,
      name: "Pour-Over Coffee Set",
      note: "He wanted to quit takeout coffee",
    },
    float2: {
      name: "Stoneware Mug, 12oz",
      badge: "Pick",
      desc: "Heavy in the hand — that's the whole point.",
      price: "$24",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=600&fit=crop&q=80",
    caption: "Small things, well made",
    plate: "Plate 03",
    float1: {
      match: 86,
      name: "Leather Card Wallet",
      note: "Time to retire the bulky one",
    },
    float2: {
      name: "Wool-Blend Wrap",
      badge: "Cozy",
      desc: "Throw it on and forget you're wearing it.",
      price: "$68",
    },
  },
];

const INTERVAL_MS = 3800;

export default function HeroShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    // 尊重 reduced-motion —— 不自动轮播
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      setActive((v) => (v + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[active];

  return (
    <div className="relative mx-auto max-w-md">
      {/* ============ 主图（3 张同时渲染，opacity 控制显示 —— 预加载避免切换时重新发请求报错）============ */}
      <div className="relative aspect-[4/5] rotate-[1.5deg] overflow-hidden rounded-[2rem] border border-ink/10 shadow-lift">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ease-editorial ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== active}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt={s.caption}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent" />
            <div className="grain absolute inset-0 opacity-30" />
          </div>
        ))}
        <div className="pointer-events-none absolute bottom-5 left-5 right-5 flex items-end justify-between text-cream">
          <p
            key={`cap-${active}`}
            className="font-display text-sm italic text-cream/85 animate-fade-in"
          >
            {slide.caption}
          </p>
          <span className="font-display text-[0.62rem] uppercase tracking-widest text-cream/60">
            {slide.plate}
          </span>
        </div>

        {/* 指示点 —— 可手动切换 */}
        <div className="absolute left-5 top-5 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show plate ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ease-editorial ${
                i === active
                  ? "w-6 bg-ember"
                  : "w-1.5 bg-cream/55 hover:bg-cream/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============ 浮卡 1：左上角 match 卡 ============ */}
      <div
        key={`f1-${active}`}
        className="glass absolute -left-6 top-14 w-44 -rotate-[6deg] rounded-2xl p-4 animate-float-slow"
      >
        <div className="flex items-center gap-2 text-[0.68rem] font-medium text-ember-deep">
          <span className="h-1.5 w-1.5 rounded-full bg-ember" />
          {slide.float1.match}% match
        </div>
        <p className="mt-2 font-display text-sm font-semibold tracking-tight text-ink">
          {slide.float1.name}
        </p>
        <p className="mt-0.5 text-[0.68rem] text-ink/50">{slide.float1.note}</p>
      </div>

      {/* ============ 浮卡 2：右下角商品卡 ============ */}
      <div
        key={`f2-${active}`}
        className="glass absolute -bottom-6 -right-4 w-48 rotate-[3deg] rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-semibold tracking-tight text-ink">
            {slide.float2.name}
          </p>
          {slide.float2.badge && (
            <span className="rounded-full bg-ink px-2 py-0.5 text-[0.58rem] text-cream">
              {slide.float2.badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.68rem] leading-relaxed text-ink/55">
          {slide.float2.desc}
        </p>
        <p className="mt-2 font-display text-base font-semibold text-ember-deep">
          {slide.float2.price}
        </p>
      </div>
    </div>
  );
}
