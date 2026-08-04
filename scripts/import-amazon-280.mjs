/**
 * 读取 supabase/seed-amazon-280.sql，解析 280 条真实亚马逊商品，
 * 通过 Supabase REST API 批量插入到 products 表。
 *
 * 用法: node scripts/import-amazon-280.mjs
 */

import { readFileSync } from "fs";

// 手动读取 .env.local，避免依赖 dotenv
const envText = readFileSync(".env.local", "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2];
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ 缺少 Supabase 环境变量，请检查 .env.local");
  process.exit(1);
}

const REST = `${SUPABASE_URL}/rest/v1/products`;

// ---------- 解析 SQL ----------
// 每行格式: ('name', price, 'img', 'aff', 'asin', ARRAY[...]::text[], ARRAY[...]::text[], 'range', 'desc', 'review'),
function parseSql(sql) {
  const lines = sql
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("('") && (l.endsWith("),") || l.endsWith(");")));

  return lines.map((line, i) => {
    // 去掉末尾的 ), 或 );
    const body = line.replace(/\),?\s*;?\s*$/, "");
    // 去掉开头的 (
    const content = body.startsWith("(") ? body.slice(1) : body;

    // 用一个状态机解析，处理字符串里的转义 ''
    const fields = [];
    let i2 = 0;
    while (i2 < content.length && fields.length < 10) {
      // 跳过前导空白和逗号
      while (i2 < content.length && (content[i2] === " " || content[i2] === ",")) i2++;
      if (i2 >= content.length) break;

      if (content[i2] === "'") {
        // 字符串
        i2++; // 跳过开头引号
        let str = "";
        while (i2 < content.length) {
          if (content[i2] === "'") {
            // 检查是否是转义的 ''
            if (content[i2 + 1] === "'") {
              str += "'";
              i2 += 2;
            } else {
              i2++; // 跳过结尾引号
              break;
            }
          } else {
            str += content[i2];
            i2++;
          }
        }
        fields.push({ type: "string", value: str });
      } else if (content.slice(i2, i2 + 6).toUpperCase() === "ARRAY[") {
        // 数组 ARRAY['a','b']::text[]
        i2 += 6;
        const arr = [];
        while (i2 < content.length && content[i2] !== "]") {
          while (i2 < content.length && (content[i2] === " " || content[i2] === ",")) i2++;
          if (content[i2] === "'") {
            i2++;
            let str = "";
            while (i2 < content.length) {
              if (content[i2] === "'") {
                if (content[i2 + 1] === "'") {
                  str += "'";
                  i2 += 2;
                } else {
                  i2++;
                  break;
                }
              } else {
                str += content[i2];
                i2++;
              }
            }
            arr.push(str);
          } else {
            i2++;
          }
        }
        i2++; // 跳过 ]
        // 跳过 ::text[]
        if (content.slice(i2, i2 + 8).startsWith("::text[")) {
          i2 += 8;
        }
        fields.push({ type: "array", value: arr });
      } else {
        // 数字或其他
        let num = "";
        while (i2 < content.length && content[i2] !== "," && content[i2] !== " ") {
          num += content[i2];
          i2++;
        }
        fields.push({ type: "number", value: num });
      }
    }

    if (fields.length !== 10) {
      throw new Error(`第 ${i + 1} 行解析失败，得到 ${fields.length} 个字段: ${line.slice(0, 80)}...`);
    }

    return {
      name: fields[0].value,
      price: parseFloat(fields[1].value),
      image_url: fields[2].value,
      affiliate_url: fields[3].value,
      asin: fields[4].value,
      audience_tags: fields[5].value,
      occasion_tags: fields[6].value,
      price_range: fields[7].value,
      description: fields[8].value,
      review_quote: fields[9].value,
    };
  });
}

async function deleteOld() {
  console.log("🧹 清空旧商品数据 (asin IS NOT NULL)...");
  const res = await fetch(`${REST}?asin=not.is.null`, {
    method: "DELETE",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DELETE 失败: ${res.status} ${txt}`);
  }
  console.log("   旧数据已清空");
}

async function insertBatch(batch) {
  const res = await fetch(REST, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`INSERT 失败: ${res.status} ${txt}`);
  }
  return res.json();
}

async function main() {
  console.log(`📄 读取 SQL 文件: supabase/seed-amazon-280.sql`);
  const sql = readFileSync("supabase/seed-amazon-280.sql", "utf8");

  console.log("🔍 解析商品数据...");
  const products = parseSql(sql);
  console.log(`   解析到 ${products.length} 条商品`);

  // 校验第一条
  console.log("\n   样例（第 1 条）:", JSON.stringify(products[0], null, 2));

  await deleteOld();

  console.log(`\n📦 批量插入 (每批 25 条)...`);
  const BATCH = 25;
  let inserted = 0;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const result = await insertBatch(batch);
    inserted += Array.isArray(result) ? result.length : batch.length;
    process.stdout.write(`\r   已插入 ${inserted}/${products.length}`);
  }
  console.log("\n");
  console.log(`✅ 完成！共插入 ${inserted} 条真实亚马逊商品到数据库。`);

  // 验证
  console.log("\n🔎 验证：查询前 3 条...");
  const verifyRes = await fetch(`${REST}?select=name,asin,price&limit=3&order=id.asc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (verifyRes.ok) {
    const rows = await verifyRes.json();
    console.log("   数据库前 3 条:", JSON.stringify(rows, null, 2));
  }
}

main().catch((err) => {
  console.error("\n❌ 执行失败:", err.message);
  process.exit(1);
});
