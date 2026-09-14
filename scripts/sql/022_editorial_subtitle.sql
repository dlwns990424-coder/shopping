-- 에디토리얼 섹션 우측 상단에 메인 타이틀 아래로 짧은 설명 문구(서브 타이틀)를
-- 추가로 둘 수 있도록 신규 필드 시딩(021_editorial_section.sql 후속).

insert into public.site_content (key, page, label, value, display_order) values
  ('men.editorial.subtitle', 'men', 'MEN 에디토리얼 서브타이틀', '', 304),
  ('women.editorial.subtitle', 'women', 'WOMEN 에디토리얼 서브타이틀', '', 305);
