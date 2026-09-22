-- 위시리스트 중 "로그인 계정" 몫만 Supabase로 이전(게스트는 로그인 개념이 없어서
-- 계속 localStorage에 남는다 — WishlistContext.tsx 참고). 계정으로 로그인하면
-- 기기와 무관하게 같은 찜 목록을 보게 하려는 목적으로, orders/cart_items와 동일한
-- "본인 행만" RLS 패턴을 쓴다. 수량/옵션 같은 부가 정보가 없어 (user_id, product_id)만
-- 있으면 충분하다(찜 여부는 행의 존재 자체로 표현).

create table public.wishlist_items (
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "select_own"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

create policy "insert_own"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

create policy "delete_own"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);
