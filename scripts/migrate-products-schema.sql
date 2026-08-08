-- ============================================
-- GiftHive 商品表扩展：新增 category / gender / style_tags / avoid_tags / product_tags 列
-- 在 Supabase Dashboard → SQL Editor 中运行此脚本
-- ============================================

-- 1. 新增列（IF NOT EXISTS 确保可重复运行）
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS style_tags text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS avoid_tags text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_tags text[] DEFAULT '{}';

-- 2. 给新列加注释（方便团队理解）
COMMENT ON COLUMN products.category IS '一级品类：数码配件/家居生活/美妆护肤/食品茶饮/文具文创/运动户外/饰品配饰/毛绒玩具/香薰蜡烛/手工DIY';
COMMENT ON COLUMN products.gender IS '适用性别：男/女/通用';
COMMENT ON COLUMN products.style_tags IS '风格特点数组：实用/轻奢/可爱/治愈/科技感/高颜值/手工/定制/健康/小众/礼盒装';
COMMENT ON COLUMN products.avoid_tags IS '避雷标签数组：甜食/香水/毛绒/彩妆等';
COMMENT ON COLUMN products.product_tags IS '商品标签数组（用于兴趣匹配）：tech/coffee/outdoor/reading/cooking/music/home/beauty/sports/jewelry等';

-- 3. 验证
SELECT id, name, category, gender, product_tags FROM products LIMIT 5;
