create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.suspended := old.suspended;
    new.deleted_at := old.deleted_at;
  end if;
  return new;
end;
$prevent$;

create trigger trg_prevent_self_privilege_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_self_privilege_escalation();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $new_user$
begin
  insert into public.profiles (id, email, nickname, phone, role, joined_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'user',
    now()
  );
  return new;
end;
$new_user$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
