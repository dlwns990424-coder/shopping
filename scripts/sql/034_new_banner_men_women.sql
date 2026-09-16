-- home.new_banner.*가 이미 삭제된 상태라 033에서 men/women으로 복사할 원본이 없었음.
-- men/women.new_banner.* 행을 기본값으로 새로 시딩(관리자 페이지에서 이미지 업로드 가능하도록).
-- Supabase SQL Editor에서 수동 실행 필요.

insert into public.site_content (key, page, label, value, display_order) values
  ('men.new_banner.title', 'men', '남성 신상품 배너 타이틀', 'NEW ARRIVALS', 520),
  ('men.new_banner.subtitle', 'men', '남성 신상품 배너 서브타이틀', '', 521),
  ('men.new_banner.image_desktop', 'men', '남성 신상품 배너 이미지 (데스크톱)', '', 522),
  ('men.new_banner.image_mobile', 'men', '남성 신상품 배너 이미지 (모바일)', '', 523),
  ('women.new_banner.title', 'women', '여성 신상품 배너 타이틀', 'NEW ARRIVALS', 530),
  ('women.new_banner.subtitle', 'women', '여성 신상품 배너 서브타이틀', '', 531),
  ('women.new_banner.image_desktop', 'women', '여성 신상품 배너 이미지 (데스크톱)', '', 532),
  ('women.new_banner.image_mobile', 'women', '여성 신상품 배너 이미지 (모바일)', '', 533);
