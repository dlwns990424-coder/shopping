-- 에디토리얼 배너 버튼의 이동 페이지·대분류·세부 카테고리를 관리자가 선택할 수 있게 한다.
insert into public.site_content (key, page, label, value, display_order)
values
  ('men.editorial_banner.link_destination', 'men', 'MEN 에디토리얼 버튼 이동 페이지', 'men', 413),
  ('men.editorial_banner.link_category', 'men', 'MEN 에디토리얼 버튼 이동 카테고리', 'all', 414),
  ('men.editorial_banner.link_subcategory', 'men', 'MEN 에디토리얼 버튼 이동 세부 카테고리', '', 415),
  ('women.editorial_banner.link_destination', 'women', 'WOMEN 에디토리얼 버튼 이동 페이지', 'women', 433),
  ('women.editorial_banner.link_category', 'women', 'WOMEN 에디토리얼 버튼 이동 카테고리', 'all', 434),
  ('women.editorial_banner.link_subcategory', 'women', 'WOMEN 에디토리얼 버튼 이동 세부 카테고리', '', 435)
on conflict (key) do nothing;
