-- MEN/WOMEN 에디토리얼을 실제 화면과 동일한 "페이지당 단일 배너" 구조로 통일한다.
-- 기존 sub-1의 제목/설명/이미지는 새 키로 이전하고, 같은 이미지를 세 화면의 초기값으로 쓴다.
-- 관리자가 새 비율별 이미지를 등록하면 각 값이 독립적으로 교체된다.

with legacy as (
  select
    coalesce(nullif(max(value) filter (where key = 'men.editorial_sub_banner.sub-1.title'), ''), 'THE NEW TAILORING') as title,
    coalesce(max(value) filter (where key = 'men.editorial_sub_banner.sub-1.subtitle'), '') as subtitle,
    coalesce(max(value) filter (where key = 'men.editorial_sub_banner.sub-1.image'), '') as image
  from public.site_content
)
insert into public.site_content (key, page, label, value, display_order)
select values_to_insert.*
from legacy
cross join lateral (
  values
    ('men.editorial_banner.title', 'men', 'MEN 에디토리얼 타이틀', legacy.title, 410),
    ('men.editorial_banner.subtitle', 'men', 'MEN 에디토리얼 설명', legacy.subtitle, 411),
    ('men.editorial_banner.button_label', 'men', 'MEN 에디토리얼 버튼 문구', '컬렉션 보기', 412),
    ('men.editorial_banner.enabled', 'men', 'MEN 에디토리얼 노출 여부', case when legacy.image <> '' then 'true' else 'false' end, 413),
    ('men.editorial_banner.image_mobile', 'men', 'MEN 에디토리얼 모바일 이미지', legacy.image, 414),
    ('men.editorial_banner.image_tablet', 'men', 'MEN 에디토리얼 태블릿 이미지', legacy.image, 415),
    ('men.editorial_banner.image_desktop', 'men', 'MEN 에디토리얼 데스크톱 이미지', legacy.image, 416)
) as values_to_insert(key, page, label, value, display_order)
on conflict (key) do nothing;

with legacy as (
  select
    coalesce(nullif(max(value) filter (where key = 'women.editorial_sub_banner.sub-1.title'), ''), 'THE NEW TAILORING') as title,
    coalesce(max(value) filter (where key = 'women.editorial_sub_banner.sub-1.subtitle'), '') as subtitle,
    coalesce(max(value) filter (where key = 'women.editorial_sub_banner.sub-1.image'), '') as image
  from public.site_content
)
insert into public.site_content (key, page, label, value, display_order)
select values_to_insert.*
from legacy
cross join lateral (
  values
    ('women.editorial_banner.title', 'women', 'WOMEN 에디토리얼 타이틀', legacy.title, 430),
    ('women.editorial_banner.subtitle', 'women', 'WOMEN 에디토리얼 설명', legacy.subtitle, 431),
    ('women.editorial_banner.button_label', 'women', 'WOMEN 에디토리얼 버튼 문구', '컬렉션 보기', 432),
    ('women.editorial_banner.enabled', 'women', 'WOMEN 에디토리얼 노출 여부', case when legacy.image <> '' then 'true' else 'false' end, 433),
    ('women.editorial_banner.image_mobile', 'women', 'WOMEN 에디토리얼 모바일 이미지', legacy.image, 434),
    ('women.editorial_banner.image_tablet', 'women', 'WOMEN 에디토리얼 태블릿 이미지', legacy.image, 435),
    ('women.editorial_banner.image_desktop', 'women', 'WOMEN 에디토리얼 데스크톱 이미지', legacy.image, 436)
) as values_to_insert(key, page, label, value, display_order)
on conflict (key) do nothing;

delete from public.site_content
where key like 'men.editorial_sub_banner.%'
   or key like 'women.editorial_sub_banner.%';
