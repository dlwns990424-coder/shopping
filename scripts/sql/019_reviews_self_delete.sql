-- 지금까지는 리뷰 삭제가 관리자만 가능했는데(delete_admin_only, 016_reviews.sql),
-- 작성자 본인도 자기 리뷰는 직접 지울 수 있게 정책을 하나 추가한다.
-- 같은 command(delete)에 대한 permissive 정책은 OR로 합쳐지므로, 기존 관리자 삭제 권한은 그대로 유지된다.

create policy "delete_own"
  on public.reviews for delete
  using (auth.uid() = user_id);
