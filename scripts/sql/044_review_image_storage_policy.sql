-- 로그인한 일반 회원이 리뷰 이미지를 자신의 전용 폴더에 업로드할 수 있도록 허용한다.
-- 파일 경로는 앱에서 reviews/{auth.uid()}/{filename} 형식으로 생성한다.
-- products/content 등 다른 폴더는 기존 images_admin_write 정책에 따라 관리자만 쓸 수 있다.

drop policy if exists "images_review_owner_insert" on storage.objects;

create policy "images_review_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'reviews'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
