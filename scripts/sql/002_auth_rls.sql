create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $is_admin$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and deleted_at is null
  );
$is_admin$;

alter table public.profiles enable row level security;

create policy "select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "delete_admin_only"
  on public.profiles for delete
  using (public.is_admin());
