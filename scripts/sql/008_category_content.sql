-- 008_category_content.sql
-- Men/Women "SHOP BY CATEGORY" 4장(모두 보기/아우터/상의/하의)의 라벨·이미지를
-- 콘텐츠 관리 화면에서 편집할 수 있도록 site_content에 초기값을 시딩한다.
-- 초기값은 지금 src/mock/categories.ts에 하드코딩된 값과 동일 — 관리자가 아직
-- 아무것도 안 바꾼 상태에서는 화면이 지금과 똑같이 보인다.

insert into public.site_content (key, page, label, value, display_order) values
  ('men.category_all.label', 'men', '남성 카테고리 - 모두 보기 라벨', '모두 보기', 182),
  ('men.category_all.image', 'men', '남성 카테고리 - 모두 보기 이미지', '/images/hero/women-coat-02-model-02-v2.png', 183),
  ('men.category_outer.label', 'men', '남성 카테고리 - 아우터 라벨', '아우터', 184),
  ('men.category_outer.image', 'men', '남성 카테고리 - 아우터 이미지', '/images/products/men/coats/men-coat-01.png', 185),
  ('men.category_top.label', 'men', '남성 카테고리 - 상의 라벨', '상의', 186),
  ('men.category_top.image', 'men', '남성 카테고리 - 상의 이미지', '/images/products/men/shirts/men-shirt-01.png', 187),
  ('men.category_bottom.label', 'men', '남성 카테고리 - 하의 라벨', '하의', 188),
  ('men.category_bottom.image', 'men', '남성 카테고리 - 하의 이미지', '/images/products/men/jeans/men-jeans-01.png', 189),

  ('women.category_all.label', 'women', '여성 카테고리 - 모두 보기 라벨', '모두 보기', 212),
  ('women.category_all.image', 'women', '여성 카테고리 - 모두 보기 이미지', '/images/hero/women-coat-02-model-02-v2.png', 213),
  ('women.category_outer.label', 'women', '여성 카테고리 - 아우터 라벨', '아우터', 214),
  ('women.category_outer.image', 'women', '여성 카테고리 - 아우터 이미지', '/images/products/women/coats/women-coat-01.png', 215),
  ('women.category_top.label', 'women', '여성 카테고리 - 상의 라벨', '상의', 216),
  ('women.category_top.image', 'women', '여성 카테고리 - 상의 이미지', '/images/products/women/shirts/women-shirt-01.png', 217),
  ('women.category_bottom.label', 'women', '여성 카테고리 - 하의 라벨', '하의', 218),
  ('women.category_bottom.image', 'women', '여성 카테고리 - 하의 이미지', '/images/products/women/jeans/women-jeans-01.png', 219);
