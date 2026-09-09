-- 홈 이벤트배너의 순서/클릭 시 이동할 필터(성별/카테고리/서브카테고리)를
-- 관리자 페이지에서 편집 가능하게 만들기 위한 신규 필드. 기존에 코드(Home.tsx)에
-- 하드코딩돼 있던 값과 동일하게 시딩한다(순서는 기존 배열 순서 그대로 10/20/30/40).

insert into public.site_content (key, page, label, value, display_order) values
  ('home.event_banner.men-outer.gender', 'home', '홈 이벤트배너 1 성별', 'men', 51),
  ('home.event_banner.men-outer.category', 'home', '홈 이벤트배너 1 카테고리', '아우터', 52),
  ('home.event_banner.men-outer.sub', 'home', '홈 이벤트배너 1 서브카테고리', '', 53),
  ('home.event_banner.men-outer.order', 'home', '홈 이벤트배너 1 순서', '10', 54),

  ('home.event_banner.women-knit.gender', 'home', '홈 이벤트배너 2 성별', 'women', 55),
  ('home.event_banner.women-knit.category', 'home', '홈 이벤트배너 2 카테고리', '상의', 56),
  ('home.event_banner.women-knit.sub', 'home', '홈 이벤트배너 2 서브카테고리', '니트·스웨트', 57),
  ('home.event_banner.women-knit.order', 'home', '홈 이벤트배너 2 순서', '20', 58),

  ('home.event_banner.men-denim.gender', 'home', '홈 이벤트배너 3 성별', 'men', 59),
  ('home.event_banner.men-denim.category', 'home', '홈 이벤트배너 3 카테고리', '하의', 60),
  ('home.event_banner.men-denim.sub', 'home', '홈 이벤트배너 3 서브카테고리', '데님', 61),
  ('home.event_banner.men-denim.order', 'home', '홈 이벤트배너 3 순서', '30', 62),

  ('home.event_banner.women-shirt.gender', 'home', '홈 이벤트배너 4 성별', 'women', 63),
  ('home.event_banner.women-shirt.category', 'home', '홈 이벤트배너 4 카테고리', '상의', 64),
  ('home.event_banner.women-shirt.sub', 'home', '홈 이벤트배너 4 서브카테고리', '셔츠', 65),
  ('home.event_banner.women-shirt.order', 'home', '홈 이벤트배너 4 순서', '40', 66);
