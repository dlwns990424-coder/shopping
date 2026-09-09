-- 주문 데이터를 브라우저 localStorage(shop_orders)에서 Supabase로 이전.
-- 기존엔 관리자가 자기 브라우저에 쌓인 주문만 볼 수 있었음(고객 기기의 주문이
-- 전혀 안 보임) — 이제 실제 테이블에 저장해서 기기와 무관하게 공유되게 함.
--
-- RLS는 profiles(002_auth_rls.sql)와 동일한 패턴: 본인 또는 관리자만 조회/작성/수정.
-- 주문을 지우는 UI가 없어서 delete 정책은 만들지 않음.

create table public.orders (
  id text primary key,
  user_id uuid not null references auth.users(id),
  user_email text not null,
  date date not null default current_date,
  shipping_status text not null default '결제완료',
  return_status text,
  items jsonb not null,
  shipping_fee integer not null default 0,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_address_detail text,
  delivery_request text,
  delivered_at timestamptz,
  return_reason text,
  return_detail text,
  return_photos jsonb,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "select_own_or_admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "insert_own"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "update_own_or_admin"
  on public.orders for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
