# first-shop 작업 진행 상황

> 이 파일은 집/학원 등 서로 다른 환경(다른 컴퓨터)에서 작업을 이어가기 위한 기록입니다.
> **새 환경에서 작업을 시작할 때는 이 파일부터 읽고 시작할 것.**
> Claude는 작업을 진행할 때마다(파일 생성/수정, 설계 결정 등 실질적 진행이 있을 때) 이 파일의
> "완료된 작업 / 다음에 할 작업 / 다음 세션 시작 지점"을 반드시 최신 상태로 갱신한다.
> 이 파일은 항상 **현재 상태 하나만** 반영한다 — 낡은 계획/중복 섹션은 새로 갱신할 때 정리해서 지운다.

---

## 마지막 갱신
- 날짜: 2026-09-03
- 작업 환경: (기록 안 됨, 다음부터 표시)

## 다른 컴퓨터에서 이어서 작업하는 법
1. 프로젝트 폴더에서: 처음이면 `git clone https://github.com/dlwns990424-coder/shopping.git`, 이미 있으면 `git pull`
2. `npm install` (node_modules는 git에 없음)
3. **이 파일의 "다음 세션 시작 지점" 확인**
4. Figma 작업이 필요하면 그 컴퓨터에서 플러그인 재설치/재인증 필요 (기기별 설정이라 GitHub로 안 넘어옴):
   `claude plugin install figma@claude-plugins-official` → Claude Code 재시작 → `/plugin` → figma 선택 → 인증
5. `.env`는 gitignore 대상이라 안 넘어옴 — 아직 Supabase 연동 전이라 당장은 불필요, 연동 단계부터는 기기마다 `.env.example` 참고해서 직접 채워야 함
6. `npm run dev`로 확인 (5173이 다른 프로젝트가 점유 중이면 자동으로 다른 포트로 뜸 — 터미널 로그에서 실제 포트 확인)

---

## 프로젝트 개요
- React(JS) + Supabase 기반 반응형 의류 쇼핑몰. 포트폴리오 + 학습 목적.
- 상세 요구사항: `project-summary.md`, `docs/planning-for-figma.md`
- **작업 방식(절대 규칙)**: 사용자가 명시적으로 "작업해"라고 지시하기 전까지 코드/파일/Figma를 임의로 수정하지 않는다. 코드 작성 시 무엇을/어떻게 했는지, 상태가 어떻게 바뀌는지 상세히 설명한다.
- **확정된 디자인 값** (Figma Cover & Foundations 기준, 더 이상 미확정 아님):
  - 컬러: 배경 `#FFFFFF`/`#F5F5F5`, 텍스트 `#1A1A1A`/`#6B6B6B`, 보더 `#D4D4D4`, 포인트 `#9C2B2B`(와인레드)/hover `#7A1F1F`
  - 폰트: Pretendard (Variable)
  - 스페이싱: 4/8/12/16/24/32/48/64/**80**(코드 작업 중 추가 확인)/96/128, 라운드: 0/4/8/12/999
  - 타이포: Display 40 / H1 32 / H2 24 / H3 20 / Body 16·14·13 / Caption 12 / Button 14 / Price 16

## Figma 연동 상태
- Figma MCP 플러그인(`figma@claude-plugins-official`) 설치+인증 완료 (계정: 뤠준, dlwns990424@gmail.com)
- 파일: **"first-shop 쇼핑몰 디자인"** — `https://www.figma.com/design/lX1aiEVIERPEOuWTV3kmmq/...`, fileKey `lX1aiEVIERPEOuWTV3kmmq`
- 완료된 데스크톱 와이어프레임(5개): **MEN, Product Detail, Cart, Order, HOME**
- **WOMEN/로그인/회원가입/마이페이지는 Figma 없이 코드로 직접 구현하기로 결정** (사용자 승인) — 관리자 4종은 Figma 자체가 없음
- 재사용 로컬 컴포넌트(파일 내 "Components" 페이지 5:62): Header(16:20), Footer(14:32), Product Card(10:49, 기본상태에서 이름/가격 숨김·호버시 노출), Category Card(23:21), Button(7:83), Hero Pill Button(24:195). 폰트는 Noto Sans KR(Figma 내부용, 코드는 Pretendard)

---

## 완료된 작업

### 기획 — 완료
요구사항/IA/스타일가이드 정리 (`project-summary.md`, `docs/planning-for-figma.md`)

### 코드 인프라 — 완료
- Vite+React19 스캐폴딩, 라우팅(`App.jsx`, `UserLayout`/`AdminLayout` 분리), Supabase 클라이언트 연결 코드(`src/lib/supabaseClient.js`, 실제 스키마는 아직 없음)
- 디자인 토큰(`src/index.css`): 컬러/스페이싱/라운드 CSS 변수, 타이포 유틸리티 클래스(`.text-*`), Pretendard 폰트
- **Git 최초 커밋 + GitHub 푸시 완료** — `origin` = `https://github.com/dlwns990424-coder/shopping.git`, `master` 브랜치. `d` 파일은 의도적으로 매번 제외(정체 미확인), `.env`는 정상 제외

### 공통 컴포넌트 (`src/components/`) — 13개 완료
Header, Footer, Button, HeroPillButton, Input, Checkbox, ProductCard, CategoryCard, Swatch, SizeSelector, QuantityStepper, CartItemRow, OrderItemRow
(Badge는 만들었다가 사용자 요청으로 완전 삭제함 — NEW/SALE 뱃지 기능 자체를 안 쓰기로 함)

### 페이지 — 4/9 완료
- [x] **Home** — Hero(100dvh)+카테고리타일(MEN/WOMEN)+에디토리얼배너+신상품그리드
- [x] **Men** — Hero(3분할 이미지, 100dvh)+신상품 8개+카테고리 3개(상의/아우터/하의)
- [x] **Women** — Men과 동일 구조 미러링 (`GenderPage.css` 공유)
- [x] **ProductDetail** — 상세이미지 3장+sticky 정보패널(컬러/사이즈 선택 상태관리, useState)+관련상품 4개(같은 gender 필터)
- [ ] Cart, Order, MyPage, Login, Signup — 스텁(제목만)
- [ ] 관리자 4종(상품/주문/회원/매출관리) — 스텁, 디자인 자체가 없어서 기능 위주로 심플하게 만들 예정

### 상품 카드 관련 디자인 조정 (사용자 피드백, 여러 차례 수정 거침)
- 기본 상태엔 이미지만, 호버 시에만 이름/가격 오버레이 (Figma 원본과 동일하게 재수정함)
- 상하 카드 간격 0 + 각진 모서리(`border-radius:0`) — 위/아래 카드가 한 세트(상의+하의)로 이어지는 느낌
- 카드 크기는 `height:400px` 고정값 대신 **`aspect-ratio:3/4`** 사용 — 반응형에서 열 개수 바뀌어도 비율 유지됨 (고정 px는 반응형에서 찌그러짐 문제 있었음)
- 히어로 섹션 전체 `height:100dvh`

### 데이터
- 목업만 사용 중: `src/mock/products.js`(16개, gender/category 포함), `categories.js`, `productDetail.js`(컬러3/사이즈5/설명)
- Supabase 실제 테이블/Storage/`.env` 키 — **전부 미착수**

### 알아둘 것
- 콘솔에 가끔 뜨는 정체불명 `[EXCEPTION] Object`는 브라우저 자동화 확장 자체의 메시징 노이즈로 확인됨(1건은 "message channel closed" 메시지 포함) — 앱 코드 문제 아님, 매번 페이지는 정상 동작 확인함
- `d` 파일(프로젝트 루트, 27KB, first-shop과 무관한 다른 프로젝트 HTML 조각으로 추정) — 삭제 여부 계속 미확인, 커밋에서 계속 제외 중

---

## 다음 세션 시작 지점
**로그인/회원가입 페이지부터 시작** (Cart보다 먼저 하기로 순서 변경 — Input/Button만 조합하면 되는 단순한 페이지라 빠르고 "가입→로그인→쇼핑" 흐름상 자연스러움. 단 Supabase 연동 전이라 실제 인증 동작은 안 되고 폼 UI만 완성됨)
- 회원가입 필드(요구사항 기준): 이메일, 비밀번호, 이름, 휴대폰번호, 주소
- 로그인 필드: 이메일, 비밀번호만
- 그 다음 순서: Cart → Order → MyPage → 관리자 4종 → Supabase 실연동 → 반응형 정밀 검증

## 앞으로 해야 할 것 (전체, 우선순위 순)
1. 로그인/회원가입 페이지
2. Cart 페이지 (CartItemRow + 체크박스 선택/삭제/수량 상태관리)
3. Order 페이지 (OrderItemRow + 가상결제)
4. MyPage (주문내역, OrderItemRow 재사용)
5. 관리자 4종 (기능 위주, 디자인 없이)
6. Supabase 실연동: 테이블 스키마 설계(profiles/products/cart_items/orders/order_items) → 생성 → Storage 버킷 → 각 페이지 mock을 실제 쿼리로 교체 → `.env` 키 입력(기기마다)
7. Supabase Auth 연결 (이메일/비밀번호), 로그인 상태 기반 라우트 보호
8. 반응형 정밀 검증 (지금은 1024px 기본 미디어쿼리만 있음, 실기기/개발자도구 미확인)
9. `d` 파일 처리 여부 결정
