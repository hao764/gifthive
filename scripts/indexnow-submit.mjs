#!/usr/bin/env node
/**
 * IndexNow 批量提交脚本 —— 不用翻墙，直接通知 Bing / Yandex 来爬。
 *
 * 用法：
 *   node scripts/indexnow-submit.mjs
 *
 * 前提：
 *   1. public/{KEY}.txt 已部署上线（IndexNow 会验证这个文件）
 *   2. 站点已部署到 Cloudflare Pages
 *
 * 效果：
 *   - Bing / Yandex 收到通知后 24h 内派爬虫来抓取
 *   - Google 不支持 IndexNow，但通过外链 / Chrome 数据 / 自然发现也能收录
 */

import { recipients, articles } from "../lib/data.ts";
import { ALL_SEO_LANDING_SLUGS } from "../lib/seo-landing-data.ts";

const SITE = process.env.SITE_URL || "https://gifthive.pages.dev";
const KEY = "baf4a1aef06e13300266250f24dde20b";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

// 收集所有要提交的 URL
const urls = [
  `${SITE}/`,
  `${SITE}/quiz`,
  `${SITE}/journal`,
  ...recipients.map((r) => `${SITE}/${r.slug}`),
  ...articles.map((a) => `${SITE}/journal/${a.slug}`),
  ...ALL_SEO_LANDING_SLUGS.map((slug) => `${SITE}/best-gifts/${slug}`),
];

console.log(`\n📦 IndexNow 提交 ${urls.length} 个 URL`);
console.log(`   站点: ${SITE}`);
console.log(`   Key 文件: ${KEY_LOCATION}\n`);

// IndexNow API — POST 到 api.indexnow.org
// 它会自动转发给 Bing、Yandex、Naver 等所有参与的搜索引擎
const body = JSON.stringify({
  host: new URL(SITE).host,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls,
});

try {
  const response = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });

  console.log(`   HTTP ${response.status} ${response.statusText}`);

  if (response.status === 200) {
    console.log("✅ 全部 URL 已提交成功！Bing/Yandex 24h 内会来爬取。\n");
  } else if (response.status === 202) {
    console.log("✅ 已接收，搜索引擎稍后处理。\n");
  } else if (response.status === 422) {
    console.log("⚠️  Key 文件验证失败，请确保 public/" + KEY + ".txt 已部署上线。\n");
  } else {
    const text = await response.text().catch(() => "");
    console.log(`⚠️  返回 ${response.status}：${text || "(空响应)"}\n`);
  }

  // 同时直接 ping Bing 的 IndexNow 端点（双重保险）
  console.log("   再直接 ping Bing IndexNow...");
  const bingRes = await fetch("https://www.bing.com/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body,
  });
  console.log(`   Bing: HTTP ${bingRes.status} ${bingRes.statusText}`);

  if (bingRes.status === 200 || bingRes.status === 202) {
    console.log("✅ Bing 直推成功！\n");
  } else {
    const bingText = await bingRes.text().catch(() => "");
    console.log(`   Bing 返回：${bingText || "(空)"}\n`);
  }

  console.log("📊 提交的 URL 列表：");
  urls.forEach((u, i) => console.log(`   ${String(i + 1).padStart(2, "0")}. ${u}`));
  console.log("");
} catch (err) {
  console.error("❌ 提交失败：", err.message);
  process.exit(1);
}
