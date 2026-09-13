-- 017 실행 후에도 anon key로 products/site_content 쓰기가 여전히 되는 것을
-- 브라우저 콘솔에서 직접 재현해서 확인함(실제로 상품명이 바뀌었다가 원복함).
--
-- 원인: 017에서는 내가 직접 지정한 이름("select_all", "write_admin_only")의
-- 정책만 지우고 새로 만들었는데, 이 테이블들이 예전에 Supabase 대시보드
-- Table Editor에서 만들어질 때 이미 다른 이름의(정확한 이름을 알 수 없는)
-- 느슨한 정책이 걸려 있었을 가능성이 높다. Postgres RLS는 같은 command에 대해
-- 여러 정책이 있으면 OR로 합쳐지므로, 내가 만든 제한적인 정책이 있어도
-- 기존의 느슨한 정책 하나가 남아있으면 그걸 통해 여전히 통과된다.
-- storage.objects에는 이미 이 방식(전부 지우고 재생성)을 썼는데 테이블 쪽은
-- 빠뜨렸음 — 이번엔 테이블에도 동일하게 적용한다.

do $$
declare
  pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'products'
  loop
    execute format('drop policy if exists %I on public.products', pol.policyname);
  end loop;
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'site_content'
  loop
    execute format('drop policy if exists %I on public.site_content', pol.policyname);
  end loop;
end $$;

-- RLS가 이미 켜져 있었을 수도, 꺼져 있었을 수도 있으니 확실히 켠다.
alter table public.products enable row level security;
alter table public.site_content enable row level security;

create policy "select_all"
  on public.products for select
  using (true);

create policy "write_admin_only"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "select_all"
  on public.site_content for select
  using (true);

create policy "write_admin_only"
  on public.site_content for all
  using (public.is_admin())
  with check (public.is_admin());
