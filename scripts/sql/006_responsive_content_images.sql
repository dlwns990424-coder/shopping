-- 반응형 이미지 크롭 기능 도입: hero/men_banner/women_banner의 .image 1개 키를
-- 모바일용/데스크톱용 2개 키로 분리합니다(event_banner는 aspect-[2/3]로 화면 크기와
-- 무관하게 고정 비율이라 분리 대상 아님, 그대로 둡니다).
--
-- 1) 기존 .image 행은 값을 유지한 채로 key/label만 _desktop으로 이름 변경
update public.site_content set key = 'home.hero.image_desktop', label = '홈 히어로 이미지 (데스크톱)' where key = 'home.hero.image';
update public.site_content set key = 'home.men_banner.image_desktop', label = '홈 MEN 배너 이미지 (데스크톱)' where key = 'home.men_banner.image';
update public.site_content set key = 'home.women_banner.image_desktop', label = '홈 WOMEN 배너 이미지 (데스크톱)' where key = 'home.women_banner.image';
update public.site_content set key = 'men.hero.image_desktop', label = '남성 히어로 이미지 (데스크톱)' where key = 'men.hero.image';
update public.site_content set key = 'women.hero.image_desktop', label = '여성 히어로 이미지 (데스크톱)' where key = 'women.hero.image';

-- 2) 모바일용 신규 행 추가(값은 비워둠 — 관리자가 새로 업로드해야 함)
insert into public.site_content (key, page, label, value, display_order) values
  ('home.hero.image_mobile', 'home', '홈 히어로 이미지 (모바일)', '', 29),
  ('home.men_banner.image_mobile', 'home', '홈 MEN 배너 이미지 (모바일)', '', 49),
  ('home.women_banner.image_mobile', 'home', '홈 WOMEN 배너 이미지 (모바일)', '', 69),
  ('men.hero.image_mobile', 'men', '남성 히어로 이미지 (모바일)', '', 179),
  ('women.hero.image_mobile', 'women', '여성 히어로 이미지 (모바일)', '', 209);
