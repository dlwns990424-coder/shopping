-- Home 젠더배너/이벤트배너와 Men/Women 에디토리얼 섹션을 코드에서 완전히 삭제하면서
-- (신상품/베스트/할인상품 자동 노출로 대체됨, 027_cleanup_campaign_impact_content.sql과 같은 맥락)
-- 더 이상 어떤 화면에서도 읽지 않는 site_content 행들을 정리한다.
-- 코드 배포 이후 Supabase SQL Editor에서 수동 실행.

delete from public.site_content
where key like 'home.men_banner.%'
   or key like 'home.women_banner.%'
   or key like 'home.event_banner.%'
   or key like 'men.editorial.%'
   or key like 'men.editorial_sub_banner.%'
   or key like 'women.editorial.%'
   or key like 'women.editorial_sub_banner.%';
