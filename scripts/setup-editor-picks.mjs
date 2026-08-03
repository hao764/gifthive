// Clean up test data and mark editor picks
const SUPABASE_URL = "https://xfbqxsawfavhyqeybauy.supabase.co";
const SUPABASE_KEY = "sb_publishable_g8P9wR63Dskyk9VZBqhWbQ_xzcnyl83";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function main() {
  // 1. Delete old test products (those with NULL asin)
  console.log("Deleting test products with NULL asin...");
  const delRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?asin=is.null`,
    { method: "DELETE", headers }
  );
  console.log(`  Deleted: ${delRes.ok ? "OK" : delRes.status}`);

  // 2. Count total products
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=count`,
    { headers: { ...headers, Prefer: "count=exact" } }
  );
  const countText = countRes.headers.get("content-range") || "";
  console.log(`  Total products: ${countText}`);

  // 3. Get some products from each audience to mark as editor_pick
  const audiences = ["for-him", "for-her", "for-kids", "for-parents"];
  for (const aud of audiences) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?audience_tags=cs.{${aud}}&select=id&limit=1&order=random()`,
      { headers }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const id = data[0].id;
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/products?id=eq.${id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ editor_pick: true }),
        }
      );
      console.log(`  Marked product ${id} (${aud}) as editor_pick: ${updateRes.ok ? "OK" : updateRes.status}`);
    }
  }

  // 4. Get a sample to verify
  const sampleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=name,price,asin,audience_tags,occasion_tags,price_range&limit=5`,
    { headers }
  );
  const samples = await sampleRes.json();
  console.log("\nSample products:");
  for (const s of samples) {
    console.log(`  ${s.asin} | $${s.price} | ${s.price_range} | ${JSON.stringify(s.audience_tags)} | ${JSON.stringify(s.occasion_tags)} | ${s.name.substring(0, 60)}`);
  }

  // 5. Count by audience
  for (const aud of ["for-him", "for-her", "for-kids", "for-parents", "for-friends", "for-coworkers"]) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?audience_tags=cs.{${aud}}&select=id&limit=1000`,
      { headers: { ...headers, Prefer: "count=exact" } }
    );
    const count = res.headers.get("content-range") || "";
    console.log(`  ${aud}: ${count.split("/")[1] || "?"} products`);
  }
}

main().catch(console.error);
