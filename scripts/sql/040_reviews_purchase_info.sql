-- 리뷰 카드 개편: 구매 시 선택한 컬러/사이즈, 작성자 키/몸무게 표시 추가.
-- purchased_option은 리뷰 작성 시 서버가 아니라 클라이언트가 본인의 배송완료 주문에서
-- 찾아 채워 넣는다(신뢰 기반 — 어차피 RLS가 배송완료 주문 존재 여부만 검증하고 내용은 안 봄).
-- height/weight는 선택 입력이라 nullable, 소수점 한 자리까지 허용(예: 175.5).
alter table public.reviews
  add column purchased_option text,
  add column height numeric(5,1),
  add column weight numeric(5,1);
