-- Home 페이지를 완전히 없애면서, Home의 히어로(모바일+레이어드)와 신상품 배너 섹션을
-- Men/Women 페이지로 이전한다. 처음엔 Home에 있던 것과 동일한 값으로 시작하고,
-- 이후 관리자 페이지에서 Men/Women 각각 독립적으로 수정할 수 있다.
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

-- 1) 모바일 히어로: men.hero.*/women.hero.* 행은 이미 존재하므로 UPDATE로 Home 값을 그대로 복사.
update public.site_content set value = (select value from public.site_content where key = 'home.hero.title')
where key = 'men.hero.title';
update public.site_content set value = (select value from public.site_content where key = 'home.hero.subtitle')
where key = 'men.hero.subtitle';
update public.site_content set value = (select value from public.site_content where key = 'home.hero.image_mobile')
where key = 'men.hero.image_mobile';

update public.site_content set value = (select value from public.site_content where key = 'home.hero.title')
where key = 'women.hero.title';
update public.site_content set value = (select value from public.site_content where key = 'home.hero.subtitle')
where key = 'women.hero.subtitle';
update public.site_content set value = (select value from public.site_content where key = 'home.hero.image_mobile')
where key = 'women.hero.image_mobile';

-- 2) 레이어드 히어로(태블릿+데스크톱)는 새 키라서 INSERT. Home의 현재 값을 그대로 시딩.
insert into public.site_content (key, page, label, value, display_order)
select 'men.hero_layered.bg_image', 'men', '남성 히어로 배경 (블러)', value, 500
from public.site_content where key = 'home.hero_layered.bg_image'
union all
select 'men.hero_layered.card_image', 'men', '남성 히어로 가운데 카드', value, 501
from public.site_content where key = 'home.hero_layered.card_image'
union all
select 'men.hero_layered.left_model', 'men', '남성 히어로 좌측 인물', value, 502
from public.site_content where key = 'home.hero_layered.left_model'
union all
select 'men.hero_layered.right_model', 'men', '남성 히어로 우측 인물', value, 503
from public.site_content where key = 'home.hero_layered.right_model'
union all
select 'men.hero_layered.season_label', 'men', '남성 히어로 시즌 라벨', value, 504
from public.site_content where key = 'home.hero_layered.season_label';

insert into public.site_content (key, page, label, value, display_order)
select 'women.hero_layered.bg_image', 'women', '여성 히어로 배경 (블러)', value, 510
from public.site_content where key = 'home.hero_layered.bg_image'
union all
select 'women.hero_layered.card_image', 'women', '여성 히어로 가운데 카드', value, 511
from public.site_content where key = 'home.hero_layered.card_image'
union all
select 'women.hero_layered.left_model', 'women', '여성 히어로 좌측 인물', value, 512
from public.site_content where key = 'home.hero_layered.left_model'
union all
select 'women.hero_layered.right_model', 'women', '여성 히어로 우측 인물', value, 513
from public.site_content where key = 'home.hero_layered.right_model'
union all
select 'women.hero_layered.season_label', 'women', '여성 히어로 시즌 라벨', value, 514
from public.site_content where key = 'home.hero_layered.season_label';

-- 3) 신상품 배너도 새 키라서 INSERT. Home의 현재 값을 그대로 시딩.
insert into public.site_content (key, page, label, value, display_order)
select 'men.new_banner.title', 'men', '남성 신상품 배너 타이틀', value, 520
from public.site_content where key = 'home.new_banner.title'
union all
select 'men.new_banner.subtitle', 'men', '남성 신상품 배너 서브타이틀', value, 521
from public.site_content where key = 'home.new_banner.subtitle'
union all
select 'men.new_banner.image_desktop', 'men', '남성 신상품 배너 이미지 (데스크톱)', value, 522
from public.site_content where key = 'home.new_banner.image_desktop'
union all
select 'men.new_banner.image_mobile', 'men', '남성 신상품 배너 이미지 (모바일)', value, 523
from public.site_content where key = 'home.new_banner.image_mobile';

insert into public.site_content (key, page, label, value, display_order)
select 'women.new_banner.title', 'women', '여성 신상품 배너 타이틀', value, 530
from public.site_content where key = 'home.new_banner.title'
union all
select 'women.new_banner.subtitle', 'women', '여성 신상품 배너 서브타이틀', value, 531
from public.site_content where key = 'home.new_banner.subtitle'
union all
select 'women.new_banner.image_desktop', 'women', '여성 신상품 배너 이미지 (데스크톱)', value, 532
from public.site_content where key = 'home.new_banner.image_desktop'
union all
select 'women.new_banner.image_mobile', 'women', '여성 신상품 배너 이미지 (모바일)', value, 533
from public.site_content where key = 'home.new_banner.image_mobile';

-- 4) 더는 안 쓰는 men/women의 예전 데스크톱/태블릿 히어로 이미지(레이어드 히어로로 대체됨) 정리.
delete from public.site_content
where key in (
  'men.hero.image_desktop', 'men.hero.image_tablet',
  'women.hero.image_desktop', 'women.hero.image_tablet'
);

-- 5) Home 페이지 자체가 없어졌으므로 home.* 행 전부 삭제.
delete from public.site_content where key like 'home.%';
