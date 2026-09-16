-- 썸네일 갤러리(2열 그리드) 레이아웃 확인용 임시 테스트 이미지.
-- men-shirt-1의 image/detail_images를 실제 존재하는 파일들로 채워서 4장 다 보이게 함.
-- 사용자가 삭제 지시하기 전까지 유지 — 나중에 되돌릴 땐 040_revert_test_gallery_images.sql 같은 걸로 원복.
-- Supabase SQL Editor에서 수동 실행 필요.

update public.products
set image = '/images/products/men/shirts/men-shirt-01.png',
    detail_images = array[
      '/images/products/men/coats/men-coat-01.png',
      '/images/products/men/tshirts/men-tshirt-01.png',
      '/images/products/men/tops/men-top-01.png'
    ]
where id = 'men-shirt-1';
