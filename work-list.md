# first-shop 작업 현황 (2026-09-03 기준)

## 완료된 페이지 (6/8)

Home 페이지는 삭제됨 — `/`와 `/men` 둘 다 Men 페이지를 보여줌(기본 홈 = Men).

| 페이지 | 내용 |
|---|---|
| **Men** (= 기본 홈, `/`와 `/men`) | 3분할 이미지 Hero(100dvh) + 에디토리얼 배너 + NEW ARRIVAL(최대 8개, 더보기→전체 상품) + 카테고리 2개(상의/하의, 클릭 시 실제 필터링) |
| **Women** | Men과 동일 구조 미러링 |
| **ProductDetail** | 상세이미지 3장 + sticky 정보패널(컬러/사이즈 선택) + 관련상품 4개 |
| **Login** | 이메일/비밀번호, localStorage 기반 목업 인증 |
| **Signup** | 닉네임/이메일/비밀번호/휴대폰번호, 검증 + 계정 저장 + 토스트 + 자동 로그인 페이지 이동 |
| **Cart** | 담긴 상태/빈 상태 둘 다 구현, 전체선택·개별선택·선택삭제·개별삭제·수량변경, 선택 항목 기준 금액 합산 |

**+ 부가 작업**: 공통 컴포넌트 14개(Toast 포함), 헤더 전면 개편(Lucide 아이콘, 상단 고정, MEN/WOMEN 활성 색상 로직), 로그인 상태 전역 관리(`AuthContext`, Supabase 연동 전 임시 localStorage 방식), 헤더/푸터 로고를 실제 이미지(`src/assets/logo.png`)로 교체

## 스텁 상태 (제목만 있음, 미착수)
- **Order** — 주문/결제
- **MyPage** — 마이페이지
- **관리자 4종** (상품/주문/회원/매출관리) — Figma 디자인 자체가 없어서 기능 위주로 심플하게 작업 예정

## 앞으로 할 작업 순서 (Claude 기준 제안)
1. **Order** — OrderItemRow + 가상결제 (Figma 노드 확보돼 있음, Cart와 레이아웃 패턴 유사)
2. **MyPage** — 주문내역(OrderItemRow 재사용)
3. **관리자 4종** — 기능 위주
4. **Supabase 실연동** — 테이블 스키마(profiles/products/cart_items/orders/order_items) 설계 → 생성 → Storage 버킷 → mock을 실제 쿼리로 교체
5. **Supabase Auth 연결** — 지금의 localStorage 기반 `AuthContext`를 실제 `signUp`/`signInWithPassword`/`signOut`으로 교체, 로그인 기반 라우트 보호
6. **반응형 정밀 검증** — 지금은 1024px 미디어쿼리만 있고 실기기 검증 안 됨

---

<!-- 아래는 사용자가 직접 작성하는 영역입니다. Claude는 이 아래 내용을 수정하거나 삭제하지 않습니다. -->

## 해야 할 것 (직접 작성)
