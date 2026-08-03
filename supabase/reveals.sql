-- ============================================================
-- Hive Reveal 蜜语卡 — 建表 SQL
-- 在 Supabase Dashboard → SQL Editor 里整段粘贴执行
-- ============================================================

CREATE TABLE IF NOT EXISTS reveals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name   TEXT,
  recipient_name TEXT,
  message       TEXT NOT NULL,
  gift_name     TEXT,
  gift_image    TEXT,
  gift_price    NUMERIC,
  quiz_url      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  revealed_at   TIMESTAMPTZ
);

-- 行级安全：任何人都能创建和查看 reveal（公开分享功能）
ALTER TABLE reveals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create reveals" ON reveals;
CREATE POLICY "Anyone can create reveals" ON reveals
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read reveals" ON reveals;
CREATE POLICY "Anyone can read reveals" ON reveals
  FOR SELECT USING (true);

-- 更新 revealed_at 也允许（收礼人点击揭晓时写入）
DROP POLICY IF EXISTS "Anyone can mark revealed" ON reveals;
CREATE POLICY "Anyone can mark revealed" ON reveals
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_reveals_created ON reveals (created_at DESC);
