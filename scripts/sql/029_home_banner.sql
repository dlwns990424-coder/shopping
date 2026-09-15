-- Home의 신상품/세일 섹션을 "풀블리드 배너 + 상품 캐러셀" 조합으로 바꾸면서
-- (성별 구분 없이 통합 노출로 결정됨 — 베스트만 별도로 남녀 통합 TOP5 캐러셀 하나)
-- 배너 콘텐츠(이미지+타이틀+서브타이틀)를 관리자가 직접 채워넣을 수 있도록 시딩.
-- 기존 024_impact_banner.sql과 동일한 패턴(모바일/데스크톱 이미지 분리).

insert into public.site_content (key, page, label, value, display_order) values
  ('home.new_banner.title', 'home', '홈 신상품 배너 타이틀', 'New Arrivals', 420),
  ('home.new_banner.subtitle', 'home', '홈 신상품 배너 서브타이틀', '', 421),
  ('home.new_banner.image_desktop', 'home', '홈 신상품 배너 이미지 (데스크톱)', '', 422),
  ('home.new_banner.image_mobile', 'home', '홈 신상품 배너 이미지 (모바일)', '', 423),
  ('home.sale_banner.title', 'home', '홈 세일 배너 타이틀', 'Sale', 424),
  ('home.sale_banner.subtitle', 'home', '홈 세일 배너 서브타이틀', '', 425),
  ('home.sale_banner.image_desktop', 'home', '홈 세일 배너 이미지 (데스크톱)', '', 426),
  ('home.sale_banner.image_mobile', 'home', '홈 세일 배너 이미지 (모바일)', '', 427);
