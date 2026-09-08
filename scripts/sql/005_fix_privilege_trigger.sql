-- 방금 발견한 버그 수정: SQL Editor에서 직접 UPDATE 할 때는 로그인 세션이 없어서
-- auth.uid()가 null이 되고, is_admin()이 항상 거짓으로 나와서 트리거가 role 변경을
-- 조용히 되돌리고 있었습니다. "로그인한 일반 사용자가 앱을 통해 스스로 권한을
-- 바꾸려는 경우"만 막도록 조건을 하나 추가합니다(auth.uid()가 있을 때만 검사).
create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $prevent$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
    new.suspended := old.suspended;
    new.deleted_at := old.deleted_at;
  end if;
  return new;
end;
$prevent$;

-- admin@test.com을 다시 관리자로 승격 (이번엔 정상 반영됨)
update public.profiles
set role = 'admin'
where email = 'admin@test.com';
