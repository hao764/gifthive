import type { MetadataRoute } from "next";
import { getSiteURL } from "@/lib/deepseek";

export const runtime = "edge";

/**
 * robots.txt —— 告诉爬虫哪些能抓，哪些别抓。
 * 关键一行是 Sitemap: 指向动态 sitemap.xml，Google/Bing 会按这里抓取。
 *
 * 屏蔽 /results 和 /quiz 的深层 /reveal：它们是个性化 / 查询串驱动的重复内容，
 * 不希望被当独立页收录，稀释首页/分类页的权重。
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteURL().replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/results", // 个性化结果页，避免重复内容
          "/reveal",  // 礼物揭晓页（短期一次性 URL）
        ],
      },
      // Googlebot 单独放行 —— 让它抓得更积极
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/results", "/reveal"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
