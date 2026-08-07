import { getReveal } from "@/lib/supabase";
import RevealView from "./RevealView";
import { notFound } from "next/navigation";

// Cloudflare Pages 需要 Edge Runtime
export const runtime = "edge";

export const metadata = {
  title: "A gift message waiting for you — GiftHive",
  description: "Someone left you a gift note. Tap to reveal.",
};

// Reveal id 是 UUID v4（Supabase generate uuid()），长度 36
// 任何不符合格式的直接 404，避免把无谓查询打到 DB，也避免潜在 5xx
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function RevealPage({
  params,
}: {
  params: { id: string };
}) {
  // 1. 格式校验：非 UUID → 直接 notFound（404，不是 5xx）
  if (!params?.id || !UUID_RE.test(params.id)) {
    notFound();
  }

  let reveal;
  try {
    reveal = await getReveal(params.id);
  } catch (err) {
    // 2. DB 任何异常 → 当作 404 处理（避免漏网的 5xx）
    console.error("RevealPage getReveal threw:", err);
    reveal = null;
  }

  if (!reveal) {
    notFound();
  }

  return <RevealView reveal={reveal} />;
}
