-- 047_drop_featured_columns.sql
-- "메인 캐러셀 상품"(관리자 콘텐츠관리 → FeaturedCarouselManager) 기능 자체를 코드에서 완전히
-- 제거하면서 함께 정리하는 컬럼. featured/featured_order는 admin에서만 값을 썼고 실제 사용자
-- 화면(Men/Women 페이지) 어디에서도 이 값을 읽어 보여주는 곳이 없어 죽은 기능이었음
-- (2026-09-22 코드 감사에서 발견, 사용자 확인 후 완전 삭제로 결정).

alter table public.products
  drop column if exists featured,
  drop column if exists featured_order;
