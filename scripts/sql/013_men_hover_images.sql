-- 013_men_hover_images.sql
-- men 상품에 새로 생성된 착용컷을 기본 썸네일(image)로, 기존 플랫레이(제품 단독 사진)를
-- hover_image로 반영하고(women과 동일한 배치), 상세페이지 갤러리용 detail_images에도
-- 플랫레이를 채워넣는다(women의 007+010+ad-hoc backfill 세 단계를 한 파일로 통합).

update public.products set
  image = '/images/products/men/coats/men-coat-01-model-01.png',
  hover_image = '/images/products/men/coats/men-coat-01.png'
where id = 'men-coat-1';
update public.products set
  image = '/images/products/men/coats/men-coat-02-model-01.png',
  hover_image = '/images/products/men/coats/men-coat-02.png'
where id = 'men-coat-2';
update public.products set
  image = '/images/products/men/coats/men-coat-03-model-01.png',
  hover_image = '/images/products/men/coats/men-coat-03.png'
where id = 'men-coat-3';
update public.products set
  image = '/images/products/men/coats/men-coat-04-model-01.png',
  hover_image = '/images/products/men/coats/men-coat-04.png'
where id = 'men-coat-4';

update public.products set
  image = '/images/products/men/shirts/men-shirt-01-model-01.png',
  hover_image = '/images/products/men/shirts/men-shirt-01.png'
where id = 'men-shirt-1';
update public.products set
  image = '/images/products/men/shirts/men-shirt-02-model-01.png',
  hover_image = '/images/products/men/shirts/men-shirt-02.png'
where id = 'men-shirt-2';
update public.products set
  image = '/images/products/men/shirts/men-shirt-03-model-01.png',
  hover_image = '/images/products/men/shirts/men-shirt-03.png'
where id = 'men-shirt-3';
update public.products set
  image = '/images/products/men/shirts/men-shirt-04-model-01.png',
  hover_image = '/images/products/men/shirts/men-shirt-04.png'
where id = 'men-shirt-4';

update public.products set
  image = '/images/products/men/tshirts/men-tshirt-01-model-01.png',
  hover_image = '/images/products/men/tshirts/men-tshirt-01.png'
where id = 'men-tshirt-1';
update public.products set
  image = '/images/products/men/tshirts/men-tshirt-02-model-01.png',
  hover_image = '/images/products/men/tshirts/men-tshirt-02.png'
where id = 'men-tshirt-2';
update public.products set
  image = '/images/products/men/tshirts/men-tshirt-03-model-01.png',
  hover_image = '/images/products/men/tshirts/men-tshirt-03.png'
where id = 'men-tshirt-3';
update public.products set
  image = '/images/products/men/tshirts/men-tshirt-04-model-01.png',
  hover_image = '/images/products/men/tshirts/men-tshirt-04.png'
where id = 'men-tshirt-4';

update public.products set
  image = '/images/products/men/tops/men-top-01-model-01.png',
  hover_image = '/images/products/men/tops/men-top-01.png'
where id = 'men-knit-1';
update public.products set
  image = '/images/products/men/tops/men-top-02-model-01.png',
  hover_image = '/images/products/men/tops/men-top-02.png'
where id = 'men-knit-2';
update public.products set
  image = '/images/products/men/tops/men-top-03-model-01.png',
  hover_image = '/images/products/men/tops/men-top-03.png'
where id = 'men-knit-3';
update public.products set
  image = '/images/products/men/tops/men-top-04-model-01.png',
  hover_image = '/images/products/men/tops/men-top-04.png'
where id = 'men-knit-4';

update public.products set
  image = '/images/products/men/hoodies/men-hoodie-01-model-01.jpg',
  hover_image = '/images/products/men/hoodies/men-hoodie-01.jpg'
where id = 'men-hoodie-1';
update public.products set
  image = '/images/products/men/hoodies/men-hoodie-02-model-01.jpg',
  hover_image = '/images/products/men/hoodies/men-hoodie-02.jpg'
where id = 'men-hoodie-2';

update public.products set
  image = '/images/products/men/jeans/men-jeans-01-model-01.png',
  hover_image = '/images/products/men/jeans/men-jeans-01.png'
where id = 'men-denim-1';
update public.products set
  image = '/images/products/men/jeans/men-jeans-02-model-01.png',
  hover_image = '/images/products/men/jeans/men-jeans-02.png'
where id = 'men-denim-2';
update public.products set
  image = '/images/products/men/jeans/men-jeans-03-model-01.png',
  hover_image = '/images/products/men/jeans/men-jeans-03.png'
where id = 'men-denim-3';
update public.products set
  image = '/images/products/men/jeans/men-jeans-04-model-01.png',
  hover_image = '/images/products/men/jeans/men-jeans-04.png'
where id = 'men-denim-4';

update public.products set
  image = '/images/products/men/trousers/men-trousers-01-model-01.png',
  hover_image = '/images/products/men/trousers/men-trousers-01.png'
where id = 'men-slacks-1';
update public.products set
  image = '/images/products/men/trousers/men-trousers-02-model-01.png',
  hover_image = '/images/products/men/trousers/men-trousers-02.png'
where id = 'men-slacks-2';
update public.products set
  image = '/images/products/men/trousers/men-trousers-03-model-01.png',
  hover_image = '/images/products/men/trousers/men-trousers-03.png'
where id = 'men-slacks-3';
update public.products set
  image = '/images/products/men/trousers/men-trousers-04-model-01.png',
  hover_image = '/images/products/men/trousers/men-trousers-04.png'
where id = 'men-slacks-4';

update public.products set
  image = '/images/products/men/shorts/men-shorts-01-model-01.png',
  hover_image = '/images/products/men/shorts/men-shorts-01.png'
where id = 'men-shorts-1';
update public.products set
  image = '/images/products/men/shorts/men-shorts-02-model-01.png',
  hover_image = '/images/products/men/shorts/men-shorts-02.png'
where id = 'men-shorts-2';
update public.products set
  image = '/images/products/men/shorts/men-shorts-03-model-01.png',
  hover_image = '/images/products/men/shorts/men-shorts-03.png'
where id = 'men-shorts-3';
update public.products set
  image = '/images/products/men/shorts/men-shorts-04-model-01.png',
  hover_image = '/images/products/men/shorts/men-shorts-04.png'
where id = 'men-shorts-4';

-- 상세페이지 갤러리(detail_images)에 플랫레이 사진을 채워넣는다(women과 동일하게 hover_image 1장).
update public.products
set detail_images = ARRAY[hover_image]::text[]
where id like 'men-%' and hover_image is not null;
