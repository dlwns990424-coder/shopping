-- 캠페인 페이지(/campaign/home)와 홈 임팩트 배너를 코드에서 완전히 삭제하면서
-- (신상품/베스트가 각자 제자리를 찾아 존재 이유가 없어짐, 026_bestseller_snapshot.sql 참고)
-- 더 이상 어떤 화면에서도 읽지 않는 site_content 행들을 정리한다.
-- 026과 마찬가지로 코드 배포 이후 Supabase SQL Editor에서 수동 실행.

delete from public.site_content
where key like 'home.impact_banner.%'
   or key like 'home.campaign.%';
