import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎯 所有颜色升级为 CSS 变量：支持 prefers-color-scheme 暗色一键切换
        // 用法：colors.ink.DEFAULT = "rgb(var(--ink) / <alpha-value>)"，
        // 这样 bg-ink/60、text-ink/85 这种 alpha 写法在明暗双色模式下都正确
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "rgb(var(--cream) / <alpha-value>)",
          warm: "rgb(var(--cream-warm) / <alpha-value>)",
          deep: "rgb(var(--cream-deep) / <alpha-value>)",
          paper: "rgb(var(--cream-paper) / <alpha-value>)",
        },
        ember: {
          DEFAULT: "rgb(var(--ember) / <alpha-value>)",
          soft: "rgb(var(--ember-soft) / <alpha-value>)",
          deep: "rgb(var(--ember-deep) / <alpha-value>)",
          glow: "rgb(var(--ember-glow) / <alpha-value>)",
        },
        moss: "rgb(var(--moss) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.025em",
        widest: "0.32em",
      },
      // 精致的缓动曲线 —— 让所有过渡都像被精心校准过
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
        snap: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(42,31,26,0.04), 0 8px 24px -12px rgba(42,31,26,0.18)",
        card: "0 1px 0 rgba(42,31,26,0.04), 0 18px 40px -24px rgba(42,31,26,0.25)",
        lift: "0 24px 60px -28px rgba(42,31,26,0.45)",
        glow: "0 0 0 1px rgba(217,142,63,0.2), 0 18px 50px -20px rgba(217,142,63,0.35)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(0.5deg)" },
        },
        "draw-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "slide-up-left": {
          "0%": { opacity: "0", transform: "translateY(24px) translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0) translateX(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.72", transform: "scale(1.02)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 1s ease both",
        "scale-in": "scale-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
        marquee: "marquee 40s linear infinite",
        shimmer: "shimmer 3s linear infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "draw-line": "draw-line 1.2s cubic-bezier(0.16,1,0.3,1) both",
        "slide-up-left": "slide-up-left 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "soft-pulse": "soft-pulse 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
