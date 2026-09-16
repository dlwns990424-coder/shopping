-- Women 레이어드 히어로(태블릿+데스크톱)에 public/images/women-hero/ 안의 실제 사진을 배치.
-- bg_image와 card_image는 동일한 배경 사진을 그대로 씀.
-- Supabase SQL Editor에서 수동 실행 필요.

update public.site_content set value = '/images/women-hero/women-hero-background.png'
where key = 'women.hero_layered.bg_image';

update public.site_content set value = '/images/women-hero/women-hero-background.png'
where key = 'women.hero_layered.card_image';

update public.site_content set value = '/images/women-hero/women-hero-left-cutout.png'
where key = 'women.hero_layered.left_model';

update public.site_content set value = '/images/women-hero/women-hero-right-cutout-extended.png'
where key = 'women.hero_layered.right_model';
