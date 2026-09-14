-- 반품이 조금이라도 연관된 주문(반품요청/반품접수/반품완료 전부)은 리뷰 작성을 막는다.
-- 기존 insert_verified_purchase(016_reviews.sql)는 shipping_status='배송완료'만 체크해서,
-- 반품 신청/진행 중이거나 이미 반품 완료된 상품도 리뷰를 쓸 수 있던 허점을 막는다.

drop policy "insert_verified_purchase" on public.reviews;

create policy "insert_verified_purchase"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.orders o, jsonb_array_elements(o.items) as item
      where o.user_id = auth.uid()
        and o.shipping_status = '배송완료'
        and o.return_status is null
        and item->>'productId' = reviews.product_id
    )
  );
