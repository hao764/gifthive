"use client";

import { useState, useRef } from "react";
import type { AIGift } from "@/lib/deepseek";

type Props = {
  gift: AIGift;
  recipientLabel?: string;
  occasionLabel?: string;
  totalPicks?: number;
};

const W = 1200;
const H = 630;

/**
 * Generates a downloadable share card PNG on the client (canvas, zero deps).
 * Amazon product images send `Access-Control-Allow-Origin: *`, so we can load
 * them with crossOrigin="anonymous" into the canvas without tainting it.
 */
export default function ShareCardButton({
  gift,
  recipientLabel = "someone special",
  occasionLabel = "a special day",
  totalPicks = 5,
}: Props) {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">(
    "idle"
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const generate = async () => {
    setStatus("generating");
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("no canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");

      // ---- Background gradient ----
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#F5EFE6");
      grad.addColorStop(1, "#EDE4D3");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ---- Ember glow (top-right) ----
      const glow = ctx.createRadialGradient(W - 100, 80, 0, W - 100, 80, 350);
      glow.addColorStop(0, "rgba(200,112,44,0.18)");
      glow.addColorStop(1, "rgba(200,112,44,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(W - 500, -200, 500, 500);

      // ---- Top bar: brand + AI badge ----
      // Brand circle
      ctx.fillStyle = "#1A1A1A";
      ctx.beginPath();
      ctx.arc(90, 88, 28, 0, Math.PI * 2);
      ctx.fill();
      // 🎁 emoji
      ctx.font = "28px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🎁", 90, 90);

      // GiftHive wordmark
      ctx.fillStyle = "#1A1A1A";
      ctx.font = "700 30px Georgia, serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("GiftHive", 135, 88);

      // AI Picked badge (right)
      ctx.fillStyle = "#1A1A1A";
      roundRect(ctx, W - 230, 60, 180, 56, 28);
      ctx.fill();
      ctx.fillStyle = "#F5EFE6";
      ctx.font = "600 18px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("🤖 AI Picked", W - 140, 90);

      // ---- Headline ----
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#1A1A1A";
      ctx.font = "700 50px Georgia, serif";
      const headLine1 = `${totalPicks} gifts for ${recipientLabel},`;
      ctx.fillText(headLine1, 64, 170);

      ctx.fillStyle = "#B8651E";
      ctx.font = "italic 700 50px Georgia, serif";
      ctx.fillText(`picked by AI for ${occasionLabel}.`, 64, 230);

      // ---- Top pick card ----
      const cardX = 64;
      const cardY = 310;
      const cardW = 780;
      const cardH = 220;
      const imgSize = 200;

      // Card shadow
      ctx.fillStyle = "rgba(26,26,26,0.08)";
      roundRect(ctx, cardX + 4, cardY + 8, cardW, cardH, 24);
      ctx.fill();

      // Card background
      ctx.fillStyle = "#FFFFFF";
      roundRect(ctx, cardX, cardY, cardW, cardH, 24);
      ctx.fill();

      // Product image
      let imgDrawn = false;
      if (gift.image) {
        try {
          const img = await loadImage(gift.image);
          ctx.save();
          roundRect(ctx, cardX, cardY, imgSize, cardH, 24);
          ctx.clip();
          ctx.drawImage(img, cardX, cardY, imgSize, cardH);
          ctx.restore();
          imgDrawn = true;
        } catch {
          imgDrawn = false;
        }
      }
      if (!imgDrawn) {
        ctx.fillStyle = "#EDE4D3";
        roundRect(ctx, cardX, cardY, imgSize, cardH, 24);
        ctx.fill();
        ctx.font = "60px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🎁", cardX + imgSize / 2, cardY + cardH / 2);
      }

      // Pick label + match badge
      const textX = cardX + imgSize + 32;
      const textW = cardW - imgSize - 64;

      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#B8651E";
      ctx.font = "700 14px Georgia, serif";
      ctx.fillText("★  TOP PICK", textX, cardY + 24);

      if (gift.match > 0) {
        const matchText = `🤖 ${gift.match}% match`;
        ctx.font = "600 15px Georgia, serif";
        const matchW = ctx.measureText(matchText).width + 28;
        ctx.fillStyle = "#1A1A1A";
        roundRect(ctx, textX + textW - matchW, cardY + 20, matchW, 32, 16);
        ctx.fill();
        ctx.fillStyle = "#F5EFE6";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(matchText, textX + textW - matchW / 2, cardY + 36);
      }

      // Pick name (wrapped)
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#1A1A1A";
      ctx.font = "700 26px Georgia, serif";
      const nameLines = wrapText(ctx, gift.name, textW).slice(0, 2);
      nameLines.forEach((line, i) => {
        ctx.fillText(line, textX, cardY + 70 + i * 34);
      });

      // Price
      if (gift.price > 0) {
        const priceStr = `$${gift.price.toFixed(2)}`;
        ctx.fillStyle = "#1A1A1A";
        ctx.font = "700 24px Georgia, serif";
        ctx.fillText(priceStr, textX, cardY + cardH - 42);
      }

      // ---- Bottom bar ----
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(26,26,26,0.5)";
      ctx.font = "italic 18px Georgia, serif";
      ctx.fillText("Take the 30-second gift quiz", 64, H - 64);

      ctx.fillStyle = "#1A1A1A";
      ctx.font = "700 26px Georgia, serif";
      ctx.fillText("gifthive.store", 64, H - 30);

      // Pick indicators (right side)
      const dotSize = 40;
      const dotGap = 8;
      const dotsW = 5 * dotSize + 4 * dotGap;
      let dx = W - 64 - dotsW;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i === 0 ? "#B8651E" : "rgba(26,26,26,0.1)";
        roundRect(ctx, dx, H - 76, dotSize, 52, 8);
        ctx.fill();
        ctx.fillStyle = i === 0 ? "#F5EFE6" : "rgba(26,26,26,0.4)";
        ctx.font = "700 18px Georgia, serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), dx + dotSize / 2, H - 50);
        dx += dotSize + dotGap;
      }

      // ---- Export ----
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setStatus("error");
          return;
        }
        const file = new File([blob], "gifthive-picks.png", {
          type: "image/png",
        });
        // Try native share with file (mobile)
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "My AI gift picks",
              text: `AI picked ${totalPicks} gifts for ${recipientLabel} 🎁`,
            });
            setStatus("done");
            return;
          } catch {
            /* fall through to download */
          }
        }
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gifthive-picks.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus("done");
        setTimeout(() => setStatus("idle"), 3000);
      }, "image/png");
    } catch (err) {
      console.error("Share card generation failed:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label =
    status === "generating"
      ? "Generating…"
      : status === "done"
      ? "Saved! ✓"
      : status === "error"
      ? "Try again"
      : "Download results card";

  return (
    <>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ display: "none" }}
      />
      <button
        onClick={generate}
        disabled={status === "generating"}
        className="group inline-flex items-center gap-2 rounded-full border border-ember/30 bg-cream px-5 py-3 text-xs font-medium text-ink transition-all duration-500 ease-editorial hover:border-ember hover:bg-ember/10 disabled:opacity-50"
      >
        <span className="text-sm">{status === "generating" ? "✦" : "⬇"}</span>
        {label}
      </button>
    </>
  );
}
