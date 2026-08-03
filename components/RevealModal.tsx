"use client";

import { useState } from "react";
import { createReveal, type Reveal } from "@/lib/supabase";
import ShareBar from "@/components/ShareBar";
import type { AIGift } from "@/lib/deepseek";

type Props = {
  gift: AIGift;
  quizUrl: string;
  onClose: () => void;
};

/**
 * Hive Reveal 蜜语卡创建弹窗。
 * 送礼人写一段话 → 保存到 Supabase → 生成分享链接给收礼人。
 */
export default function RevealModal({ gift, quizUrl, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [creating, setCreating] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (message.trim().length < 5) {
      setError("Write a little something — at least a few words.");
      return;
    }
    setCreating(true);
    setError("");
    const result = await createReveal({
      message: message.trim(),
      sender_name: senderName.trim() || undefined,
      recipient_name: recipientName.trim() || undefined,
      gift_name: gift.name,
      gift_image: gift.image,
      gift_price: gift.price,
      quiz_url: quizUrl,
    });
    setCreating(false);
    if (result) {
      setReveal(result);
    } else {
      setError(
        "Couldn't save your card. Make sure the reveals table exists in Supabase (see supabase/reveals.sql)."
      );
    }
  };

  const revealUrl =
    typeof window !== "undefined" && reveal
      ? `${window.location.origin}/reveal/${reveal.id}`
      : "";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.5rem] border border-ink/10 bg-cream-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🐝</span>
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                Hive Reveal
              </h3>
              <p className="text-[0.62rem] uppercase tracking-widest text-ember-deep">
                Leave a gift note
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {reveal ? (
          /* ---- Success state: show shareable link ---- */
          <div className="p-6">
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-ember/10 px-4 py-3">
              <span className="text-lg">✓</span>
              <p className="text-sm text-ink/70">
                Your reveal card is ready. Share this link with{" "}
                {recipientName || "them"} — they&apos;ll see a teaser first,
                then your message when they tap.
              </p>
            </div>

            <div className="mb-5 rounded-xl border border-ink/8 bg-cream-warm/40 p-4">
              <p className="text-[0.62rem] font-semibold uppercase tracking-widest text-ink/45">
                Their link
              </p>
              <p className="mt-1 break-all font-mono text-sm text-ember-deep">
                {revealUrl}
              </p>
            </div>

            <ShareBar
              url={revealUrl}
              title="A gift message waiting for you"
              onShare={() => {}}
            />

            <div className="mt-5 border-t border-ink/8 pt-4">
              <p className="text-[0.62rem] text-ink/40">
                The recipient opens the link, sees a mystery teaser, then taps
                to reveal your note and the gift you chose. It&apos;s a little
                surprise — like a digital gift tag.
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-ink px-5 py-3 text-xs font-medium text-cream transition-colors hover:bg-ember"
            >
              Done
            </button>
          </div>
        ) : (
          /* ---- Form state ---- */
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {/* Gift preview */}
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-ink/8 bg-cream-warm/30 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gift.image}
                alt={gift.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {gift.name}
                </p>
                <p className="text-xs text-ink/50">
                  {gift.price > 0 ? `$${gift.price.toFixed(2)}` : "Gift"}
                  {gift.match > 0 && ` · ${gift.match}% AI match`}
                </p>
              </div>
            </div>

            {/* Recipient name */}
            <label className="mb-4 block">
              <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ink/45">
                For (their name)
              </span>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Sarah"
                className="mt-1.5 w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ember"
              />
            </label>

            {/* Sender name */}
            <label className="mb-4 block">
              <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ink/45">
                From (your name, optional)
              </span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Leave blank to stay anonymous"
                className="mt-1.5 w-full rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ember"
              />
            </label>

            {/* Message */}
            <label className="mb-4 block">
              <span className="text-[0.62rem] font-semibold uppercase tracking-widest text-ink/45">
                Your message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write something sweet, a hint, or why you chose this gift…"
                className="mt-1.5 w-full resize-none rounded-xl border border-ink/10 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ember"
              />
            </label>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full rounded-full bg-ink px-5 py-3 text-xs font-medium text-cream transition-all duration-500 ease-editorial hover:bg-ember disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create reveal link"}
            </button>

            <p className="mt-3 text-center text-[0.62rem] text-ink/40">
              They&apos;ll see a mystery teaser first — the message stays hidden
              until they tap.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
