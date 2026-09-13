-- products/site_content 테이블과 images 스토리지 버킷에 RLS 강화.
-- 지금까지 이 세 곳엔 RLS가 없거나(테이블 자체가 대시보드에서 직접 만들어져서
-- 정책이 없었음) 느슨하게 열려 있어서, anon key만 있으면 콘솔에서 누구나
-- 상품/콘텐츠를 수정하거나 이미지를 업로드/삭제할 수 있는 상태였다.
-- profiles/orders에 이미 쓰고 있는 is_admin() 패턴을 그대로 재사용한다.

-- 1) products: 조회는 전체 공개(비로그인 방문자도 상품을 봐야 함), 쓰기는 관리자만
alter table public.products enable row level security;

drop policy if exists "select_all" on public.products;
create policy "select_all"
  on public.products for select
  using (true);

drop policy if exists "write_admin_only" on public.products;
create policy "write_admin_only"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- 2) site_content: 동일 패턴(히어로/배너 문구는 비로그인 방문자도 봐야 함)
alter table public.site_content enable row level security;

drop policy if exists "select_all" on public.site_content;
create policy "select_all"
  on public.site_content for select
  using (true);

drop policy if exists "write_admin_only" on public.site_content;
create policy "write_admin_only"
  on public.site_content for all
  using (public.is_admin())
  with check (public.is_admin());

-- 3) images 스토리지 버킷: 코드 전체에서 이 버킷 하나만 쓰고 있어서(src/utils/uploadImage.ts),
-- storage.objects에 남아있을 수 있는 기존 정책(대시보드에서 만들어졌을 수 있는, 이름을
-- 알 수 없는 느슨한 정책 포함)을 전부 지우고 깨끗하게 재생성한다.
do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'storage' and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

create policy "images_public_read"
  on storage.objects for select
  using (bucket_id = 'images');

create policy "images_admin_write"
  on storage.objects for insert
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_update"
  on storage.objects for update
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'images' and public.is_admin());
