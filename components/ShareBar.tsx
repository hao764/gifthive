"use client";

import { useState } from "react";

type Props = {
  /** Called once when ANY share action succeeds — used to unlock content */
  onShare?: () => void;
  url?: string;
  title?: string;
  /** Compact = single row of icon buttons. Default = labeled buttons. */
  compact?: boolean;
  className?: string;
};

/**
 * Share bar — Twitter, Facebook, Copy link, and native Web Share on mobile.
 * Fires onShare() on the first successful share action so the parent can
 * unlock gated content. We treat a click on a social link as "shared"
 * because we can't detect whether the user actually posted.
 */
export default function ShareBar({
  onShare,
  url,
  title = "GiftHive — AI gift picks",
  compact = false,
  className = "",
}: Props) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const triggerUnlock = () => onShare?.();

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      "I just got AI-personalized gift picks at GiftHive 🎁"
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
    triggerUnlock();
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
    triggerUnlock();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      triggerUnlock();
    } catch {
      // clipboard blocked — fall back to a select prompt
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
        triggerUnlock();
      } catch {
        /* ignore */
      }
      document.body.removeChild(input);
    }
  };

  const nativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return false;
    try {
      await navigator.share({ title, url: shareUrl });
      triggerUnlock();
      return true;
    } catch {
      return false;
    }
  };

  const handleNative = async () => {
    const ok = await nativeShare();
    if (!ok) copyLink(); // desktop without Web Share API → copy instead
  };

  const hasNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {hasNative && (
          <button
            onClick={handleNative}
            aria-label="Share"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-cream text-ink/70 transition-colors hover:border-ember hover:text-ember-deep"
          >
            <ShareIcon />
          </button>
        )}
        <button
          onClick={shareOnTwitter}
          aria-label="Share on X"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-cream text-ink/70 transition-colors hover:border-ember hover:text-ember-deep"
        >
          <XIcon />
        </button>
        <button
          onClick={shareOnFacebook}
          aria-label="Share on Facebook"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-cream text-ink/70 transition-colors hover:border-ember hover:text-ember-deep"
        >
          <FbIcon />
        </button>
        <button
          onClick={copyLink}
          aria-label="Copy link"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 bg-cream text-ink/70 transition-colors hover:border-ember hover:text-ember-deep"
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {hasNative && (
        <button onClick={handleNative} className="btn-primary">
          <span className="mr-1.5">↗</span> Share to reveal
        </button>
      )}
      <button onClick={shareOnTwitter} className="btn-ghost">
        <span className="mr-1.5">𝕏</span> Twitter
      </button>
      <button onClick={shareOnFacebook} className="btn-ghost">
        <span className="mr-1.5">f</span> Facebook
      </button>
      <button
        onClick={copyLink}
        className="btn-ghost"
        aria-label="Copy link to share"
      >
        {copied ? (
          <>
            <span className="mr-1.5 text-ember-deep">✓</span> Copied!
          </>
        ) : (
          <>
            <span className="mr-1.5">⧉</span> Copy link
          </>
        )}
      </button>
    </div>
  );
}

/* ---------- inline icons (no extra deps) ---------- */
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.393-.006c-.574 0-1.117.116-1.6.347-.529.27-.884.81-.884 1.438v1.181h2.561l-.461 3.667h-2.1V24h5.019c.715 0 1.295-.58 1.295-1.295V1.295A1.295 1.295 0 0 0 22.705 0H1.295A1.295 1.295 0 0 0 0 1.295v20.1c0 .716.58 1.296 1.295 1.296z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
