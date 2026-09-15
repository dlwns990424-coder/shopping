-- 홈 히어로/젠더배너 다음에 들어갈 신규 "임팩트 이벤트 배너"(1개, 가로로 넓은 임팩트 배너) 필드 시딩.
-- 기존 home.event_banner.*(4개, 작은 세로형 타일)와는 별도 prefix로 관리 — 관리자 화면에서도
-- ImpactBannerManager가 이 prefix만 전담해서 편집한다. 이미지는 hero/men_banner/women_banner와
-- 같은 방식으로 모바일/데스크톱 화면비가 크게 달라(4:5 vs 21:9) image_mobile/image_desktop 분리.

insert into public.site_content (key, page, label, value, display_order) values
  ('home.impact_banner.title', 'home', '홈 임팩트 배너 타이틀', '', 400),
  ('home.impact_banner.description', 'home', '홈 임팩트 배너 설명', '', 401),
  ('home.impact_banner.image_mobile', 'home', '홈 임팩트 배너 이미지 (모바일)', '', 402),
  ('home.impact_banner.image_desktop', 'home', '홈 임팩트 배너 이미지 (데스크톱)', '', 403),
  ('home.impact_banner.gender', 'home', '홈 임팩트 배너 성별', 'men', 404),
  ('home.impact_banner.category', 'home', '홈 임팩트 배너 카테고리', 'all', 405),
  ('home.impact_banner.sub', 'home', '홈 임팩트 배너 서브카테고리', '', 406);
