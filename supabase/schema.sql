-- ================================================
-- 業務報告アプリ Supabase スキーマ
-- ================================================

-- プロフィールテーブル
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- カテゴリテーブル
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text not null default '#3b82f6',
  created_at  timestamptz not null default now()
);

-- 日報テーブル
create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  report_date   date not null,
  body          text not null default '',
  start_time    time,
  end_time      time,
  category_id   uuid references public.categories(id) on delete set null,
  tags          text[] not null default '{}',
  tomorrow_plan text,
  impression    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ================================================
-- Row Level Security (RLS)
-- ================================================

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.reports    enable row level security;

-- profiles ポリシー
create policy "profiles: 自分のプロフィールを参照"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: 自分のプロフィールを更新"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "profiles: 自分のプロフィールを作成"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- categories ポリシー
create policy "categories: 自分のカテゴリを参照"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories: 自分のカテゴリを作成"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories: 自分のカテゴリを更新"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "categories: 自分のカテゴリを削除"
  on public.categories for delete
  using (auth.uid() = user_id);

-- reports ポリシー
create policy "reports: 自分の日報を参照"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "reports: 自分の日報を作成"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "reports: 自分の日報を更新"
  on public.reports for update
  using (auth.uid() = user_id);

create policy "reports: 自分の日報を削除"
  on public.reports for delete
  using (auth.uid() = user_id);

-- ================================================
-- Functions & Triggers
-- ================================================

-- updated_at を自動更新する関数
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- reports の updated_at トリガー
create trigger reports_updated_at
  before update on public.reports
  for each row execute function public.handle_updated_at();

-- profiles の updated_at トリガー
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 新規ユーザー登録時に profiles を自動作成
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================
-- デフォルトカテゴリ挿入（必要に応じて手動実行）
-- ================================================
-- insert into public.categories (user_id, name, color) values
--   ('<your-user-id>', '開発', '#3b82f6'),
--   ('<your-user-id>', '会議', '#10b981'),
--   ('<your-user-id>', '調査・学習', '#f59e0b'),
--   ('<your-user-id>', 'その他', '#6b7280');
