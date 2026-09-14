-- 홈/MEN/WOMEN 히어로 타이틀 아래에 짧은 서브타이틀(설명 문구)을 추가할 수 있도록 신규 필드 시딩.
-- 히어로 섹션은 이미 ContentManage.tsx의 범용 렌더러(SECTION_LABELS의 '히어로')가 다루고 있어서
-- 별도 관리자 컴포넌트 없이 이 필드만 추가하면 바로 편집 화면에 나타난다.

insert into public.site_content (key, page, label, value, display_order) values
  ('home.hero.subtitle', 'home', '홈 히어로 서브타이틀', '', 390),
  ('men.hero.subtitle', 'men', 'MEN 히어로 서브타이틀', '', 391),
  ('women.hero.subtitle', 'women', 'WOMEN 히어로 서브타이틀', '', 392);
