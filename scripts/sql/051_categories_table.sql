-- 대분류/소분류(카테고리 taxonomy)를 코드 상수(constants/categoryFilters.ts)에서
-- DB 테이블로 이전 — 지금까지는 관리자가 카테고리 카드 이미지/라벨(site_content)은
-- 바꿀 수 있었지만 "카테고리 종류 자체"는 코드 배포 없이는 못 바꿨다.
-- products.category/sub_category는 여전히 이 label 문자열을 그대로 저장하는 방식이라
-- (FK 아님) label을 그대로 자연키로 쓴다 — 이름을 바꾸면 기존 상품 데이터와 어긋나는 건
-- products 테이블도 마찬가지 한계라 이번 이전으로 새로 생기는 문제는 아니다.

create table public.categories (
  label text primary key,
  sort_order integer not null default 0
);

create table public.subcategories (
  category_label text not null references public.categories(label) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  primary key (category_label, label)
);

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

create policy "select_all" on public.categories for select using (true);
create policy "write_admin_only" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "select_all" on public.subcategories for select using (true);
create policy "write_admin_only" on public.subcategories for all
  using (public.is_admin()) with check (public.is_admin());

-- 기존 constants/categoryFilters.ts 값 그대로 시드(순서 보존)
insert into public.categories (label, sort_order) values
  ('아우터', 0),
  ('상의', 1),
  ('하의', 2);

insert into public.subcategories (category_label, label, sort_order) values
  ('아우터', '코트', 0),
  ('아우터', '자켓·블레이저', 1),
  ('아우터', '패딩', 2),
  ('아우터', '가디건', 3),
  ('상의', '셔츠', 0),
  ('상의', '티셔츠', 1),
  ('상의', '니트·스웨트', 2),
  ('상의', '후드', 3),
  ('하의', '데님', 0),
  ('하의', '슬랙스', 1),
  ('하의', '반바지', 2);
