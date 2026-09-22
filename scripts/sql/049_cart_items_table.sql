-- 장바구니를 브라우저 localStorage(shop_cart:{userId})에서 Supabase로 이전.
-- 기존엔 계정으로 로그인해도 다른 기기(폰/PC)에서는 장바구니가 안 보였음 —
-- orders(012_orders_table.sql)를 이전했던 것과 동일한 이유.
--
-- id는 클라이언트가 이미 "{productId}-{colorLabel}-{size}" 형태로 만들어 쓰던 값을 그대로
-- 재사용한다(상품당 색상은 1가지뿐이라 실질적으로 productId+size가 한 줄의 정체성).
-- 이 값은 계정마다 로컬 유일값이라 전역 PK로는 못 쓰고 (user_id, id) 복합 PK로 스코프한다.
--
-- 장바구니는 로그인해야만 담을 수 있어서(게스트 버킷 없음) RLS는 본인 전용, 관리자 조회 권한도 불필요.

create table public.cart_items (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  name text not null,
  option text not null,
  size text not null,
  price integer not null,
  quantity integer not null,
  image text,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.cart_items enable row level security;

create policy "select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "update_own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);
