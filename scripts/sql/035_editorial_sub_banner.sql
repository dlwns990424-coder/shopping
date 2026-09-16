-- men/women.editorial_sub_banner.sub-1~3.title/subtitle/image 행은 예전 에디토리얼
-- 기능(삭제됨)이 남긴 고아 데이터로 이미 존재해서(전부 빈 값) 별도 INSERT가 필요 없다.
-- 여기서는 지금 코드가 안 쓰는 나머지만 정리한다:
--   - sub-4는 새 EditorialBannerManager가 3슬롯(sub-1~3)만 쓰므로 불필요
--   - sub-1~3의 category/sub/order 필드는 예전 URL 빌더용이라 새 코드에서 안 씀
--   - new_banner(신상품 배너)는 ProductRow 스타일 NEW ARRIVALS로 대체되어 더는 안 쓰임
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

delete from public.site_content
where key like 'men.editorial_sub_banner.sub-4.%'
   or key like 'women.editorial_sub_banner.sub-4.%'
   or key like '%.editorial_sub_banner.sub-1.category'
   or key like '%.editorial_sub_banner.sub-1.sub'
   or key like '%.editorial_sub_banner.sub-1.order'
   or key like '%.editorial_sub_banner.sub-2.category'
   or key like '%.editorial_sub_banner.sub-2.sub'
   or key like '%.editorial_sub_banner.sub-2.order'
   or key like '%.editorial_sub_banner.sub-3.category'
   or key like '%.editorial_sub_banner.sub-3.sub'
   or key like '%.editorial_sub_banner.sub-3.order'
   or key like 'men.new_banner.%'
   or key like 'women.new_banner.%';
