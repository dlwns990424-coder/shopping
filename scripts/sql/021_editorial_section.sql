-- Men/Women 페이지에 신설하는 "에디토리얼 섹션"(좌: 메인 이미지, 우: 타이틀 + 서브배너 4개)의
-- 콘텐츠를 관리자 페이지에서 편집할 수 있도록 site_content에 초기값을 시딩한다.
-- 메인 타이틀/이미지는 ContentManage.tsx의 범용 렌더러가, 서브배너 4개는
-- EditorialBannerManager.tsx가 전담(순서 드래그, 카테고리/서브카테고리 링크 지정)한다.

insert into public.site_content (key, page, label, value, display_order) values
  ('men.editorial.title', 'men', 'MEN 에디토리얼 타이틀', '', 300),
  ('men.editorial.image', 'men', 'MEN 에디토리얼 메인 이미지', '', 301),
  ('women.editorial.title', 'women', 'WOMEN 에디토리얼 타이틀', '', 302),
  ('women.editorial.image', 'women', 'WOMEN 에디토리얼 메인 이미지', '', 303),

  ('men.editorial_sub_banner.sub-1.title', 'men', 'MEN 에디토리얼 서브배너 1 제목', '', 310),
  ('men.editorial_sub_banner.sub-1.subtitle', 'men', 'MEN 에디토리얼 서브배너 1 서브타이틀', '', 311),
  ('men.editorial_sub_banner.sub-1.image', 'men', 'MEN 에디토리얼 서브배너 1 이미지', '', 312),
  ('men.editorial_sub_banner.sub-1.category', 'men', 'MEN 에디토리얼 서브배너 1 카테고리', 'all', 313),
  ('men.editorial_sub_banner.sub-1.sub', 'men', 'MEN 에디토리얼 서브배너 1 서브카테고리', '', 314),
  ('men.editorial_sub_banner.sub-1.order', 'men', 'MEN 에디토리얼 서브배너 1 순서', '10', 315),

  ('men.editorial_sub_banner.sub-2.title', 'men', 'MEN 에디토리얼 서브배너 2 제목', '', 320),
  ('men.editorial_sub_banner.sub-2.subtitle', 'men', 'MEN 에디토리얼 서브배너 2 서브타이틀', '', 321),
  ('men.editorial_sub_banner.sub-2.image', 'men', 'MEN 에디토리얼 서브배너 2 이미지', '', 322),
  ('men.editorial_sub_banner.sub-2.category', 'men', 'MEN 에디토리얼 서브배너 2 카테고리', 'all', 323),
  ('men.editorial_sub_banner.sub-2.sub', 'men', 'MEN 에디토리얼 서브배너 2 서브카테고리', '', 324),
  ('men.editorial_sub_banner.sub-2.order', 'men', 'MEN 에디토리얼 서브배너 2 순서', '20', 325),

  ('men.editorial_sub_banner.sub-3.title', 'men', 'MEN 에디토리얼 서브배너 3 제목', '', 330),
  ('men.editorial_sub_banner.sub-3.subtitle', 'men', 'MEN 에디토리얼 서브배너 3 서브타이틀', '', 331),
  ('men.editorial_sub_banner.sub-3.image', 'men', 'MEN 에디토리얼 서브배너 3 이미지', '', 332),
  ('men.editorial_sub_banner.sub-3.category', 'men', 'MEN 에디토리얼 서브배너 3 카테고리', 'all', 333),
  ('men.editorial_sub_banner.sub-3.sub', 'men', 'MEN 에디토리얼 서브배너 3 서브카테고리', '', 334),
  ('men.editorial_sub_banner.sub-3.order', 'men', 'MEN 에디토리얼 서브배너 3 순서', '30', 335),

  ('men.editorial_sub_banner.sub-4.title', 'men', 'MEN 에디토리얼 서브배너 4 제목', '', 340),
  ('men.editorial_sub_banner.sub-4.subtitle', 'men', 'MEN 에디토리얼 서브배너 4 서브타이틀', '', 341),
  ('men.editorial_sub_banner.sub-4.image', 'men', 'MEN 에디토리얼 서브배너 4 이미지', '', 342),
  ('men.editorial_sub_banner.sub-4.category', 'men', 'MEN 에디토리얼 서브배너 4 카테고리', 'all', 343),
  ('men.editorial_sub_banner.sub-4.sub', 'men', 'MEN 에디토리얼 서브배너 4 서브카테고리', '', 344),
  ('men.editorial_sub_banner.sub-4.order', 'men', 'MEN 에디토리얼 서브배너 4 순서', '40', 345),

  ('women.editorial_sub_banner.sub-1.title', 'women', 'WOMEN 에디토리얼 서브배너 1 제목', '', 350),
  ('women.editorial_sub_banner.sub-1.subtitle', 'women', 'WOMEN 에디토리얼 서브배너 1 서브타이틀', '', 351),
  ('women.editorial_sub_banner.sub-1.image', 'women', 'WOMEN 에디토리얼 서브배너 1 이미지', '', 352),
  ('women.editorial_sub_banner.sub-1.category', 'women', 'WOMEN 에디토리얼 서브배너 1 카테고리', 'all', 353),
  ('women.editorial_sub_banner.sub-1.sub', 'women', 'WOMEN 에디토리얼 서브배너 1 서브카테고리', '', 354),
  ('women.editorial_sub_banner.sub-1.order', 'women', 'WOMEN 에디토리얼 서브배너 1 순서', '10', 355),

  ('women.editorial_sub_banner.sub-2.title', 'women', 'WOMEN 에디토리얼 서브배너 2 제목', '', 360),
  ('women.editorial_sub_banner.sub-2.subtitle', 'women', 'WOMEN 에디토리얼 서브배너 2 서브타이틀', '', 361),
  ('women.editorial_sub_banner.sub-2.image', 'women', 'WOMEN 에디토리얼 서브배너 2 이미지', '', 362),
  ('women.editorial_sub_banner.sub-2.category', 'women', 'WOMEN 에디토리얼 서브배너 2 카테고리', 'all', 363),
  ('women.editorial_sub_banner.sub-2.sub', 'women', 'WOMEN 에디토리얼 서브배너 2 서브카테고리', '', 364),
  ('women.editorial_sub_banner.sub-2.order', 'women', 'WOMEN 에디토리얼 서브배너 2 순서', '20', 365),

  ('women.editorial_sub_banner.sub-3.title', 'women', 'WOMEN 에디토리얼 서브배너 3 제목', '', 370),
  ('women.editorial_sub_banner.sub-3.subtitle', 'women', 'WOMEN 에디토리얼 서브배너 3 서브타이틀', '', 371),
  ('women.editorial_sub_banner.sub-3.image', 'women', 'WOMEN 에디토리얼 서브배너 3 이미지', '', 372),
  ('women.editorial_sub_banner.sub-3.category', 'women', 'WOMEN 에디토리얼 서브배너 3 카테고리', 'all', 373),
  ('women.editorial_sub_banner.sub-3.sub', 'women', 'WOMEN 에디토리얼 서브배너 3 서브카테고리', '', 374),
  ('women.editorial_sub_banner.sub-3.order', 'women', 'WOMEN 에디토리얼 서브배너 3 순서', '30', 375),

  ('women.editorial_sub_banner.sub-4.title', 'women', 'WOMEN 에디토리얼 서브배너 4 제목', '', 380),
  ('women.editorial_sub_banner.sub-4.subtitle', 'women', 'WOMEN 에디토리얼 서브배너 4 서브타이틀', '', 381),
  ('women.editorial_sub_banner.sub-4.image', 'women', 'WOMEN 에디토리얼 서브배너 4 이미지', '', 382),
  ('women.editorial_sub_banner.sub-4.category', 'women', 'WOMEN 에디토리얼 서브배너 4 카테고리', 'all', 383),
  ('women.editorial_sub_banner.sub-4.sub', 'women', 'WOMEN 에디토리얼 서브배너 4 서브카테고리', '', 384),
  ('women.editorial_sub_banner.sub-4.order', 'women', 'WOMEN 에디토리얼 서브배너 4 순서', '40', 385);
