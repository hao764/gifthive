import type { MetadataRoute } from "next";
import { getSiteURL } from "@/lib/deepseek";
import { getAllProductAsins } from "@/lib/supabase";
import { recipients, articles } from "@/lib/data";
import { ALL_SEO_LANDING_SLUGS } from "@/lib/seo-landing-data";

export const runtime = "edge";

/**
 * 动态生成 sitemap.xml —— 确保 Google/Bing 能一次性发现所有可索引页面。
 *
 * 包含 5 类 URL：
 *  1) 静态核心页（首页、quiz、results、journal 列表）
 *  2) 人群分类页（6 个 recipients）：/for-him, /for-her ...
 *  3) Journal 文章详情页：/journal/[slug]
 *  4) 产品详情页（来自 Supabase products 表，带 ASIN）：/gift/[asin]
 *  5) 英文 SEO 长尾落地页（20 个）：/best-gifts/[slug]（高转化长尾词，核心流量页）
 *
 * 所有链接都走 getSiteURL()，自动适配 NEXT_PUBLIC_SITE_URL / gifthive.pages.dev，
 * 这样即使换自定义域名，sitemap 里的 URL 也会自动是 canonical 域名。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteURL().replace(/\/$/, "");
  const now = new Date();

  // —— 1) 静态核心页 ——
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/quiz`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/results`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/journal`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // —— 2) 6 个人群分类页 ——
  const audienceRoutes: MetadataRoute.Sitemap = recipients.map((r) => ({
    url: `${base}/${r.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // —— 3) Journal 文章详情页 ——
  const journalRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/journal/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // —— 4) 产品详情页 /gift/[asin]（Supabase 挂了就返回空数组，不阻塞）——
  let giftRoutes: MetadataRoute.Sitemap = [];
  try {
    const asins = await getAllProductAsins();
    giftRoutes = asins.map((asin) => ({
      url: `${base}/gift/${asin}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch (_) {
    // 永远不抛错 —— sitemap 必须 200 返回
  }

  // —— 5) 20 个英文 SEO 长尾落地页 ——
  const seoLandingRoutes: MetadataRoute.Sitemap = ALL_SEO_LANDING_SLUGS.map((slug) => ({
    url: `${base}/best-gifts/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85, // 高一点 —— 这些是拿海外流量的核心
  }));

  return [
    ...staticRoutes,
    ...audienceRoutes,
    ...journalRoutes,
    ...seoLandingRoutes,
    ...giftRoutes,
  ];
}
