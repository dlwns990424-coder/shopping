-- 홈 히어로(태블릿+데스크톱 전용, md 768px 이상)의 신규 레이어 구성 필드 시딩.
-- 블러 배경 + 가운데 카드(로고/시즌라벨/"둘러보기") + 좌우 누끼 인물 4장 + 시즌 라벨 텍스트.
-- 이미 준비된 소스가 public/images/new-hero/에 있어서, 빈 값이 아니라 그 정적 경로를
-- 초기값으로 그대로 시딩한다(관리자에서 나중에 재업로드하면 Supabase Storage URL로 대체됨).

insert into public.site_content (key, page, label, value, display_order) values
  ('home.hero_layered.bg_image', 'home', '홈 히어로 배경 (블러)', '/images/new-hero/bg.png', 410),
  ('home.hero_layered.card_image', 'home', '홈 히어로 가운데 카드', '/images/new-hero/card-bg.png', 411),
  ('home.hero_layered.left_model', 'home', '홈 히어로 좌측 인물', '/images/new-hero/left-model-cutout.png', 412),
  ('home.hero_layered.right_model', 'home', '홈 히어로 우측 인물', '/images/new-hero/right-model-cutout.png', 413),
  ('home.hero_layered.season_label', 'home', '홈 히어로 시즌 라벨', 'Fall/Holiday 2026', 414);
