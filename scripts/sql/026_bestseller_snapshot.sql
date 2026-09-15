-- "베스트 상품"(최근 30일 판매량 기준 TOP N)을 실시간 집계 대신 관리자가
-- "갱신" 버튼을 눌렀을 때만 재계산해서 저장하는 스냅샷 테이블.
-- site_content(단순 문자열 key-value)는 구조화된 랭킹 리스트를 담기 부적합해서
-- products/orders와 동일한 RLS 패턴(017_products_content_images_rls.sql 참고)으로
-- 전용 테이블을 새로 만든다.

create table public.bestseller_snapshot (
  rank integer primary key,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer not null,
  computed_at timestamptz not null default now()
);

alter table public.bestseller_snapshot enable row level security;

create policy "select_all"
  on public.bestseller_snapshot for select
  using (true);

create policy "write_admin_only"
  on public.bestseller_snapshot for all
  using (public.is_admin())
  with check (public.is_admin());
