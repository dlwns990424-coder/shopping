-- 009_strip_size_measurements.sql
-- 상품 설명에 있던 고정 실측치 라인(어깨너비/가슴단면/총장, 허리단면/밑위/밑단너비 등)을 제거.
-- 사이즈를 선택해도 항상 같은 값이 노출되고 있어서 오해의 소지가 있어 전부 삭제(60개 상품 전체 대상).

update public.products
set description = regexp_replace(description, E'\n(어깨너비|허리단면)[^\n]*', '', 'g')
where description ~ '(어깨너비|허리단면)';
