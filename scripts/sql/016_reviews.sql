-- 상품 리뷰 신규. 실제 구매(배송완료)한 사용자만 작성 가능하도록 RLS에서 orders
-- 테이블을 대조한다(같은 상품을 담은 주문이 있고 배송완료 상태여야 통과).
-- 한 사용자가 같은 상품에 여러 번 구매해도 리뷰는 1개만 남기도록 unique 제약.
-- 삭제는 관리자만(부적절한 리뷰 정리용) — 작성자 본인 수정/삭제 UI는 없음.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users(id),
  nickname text not null,
  rating smallint not null check (rating between 1 and 5),
  content text not null,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.reviews enable row level security;

create policy "select_all"
  on public.reviews for select
  using (true);

create policy "insert_verified_purchase"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.orders o, jsonb_array_elements(o.items) as item
      where o.user_id = auth.uid()
        and o.shipping_status = '배송완료'
        and item->>'productId' = reviews.product_id
    )
  );

create policy "delete_admin_only"
  on public.reviews for delete
  using (public.is_admin());

create index reviews_product_id_idx on public.reviews (product_id);
