import { getReveal } from "@/lib/supabase";
import RevealView from "./RevealView";
import { notFound } from "next/navigation";

// Cloudflare Pages 需要 Edge Runtime
export const runtime = "edge";

export const metadata = {
  title: "A gift message waiting for you — GiftHive",
  description: "Someone left you a gift note. Tap to reveal.",
};

export default async function RevealPage({
  params,
}: {
  params: { id: string };
}) {
  const reveal = await getReveal(params.id);

  if (!reveal) {
    notFound();
  }

  return <RevealView reveal={reveal} />;
}
