-- 임시 확인용 — 실제 값이 아니라 화면에서 어떻게 보이는지 미리 보기 위한 더미 데이터.
-- 기능 추가(040) 이전에 등록된 기존 리뷰 9개는 purchased_option/height/weight가 비어있는데,
-- 화면 레이아웃 확인용으로 임의 값을 채워 넣는다. 실제 DB 연동(진짜 주문 데이터로 소급)은
-- 사이트 디자인이 끝난 뒤 별도로 처리 예정 — 이 UPDATE는 그때 다시 정리해도 무방한 임시 값이다.
update public.reviews
set
  purchased_option = '네이비 · ' || (array['XS', 'S', 'M', 'L', 'XL'])[1 + floor(random() * 5)::int],
  height = 160 + floor(random() * 30)::int,
  weight = 50 + floor(random() * 30)::int
where product_id = 'men-coat-3'
  and purchased_option is null;
