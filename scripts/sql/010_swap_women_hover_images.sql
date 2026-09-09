-- 010_swap_women_hover_images.sql
-- women 상품은 착용컷을 기본 썸네일로, 플랫레이(제품 단독 사진)를 hover 이미지로 바꾼다.
-- men은 아직 착용컷이 없어서 그대로 두고(플랫레이 기본 유지), women부터 우선 적용.
-- 한 UPDATE 문 안에서는 SET의 우변이 전부 변경 전 값 기준으로 평가되므로 안전하게 맞바꿔진다.

update public.products
set image = hover_image, hover_image = image
where id like 'women-%' and hover_image is not null;
