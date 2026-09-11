-- 히어로 섹션이 태블릿 구간(md~lg, 768~1023px)에서 aspect-square(정사각형)를 쓰도록
-- 바뀌면서, 기존 모바일(3:4)/데스크톱(16:9) 크롭만으로는 태블릿에서 구도가 어긋난다
-- (관리자가 얼굴 등 초점을 맞춰 자른 모바일 이미지가 정사각형 틀에 다시 잘려서 나옴).
-- MEN/WOMEN 배너·이벤트배너는 태블릿에서 컬럼 수만 늘어나고 개별 비율은 그대로라
-- 모바일 크롭을 재사용해도 문제없어서 대상에서 제외(006 마이그레이션 주석 참고).

insert into public.site_content (key, page, label, value, display_order) values
  ('home.hero.image_tablet', 'home', '홈 히어로 이미지 (태블릿)', '', 30),
  ('men.hero.image_tablet', 'men', '남성 히어로 이미지 (태블릿)', '', 180),
  ('women.hero.image_tablet', 'women', '여성 히어로 이미지 (태블릿)', '', 210);
