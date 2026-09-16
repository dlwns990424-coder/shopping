-- Men/Women CATEGORY 섹션을 "모두 보기/아우터/상의/하의" 4개 타일에서
-- 서브카테고리 11개(아우터: 코트/자켓·블레이저/패딩/가디건, 상의: 셔츠/티셔츠/니트·스웨트/후드,
-- 하의: 데님/슬랙스/반바지) 캐러셀로 바꾸면서, 기존 4개 타일의 site_content 행을 정리하고
-- 새 11개 타일 행(라벨+이미지, 성별별)을 시딩한다. "모두 보기" 타일은 캐러셀 아래
-- "전체 제품 보기" 버튼으로 대체되어(코드에 목적지 고정) 별도 콘텐츠 행이 필요 없다.
-- Supabase SQL Editor에서 수동 실행 필요(자동화는 DELETE 문을 차단함).

delete from public.site_content
where key like 'men.category_all.%'
   or key like 'men.category_outer.%'
   or key like 'men.category_top.%'
   or key like 'men.category_bottom.%'
   or key like 'women.category_all.%'
   or key like 'women.category_outer.%'
   or key like 'women.category_top.%'
   or key like 'women.category_bottom.%';

insert into public.site_content (key, page, label, value, display_order) values
  ('men.category_coat.label', 'men', '남성 카테고리 - 코트 라벨', '코트', 700),
  ('men.category_coat.image', 'men', '남성 카테고리 - 코트 이미지', '/images/products/men/coats/men-coat-01.png', 701),
  ('men.category_jacket.label', 'men', '남성 카테고리 - 자켓·블레이저 라벨', '자켓·블레이저', 702),
  ('men.category_jacket.image', 'men', '남성 카테고리 - 자켓·블레이저 이미지', '/images/products/men/coats/men-coat-02.png', 703),
  ('men.category_padding.label', 'men', '남성 카테고리 - 패딩 라벨', '패딩', 704),
  ('men.category_padding.image', 'men', '남성 카테고리 - 패딩 이미지', '/images/products/men/coats/men-coat-03.png', 705),
  ('men.category_cardigan.label', 'men', '남성 카테고리 - 가디건 라벨', '가디건', 706),
  ('men.category_cardigan.image', 'men', '남성 카테고리 - 가디건 이미지', '/images/products/men/coats/men-coat-04.png', 707),
  ('men.category_shirt.label', 'men', '남성 카테고리 - 셔츠 라벨', '셔츠', 708),
  ('men.category_shirt.image', 'men', '남성 카테고리 - 셔츠 이미지', '/images/products/men/shirts/men-shirt-01.png', 709),
  ('men.category_tshirt.label', 'men', '남성 카테고리 - 티셔츠 라벨', '티셔츠', 710),
  ('men.category_tshirt.image', 'men', '남성 카테고리 - 티셔츠 이미지', '/images/products/men/tshirts/men-tshirt-01.png', 711),
  ('men.category_knit.label', 'men', '남성 카테고리 - 니트·스웨트 라벨', '니트·스웨트', 712),
  ('men.category_knit.image', 'men', '남성 카테고리 - 니트·스웨트 이미지', '/images/products/men/tops/men-top-01.png', 713),
  ('men.category_hoodie.label', 'men', '남성 카테고리 - 후드 라벨', '후드', 714),
  ('men.category_hoodie.image', 'men', '남성 카테고리 - 후드 이미지', '/images/products/men/hoodies/men-hoodie-01.jpg', 715),
  ('men.category_denim.label', 'men', '남성 카테고리 - 데님 라벨', '데님', 716),
  ('men.category_denim.image', 'men', '남성 카테고리 - 데님 이미지', '/images/products/men/jeans/men-jeans-01.png', 717),
  ('men.category_slacks.label', 'men', '남성 카테고리 - 슬랙스 라벨', '슬랙스', 718),
  ('men.category_slacks.image', 'men', '남성 카테고리 - 슬랙스 이미지', '/images/products/men/trousers/men-trousers-01.png', 719),
  ('men.category_shorts.label', 'men', '남성 카테고리 - 반바지 라벨', '반바지', 720),
  ('men.category_shorts.image', 'men', '남성 카테고리 - 반바지 이미지', '/images/products/men/shorts/men-shorts-01.png', 721),

  ('women.category_coat.label', 'women', '여성 카테고리 - 코트 라벨', '코트', 730),
  ('women.category_coat.image', 'women', '여성 카테고리 - 코트 이미지', '/images/products/women/coats/women-coat-01.png', 731),
  ('women.category_jacket.label', 'women', '여성 카테고리 - 자켓·블레이저 라벨', '자켓·블레이저', 732),
  ('women.category_jacket.image', 'women', '여성 카테고리 - 자켓·블레이저 이미지', '/images/products/women/coats/women-coat-02.png', 733),
  ('women.category_padding.label', 'women', '여성 카테고리 - 패딩 라벨', '패딩', 734),
  ('women.category_padding.image', 'women', '여성 카테고리 - 패딩 이미지', '/images/products/women/coats/women-coat-03.png', 735),
  ('women.category_cardigan.label', 'women', '여성 카테고리 - 가디건 라벨', '가디건', 736),
  ('women.category_cardigan.image', 'women', '여성 카테고리 - 가디건 이미지', '/images/products/women/coats/women-coat-04.png', 737),
  ('women.category_shirt.label', 'women', '여성 카테고리 - 셔츠 라벨', '셔츠', 738),
  ('women.category_shirt.image', 'women', '여성 카테고리 - 셔츠 이미지', '/images/products/women/shirts/women-shirt-01.png', 739),
  ('women.category_tshirt.label', 'women', '여성 카테고리 - 티셔츠 라벨', '티셔츠', 740),
  ('women.category_tshirt.image', 'women', '여성 카테고리 - 티셔츠 이미지', '/images/products/women/tshirts/women-tshirt-01.png', 741),
  ('women.category_knit.label', 'women', '여성 카테고리 - 니트·스웨트 라벨', '니트·스웨트', 742),
  ('women.category_knit.image', 'women', '여성 카테고리 - 니트·스웨트 이미지', '/images/products/women/tops/women-top-01.png', 743),
  ('women.category_hoodie.label', 'women', '여성 카테고리 - 후드 라벨', '후드', 744),
  ('women.category_hoodie.image', 'women', '여성 카테고리 - 후드 이미지', '/images/products/women/hoodies/women-hoodie-01.jpg', 745),
  ('women.category_denim.label', 'women', '여성 카테고리 - 데님 라벨', '데님', 746),
  ('women.category_denim.image', 'women', '여성 카테고리 - 데님 이미지', '/images/products/women/jeans/women-jeans-01.png', 747),
  ('women.category_slacks.label', 'women', '여성 카테고리 - 슬랙스 라벨', '슬랙스', 748),
  ('women.category_slacks.image', 'women', '여성 카테고리 - 슬랙스 이미지', '/images/products/women/trousers/women-trousers-01.png', 749),
  ('women.category_shorts.label', 'women', '여성 카테고리 - 반바지 라벨', '반바지', 750),
  ('women.category_shorts.image', 'women', '여성 카테고리 - 반바지 이미지', '/images/products/women/shorts/women-shorts-01.png', 751);
