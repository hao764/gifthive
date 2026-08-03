create extension if not exists "pgcrypto";

create table if not exists public.products (
  id              bigserial primary key,
  name            text        not null,
  price           numeric(10,2) not null default 0,
  image_url       text        not null,
  affiliate_url   text        not null,
  asin            text,
  audience_tags   text[]      not null default '{}',
  occasion_tags   text[]      not null default '{}',
  price_range     text        not null check (price_range in ('cheap','mid','high')),
  description     text        not null,
  review_quote    text,
  created_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select using (true);

create policy "Authenticated users can write products"
  on public.products for all to authenticated
  using (true) with check (true);

create index if not exists products_audience_tags_idx
  on public.products using gin (audience_tags);

create index if not exists products_occasion_tags_idx
  on public.products using gin (occasion_tags);

create index if not exists products_price_range_idx
  on public.products (price_range);

alter table public.products
  add column if not exists editor_pick boolean not null default false;

create index if not exists products_editor_pick_idx
  on public.products (editor_pick);

-- ============================================================
-- reveal_cards · AI 礼物蜜语卡
-- ============================================================
create table if not exists public.reveal_cards (
  id              bigserial primary key,
  slug            text        not null unique,
  recipient_nick  text        not null,
  reveal_date     date        not null,
  message         text,
  picked_id       bigint    references public.products(id) on delete set null,
  candidate_ids   bigint[]    not null default '{}',
  quiz_answers    jsonb       not null default '{}'::jsonb,
  ai_persona_text text,
  created_at      timestamptz not null default now()
);

alter table public.reveal_cards enable row level security;

create policy "Anyone can read reveal_cards by slug"
  on public.reveal_cards for select using (true);

create policy "Anyone can insert reveal_cards"
  on public.reveal_cards for insert with check (true);

create index if not exists reveal_cards_slug_idx
  on public.reveal_cards (slug);

-- ============================================================
-- share_links · 分享解锁 / 推荐卡分享
-- ============================================================
create table if not exists public.share_links (
  id              bigserial primary key,
  slug            text        not null unique,
  kind            text        not null check (kind in ('unlock','card')),
  owner_session   text,
  payload         jsonb       not null default '{}'::jsonb,
  click_count     int         not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.share_links enable row level security;

create policy "Anyone can read share_links by slug"
  on public.share_links for select using (true);

create policy "Anyone can insert share_links"
  on public.share_links for insert with check (true);

create policy "Anyone can increment clicks on share_links"
  on public.share_links for update using (true) with check (true);

create index if not exists share_links_slug_idx
  on public.share_links (slug);
