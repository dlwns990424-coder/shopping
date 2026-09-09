-- 007_women_hover_images.sql
-- women 코트(1,3,4)/티셔츠/후드/슬랙스/반바지에 새로 생성된 모델 착용컷을 hover_image로 반영
-- (denim/knit/shirt/coat-2는 이전 세션에서 이미 반영 완료 상태라 여기서는 건드리지 않음)

update products set hover_image = '/images/products/women/coats/women-coat-01-model-01.png' where id = 'women-coat-1';
update products set hover_image = '/images/products/women/coats/women-coat-03-model-01.png' where id = 'women-coat-3';
update products set hover_image = '/images/products/women/coats/women-coat-04-model-01.png' where id = 'women-coat-4';

update products set hover_image = '/images/products/women/tshirts/women-tshirt-01-model-01.png' where id = 'women-tshirt-1';
update products set hover_image = '/images/products/women/tshirts/women-tshirt-02-model-01.png' where id = 'women-tshirt-2';
update products set hover_image = '/images/products/women/tshirts/women-tshirt-03-model-01.png' where id = 'women-tshirt-3';
update products set hover_image = '/images/products/women/tshirts/women-tshirt-04-model-01.png' where id = 'women-tshirt-4';

update products set hover_image = '/images/products/women/hoodies/women-hoodie-01-model-01.png' where id = 'women-hoodie-1';
update products set hover_image = '/images/products/women/hoodies/women-hoodie-02-model-01.png' where id = 'women-hoodie-2';

update products set hover_image = '/images/products/women/trousers/women-trousers-01-model-01.png' where id = 'women-slacks-1';
update products set hover_image = '/images/products/women/trousers/women-trousers-02-model-01.png' where id = 'women-slacks-2';
update products set hover_image = '/images/products/women/trousers/women-trousers-03-model-01.png' where id = 'women-slacks-3';
update products set hover_image = '/images/products/women/trousers/women-trousers-04-model-01.png' where id = 'women-slacks-4';

update products set hover_image = '/images/products/women/shorts/women-shorts-01-model-01.png' where id = 'women-shorts-1';
update products set hover_image = '/images/products/women/shorts/women-shorts-02-model-01.png' where id = 'women-shorts-2';
update products set hover_image = '/images/products/women/shorts/women-shorts-03-model-01.png' where id = 'women-shorts-3';
update products set hover_image = '/images/products/women/shorts/women-shorts-04-model-01.png' where id = 'women-shorts-4';
