-- Home의 세일 배너를 신상품 배너로 되돌리면서(BEST SELLERS와 NEW ARRIVALS 사이로 위치 이동),
-- home.new_banner.* 4개 행을 다시 시딩하고 더는 쓰이지 않는 home.sale_banner.* 행은 삭제.
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

insert into public.site_content (key, page, label, value, display_order) values
  ('home.new_banner.title', 'home', '홈 신상품 배너 타이틀', 'NEW ARRIVALS', 420),
  ('home.new_banner.subtitle', 'home', '홈 신상품 배너 서브타이틀', '', 421),
  ('home.new_banner.image_desktop', 'home', '홈 신상품 배너 이미지 (데스크톱)', '', 422),
  ('home.new_banner.image_mobile', 'home', '홈 신상품 배너 이미지 (모바일)', '', 423);

delete from public.site_content where key like 'home.sale_banner.%';
