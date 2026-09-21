-- 로그인한 일반 회원이 반품 신청 사진을 자신의 전용 폴더에 업로드할 수 있도록 허용한다.
-- 파일 경로는 앱에서 returns/{auth.uid()}/{filename} 형식으로 생성한다(044의 reviews 패턴과 동일).
-- 이 정책이 없으면 images_admin_write(017_products_content_images_rls.sql)만 적용되어
-- 일반 사용자는 반품 신청 사진을 아예 업로드할 수 없다(반품 사유+사진 첨부가 필수인데
-- 사진 업로드 자체가 RLS 위반으로 실패하는 상태였음 — 2026-09-22 데이터 흐름 감사에서 발견).
-- products/content 등 다른 폴더는 기존 images_admin_write 정책에 따라 관리자만 쓸 수 있다.

drop policy if exists "images_return_owner_insert" on storage.objects;

create policy "images_return_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'returns'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
