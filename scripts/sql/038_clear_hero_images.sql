-- 어반 미니멀 컨셉으로 히어로 이미지를 새로 찾을 예정이라, 지금 걸려있는
-- men/women.hero.image_mobile 값을 비워서 히어로가 회색 스켈레톤으로 보이게 한다.
-- Supabase SQL Editor에서 수동 실행 필요.

update public.site_content set value = '' where key = 'men.hero.image_mobile';
update public.site_content set value = '' where key = 'women.hero.image_mobile';
