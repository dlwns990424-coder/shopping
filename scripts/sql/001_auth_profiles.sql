-- ============================================================
-- Supabase Auth 전환 1단계: profiles 테이블 + RLS + 트리거
-- Supabase 대시보드 > SQL Editor 에서 전체를 한 번에 실행하세요.
-- 중간에 에러가 나서 다시 실행해도 안전하도록 맨 위에서 먼저 정리합니다.
-- ============================================================

-- 0) 재실행 대비 정리 (처음 실행이면 전부 없어서 조용히 넘어감)
drop trigger if exists trg_handle_new_user on auth.users;
drop trigger if exists trg_prevent_self_privilege_escalation on public.profiles;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user();
drop function if exists public.prevent_self_privilege_escalation();
drop function if exists public.is_admin();

-- 1) profiles 테이블
-- id는 auth.users.id(UUID)를 그대로 씀. deleted_at은 휴지통(소프트 삭제)용.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null,
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  suspended boolean not null default false,
  deleted_at timestamptz,
  joined_at timestamptz not null default now(),
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  shipping_address_detail text
);

-- 2) is_admin() 헬퍼 함수
-- RLS 정책 안에서 profiles를 다시 조회하면 재귀 문제가 생기므로
-- security definer로 RLS를 우회해서 안전하게 "내가 관리자인가"만 확인.
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

-- 3) RLS 활성화
alter table public.profiles enable row level security;

-- 4) 정책: 조회는 본인 또는 관리자만
create policy "select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- 5) 정책: 수정은 본인 또는 관리자만 (role/suspended/deleted_at은 아래 트리거로 이중 방어)
create policy "update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- 6) 정책: 가입 시 본인 프로필 1건만 생성 가능
create policy "insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 7) 정책: 완전 삭제는 관리자만
create policy "delete_admin_only"
  on public.profiles for delete
  using (public.is_admin());

-- 8) 트리거: 일반 회원이 자기 role/suspended/deleted_at을 직접 못 바꾸게 방어
-- (앱 코드에서 막아도, DB 레벨에서 한 번 더 막아두는 안전장치)
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

-- 9) 트리거: auth.users에 새 계정이 생기면 profiles도 자동 생성
-- (회원가입 화면에서 nickname/phone을 signUp()의 options.data로 같이 보낼 예정)
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
