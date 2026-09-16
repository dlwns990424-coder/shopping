-- Men/Women 히어로를 태블릿·데스크톱 레이어드 구성(배경+카드+좌우 인물)에서
-- 이미지 1장(+타이틀/서브타이틀, 전 구간 공용) 구성으로 단순화하면서
-- 더는 안 쓰이는 men/women.hero_layered.* 행을 정리한다.
-- men/women.hero.image_mobile은 이제 전 구간 공용 히어로 이미지로 계속 쓰이므로 유지.
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

delete from public.site_content
where key like 'men.hero_layered.%'
   or key like 'women.hero_layered.%';

update public.site_content set label = '남성 히어로 이미지' where key = 'men.hero.image_mobile';
update public.site_content set label = '여성 히어로 이미지' where key = 'women.hero.image_mobile';
