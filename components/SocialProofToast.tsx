"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Activity = {
  id: number;
  name: string;
  city: string;
  action: "quiz" | "buy" | "reveal";
  minutesAgo: number;
  giftName?: string;
};

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "Lucas", "Mia", "Logan", "Amelia", "James", "Harper",
  "Ben", "Chloe", "Alex", "Zoe", "Sam", "Ruby", "Leo", "Ivy", "Max",
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Brooklyn", "Austin",
  "Seattle", "Denver", "Miami", "Portland", "Boston",
  "San Francisco", "Philadelphia", "Phoenix", "San Diego", "Dallas",
  "London", "Toronto", "Vancouver", "Sydney", "Berlin",
];

const GIFTS = [
  "Leather Card Wallet", "Pour-Over Coffee Set", "Cedar & Smoke Candle",
  "Stoneware Mug Set", "Wool-Blend Wrap", "75% Mechanical Keyboard",
  "Desk Plant Kit", "Vinyl Record Holder", "Chef's Knife Set",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateActivity(id: number): Activity {
  const r = Math.random();
  let action: Activity["action"];
  if (r < 0.5) action = "quiz";
  else if (r < 0.85) action = "buy";
  else action = "reveal";

  return {
    id,
    name: randomItem(FIRST_NAMES),
    city: randomItem(CITIES),
    action,
    minutesAgo: Math.floor(Math.random() * 45) + 1,
    giftName: action === "buy" || action === "reveal" ? randomItem(GIFTS) : undefined,
  };
}

const QUEUE_MAX = 3;

export default function SocialProofToast() {
  const t = useTranslations("SocialProof");
  const [visible, setVisible] = useState(false);
  const [queue, setQueue] = useState<Activity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 延迟 6 秒后开始显示（等用户初步浏览完首页再弹出，避免干扰）
    const startDelay = setTimeout(() => {
      pushNew();
    }, 6000);

    // 之后每 18-28 秒随机推送一条
    const scheduleNext = () => {
      const delay = (18 + Math.random() * 10) * 1000;
      return setTimeout(() => {
        pushNew();
        nextTimer.current = scheduleNext();
      }, delay);
    };

    let nextTimer = { current: undefined as ReturnType<typeof setTimeout> | undefined };
    nextTimer.current = scheduleNext();

    return () => {
      clearTimeout(startDelay);
      if (nextTimer.current) clearTimeout(nextTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushNew = () => {
    const newAct = generateActivity(Date.now());
    setQueue((q) => {
      const next = [...q, newAct].slice(-QUEUE_MAX);
      return next;
    });
    setVisible(true);
    // 单条展示 6 秒后自动隐藏（如果队列只有它）
    setTimeout(() => {
      setQueue((q) => (q.length > 1 ? q.slice(1) : []));
    }, 6200);
  };

  if (!mounted) return null;
  if (!visible || queue.length === 0) return null;

  const act = queue[queue.length - 1]; // 显示最新的一条

  const renderBody = () => {
    switch (act.action) {
      case "quiz":
        return t("quizDone", { name: act.name, city: act.city, mins: act.minutesAgo });
      case "buy":
        return t("justBought", { name: act.name, city: act.city, mins: act.minutesAgo, gift: act.giftName || "a gift" });
      case "reveal":
        return t("revealed", { name: act.name, city: act.city, mins: act.minutesAgo });
    }
  };

  const icon = act.action === "quiz" ? "🎯" : act.action === "buy" ? "🛒" : "💌";
  const relativeTime =
    act.minutesAgo <= 1
      ? t("justNow")
      : t("minutesAgo", { mins: act.minutesAgo });

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[90] max-w-xs animate-slide-up-left md:bottom-8 md:left-8">
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-ink/10 bg-cream-paper/95 p-4 shadow-lift backdrop-blur-md glass">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ember/15 text-xl">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.82rem] leading-snug text-ink/85">
            {renderBody()}
          </p>
          <p className="mt-1 text-[0.62rem] text-ink/40">
            {relativeTime}
          </p>
        </div>
      </div>
    </div>
  );
}
