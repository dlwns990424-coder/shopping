-- 신상품 섹션이 풀블리드 배너(HomeBanner)에서 BEST SELLERS와 같은 ProductRow 스타일로
-- 바뀌면서 home.new_banner.* 콘텐츠 행이 더는 어디서도 읽히지 않는 고아 데이터가 됨.
-- 029에서 시딩한 신상품 배너 전용 4개 행(title/subtitle/image_desktop/image_mobile) 삭제.
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

delete from public.site_content where key like 'home.new_banner.%';
