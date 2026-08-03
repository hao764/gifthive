#!/usr/bin/env node
/**
 * GiftHive · Supabase 建表脚本
 *
 * 用法（在你自己电脑上跑，不是 TRAE 沙箱里）：
 *
 *   1. 装 Node.js（如果没装）：https://nodejs.org/
 *   2. 进入项目目录：cd 你的项目路径
 *   3. 装依赖：npm install pg dotenv
 *   4. 把密码设到环境变量里跑：
 *
 *      Mac / Linux:
 *        SUPABASE_DB_PASSWORD='你的数据库密码' node scripts/setup-supabase.mjs
 *
 *      Windows (PowerShell):
 *        $env:SUPABASE_DB_PASSWORD='你的数据库密码'; node scripts/setup-supabase.mjs
 *
 *   5. 看到 "✅ 建表成功" 就完事了。
 *
 * 如果你的电脑访问不了 Supabase 数据库端口（5432），
 * 那就只能开 VPN 或换网络。或者直接登录
 * https://supabase.com/dashboard → SQL Editor 粘贴 schema.sql 跑。
 */

import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PROJECT_ID = "xfbqxsawfavhyqeybauy";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error(
    "❌ 缺少环境变量 SUPABASE_DB_PASSWORD\n" +
      "   用法：SUPABASE_DB_PASSWORD='你的密码' node scripts/setup-supabase.mjs"
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, "..", "supabase", "schema.sql");
const sql = readFileSync(sqlPath, "utf8");

// 直连 PostgreSQL（绕过沙箱限制，由你本机网络直连 Supabase）
const connectionString = `postgresql://postgres.${PROJECT_ID}:${encodeURIComponent(
  DB_PASSWORD
)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`;

const client = new pg.Client({ connectionString });

console.log("🔗 正在连接 Supabase...");
console.log(`   主机: aws-0-us-east-1.pooler.supabase.com:6543`);
console.log(`   用户: postgres.${PROJECT_ID}`);

try {
  await client.connect();
  console.log("✅ 连接成功，开始执行 SQL...");

  await client.query(sql);
  console.log("\n✅ 建表成功！products 表 + 安全策略 + 索引 + 3 行示例数据 都建好了。");
  console.log("\n下一步：去 GiftHive 网站刷新，商品卡会自动从 Supabase 读取。");
} catch (err) {
  console.error("\n❌ 执行失败：", err.message);

  if (err.message.includes("password authentication failed")) {
    console.error(
      "\n🔑 密码不对。请检查：\n" +
        "   - 你用的是建项目时设的数据库密码（不是 anon key）\n" +
        "   - 密码里如果有特殊字符（@#% 等），整段用单引号包起来"
    );
  } else if (err.message.includes("ENOTFOUND") || err.message.includes("ETIMEDOUT")) {
    console.error(
      "\n🌐 网络连不上 Supabase。请：\n" +
        "   - 检查你的网络能否访问 supabase.com\n" +
        "   - 大陆网络可能需要开 VPN/代理"
    );
  }
  process.exit(1);
} finally {
  await client.end();
}
