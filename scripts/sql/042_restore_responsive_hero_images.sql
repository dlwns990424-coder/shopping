-- MEN/WOMEN 히어로를 모바일(3:4), 태블릿(1:1), 데스크톱(16:9) 이미지로 다시 분리한다.
-- 기존 모바일 이미지 값은 유지하고, 없어진 태블릿/데스크톱 슬롯만 복구한다.

update public.site_content
set label = '남성 히어로 이미지 (모바일)', display_order = 180
where key = 'men.hero.image_mobile';

update public.site_content
set label = '여성 히어로 이미지 (모바일)', display_order = 210
where key = 'women.hero.image_mobile';

insert into public.site_content (key, page, label, value, display_order) values
  ('men.hero.image_desktop', 'men', '남성 히어로 이미지 (데스크톱)', '', 178),
  ('men.hero.image_tablet', 'men', '남성 히어로 이미지 (태블릿)', '', 179),
  ('women.hero.image_desktop', 'women', '여성 히어로 이미지 (데스크톱)', '', 208),
  ('women.hero.image_tablet', 'women', '여성 히어로 이미지 (태블릿)', '', 209)
on conflict (key) do update set
  page = excluded.page,
  label = excluded.label,
  display_order = excluded.display_order;
