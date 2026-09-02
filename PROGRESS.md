# first-shop 작업 진행 상황

> 이 파일은 집/학원 등 서로 다른 환경(다른 컴퓨터)에서 작업을 이어가기 위한 기록입니다.
> **새 환경에서 작업을 시작할 때는 이 파일부터 읽고 시작할 것.**
> Claude는 작업을 진행할 때마다(파일 생성/수정, 설계 결정 등 실질적 진행이 있을 때) 이 파일의
> "완료된 작업 / 다음에 할 작업 / 다음 세션 시작 지점"을 반드시 최신 상태로 갱신한다.

---

## 마지막 갱신
- 날짜: 2026-09-02
- 작업 환경: (기록 필요 — 집/학원 중 어디서 갱신했는지 다음부터 표시)

---

## 프로젝트 개요 (요약)
- React(JS, TS 아님) + Supabase 기반 반응형 의류 쇼핑몰. 포트폴리오 + 학습 목적.
- 상세 요구사항/기획: `project-summary.md`, `docs/planning-for-figma.md` 참고.
- **작업 순서**: 코드 작업 전에 **Figma 와이어프레임 → 디자인**을 먼저 끝내기로 함. 코드 작업은 아직 시작 안 함(보류 상태).
- **작업 방식(중요, 절대 규칙)**: 사용자가 명시적으로 "작업해"라고 지시하기 전까지 코드/파일/Figma 등 어떤 것도 임의로 작성·수정하지 않는다. 계획을 보고하고 승인을 받아도 실행 시점은 별도로 확인한다. 실행 시에는 무엇을/어떻게 했는지, 상태가 어떻게 바뀌는지 상세히 설명한다.

## Figma 연동 상태
- Claude Code에 공식 Figma MCP 플러그인(`figma@claude-plugins-official`) 설치 및 OAuth 인증 완료 (계정: 뤠준, dlwns990424@gmail.com, "뤠준의 팀" Pro/Full seat)
- 작업 파일: **"first-shop 쇼핑몰 디자인"**
  - URL: `https://www.figma.com/design/lX1aiEVIERPEOuWTV3kmmq/first-shop-쇼핑몰-디자인`
  - fileKey: `lX1aiEVIERPEOuWTV3kmmq`
  - 페이지: `0:1 Cover & Foundations`, 캔버스 `5:63 Wireframe · User` (node-id로 접근)
- 다른 컴퓨터에서 이어서 Figma 작업하려면: Claude Code 재시작 후 `/plugin`에서 figma 연결 상태(connected) 확인 필요. 이미 인증된 계정 기준이라 기기가 바뀌어도 같은 Figma 계정으로 로그인하면 재사용 가능할 것으로 예상(미검증).

---

## 완료된 작업

### 기획 단계
- [x] 요구사항 정리 완료 (`project-summary.md`)
- [x] IA/사이트맵, 스타일가이드 추천안, 디자인 레퍼런스 정리 완료 (`docs/planning-for-figma.md`)

### 코드 초기 세팅
- [x] Vite + React 19 프로젝트 스캐폴딩, 패키지 설치 (`react-router-dom`, `@supabase/supabase-js`, `oxlint`)
- [x] `App.jsx` 라우팅 구조 완성 — `UserLayout`/`AdminLayout`으로 사용자·관리자 영역 분리, 요구사항의 모든 경로 매핑
- [x] `src/lib/supabaseClient.js` Supabase 클라이언트 연결 코드 작성, `.env.example` 준비
- [x] 페이지 컴포넌트 전체 껍데기(스텁) 생성: Home, Men, Women, ProductDetail, Cart, Order, MyPage, Login, Signup + 관리자 4개(ProductManage, OrderManage, MemberManage, SalesManage) — **전부 제목만 표시, 실제 기능 없음**

### 디자인 토큰 & 공통 컴포넌트 (코드 1~2단계)
- [x] **1단계** — `pretendard` npm 패키지 설치, `src/index.css` 전면 재작성: Figma Foundations 값 그대로 CSS 변수화(`--color-*`, `--spacing-4~128`, `--radius-none~full`), 타이포 유틸리티 클래스(`.text-display/h1/h2/h3/body-lg/body/body-sm/caption/button/price`), Vite 기본 템플릿 잔재(다크모드, 보라 accent, `#root` 폭고정) 제거
- [x] **2단계** — `src/components/`에 재사용 컴포넌트 14개 생성: Header, Footer, Button, HeroPillButton, Input, Checkbox, Badge, ProductCard, CategoryCard, Swatch, SizeSelector, QuantityStepper, CartItemRow, OrderItemRow. `UserLayout`이 새 Header/Footer 사용하도록 연결 완료
- [x] 브라우저(dev server, `npm run dev` → 포트 5174, 5173은 다른 프로젝트 VELA가 사용 중)에서 실제 렌더링 확인: 폰트/컬러/네비게이션 active state 정상 동작, 콘솔 에러 없음
- [x] **3단계 시작 — HOME 페이지 구현 완료**: `src/pages/Home.jsx`+`Home.css`, `src/mock/products.js`(목업 상품 4개) 생성. Figma HOME 와이어프레임 구조 그대로 Hero(문구+HeroPillButton) → CategoryCard×2(MEN/WOMEN) → 에디토리얼 배너 → ProductCard×4(NEW ARRIVAL) 조립. 브라우저에서 전체 스크롤 확인, 콘솔 에러 없음(일회성 불명확한 exception 하나 발견됐으나 재현 안 됨 — 확장프로그램/환경 노이즈로 추정)
- [x] **MEN 페이지 구현 완료**: `src/pages/Men.jsx`+`Men.css`. Hero(3분할 이미지 그리드 + "T&L | MEN" + 카피 — Figma의 3장 콜라주를 웹에서는 유지보수 쉬운 3열 그리드로 단순화), NEW ARRIVAL(상품 8개), SHOP BY CATEGORY(상의/아우터/하의 3개) 구현. `src/mock/products.js`를 gender/category 필드 포함해 8개로 확장, `src/mock/categories.js` 신규 생성
  - 리팩터링: Home과 MEN이 공통으로 쓰는 "타이틀+그리드" 섹션 패턴을 `index.css`에 `.page-section`/`.page-section__header`/`.product-grid`/`.category-grid` 공용 클래스로 추출 (Home.css 중복 제거, Home 회귀 확인 완료)
  - 브라우저 확인: Hero/그리드/카테고리/Footer 전체 스크롤 정상, MEN 네비 active 밑줄 정상, 콘솔 에러 없음
- [x] **Figma 재검증 후 수정** (사용자 지적으로 발견):
  - 히어로 섹션 높이를 `100dvh`로 변경 (Home `.home-hero`, MEN `.gender-hero`) — Figma 고정값(900px)이 아니라 사용자가 명시적으로 지정한 값. WOMEN도 나중에 동일 적용 필요
  - 섹션 좌우/하단 패딩이 64px가 아니라 **80px**이 맞음을 Figma에서 재확인 → `index.css`에 `--spacing-80` 토큰 추가(Foundations 스케일엔 없지만 실제 와이어프레임에서 일관되게 80 사용), `.page-section`/`.product-grid`/`.category-grid`에 적용
  - **ProductCard 전면 수정**: Figma 원본은 카드 전체(302:520 비율)가 이미지 하나이고 이름/가격은 기본 상태엔 안 보이다가 호버 시에만 이미지 위 오버레이로 나타남. 이전에 제가 임의로 "항상 보이게" 바꿨던 걸 되돌려서 Figma와 동일하게 호버 리빌 방식으로 재구현(`:hover`+`:focus-visible`). 브라우저에서 호버 동작 확인 완료
  - **참고(추후 검토 필요)**: 호버로만 이름/가격이 보이는 구조라 모바일(호버 없음)에서는 안 보임 — "다음: 반응형 작업" 단계에서 모바일은 항상 노출하는 등 별도 처리 필요할 수 있음
- [x] **디자인 다듬기 (사용자 피드백 반영)**:
  - `ProductCard` 상하 카드 간격(`row-gap`) 0, 좌우 간격만 24px 유지 — 위/아래 카드가 한 세트(예: 상의+하의)로 자연스럽게 이어지도록
  - `ProductCard` 이미지 `border-radius`를 `--radius-none`(0)으로 — 각지게 붙어서 하나처럼 보이게
  - 카드 높이: `height:400px` 고정값 시도 → 반응형(2열/1열 전환 시 비율 깨짐) 문제로 **`aspect-ratio: 3/4`**로 최종 변경 (화면 크기 바뀌어도 비율 유지, 데스크톱에서 ~400px 근사)
  - **Badge(NEW/SALE) 기능 전체 제거**: `ProductCard`에서 badge 로직 삭제, `mock/products.js`의 `badge` 필드 삭제, 아무 데서도 안 쓰는 `Badge.jsx`/`Badge.css` 파일 삭제
  - 히어로 섹션 높이 `100dvh` (Home/Men/Women 전체 적용)
- [x] **WOMEN 페이지 구현 완료**: `src/pages/Women.jsx`. MEN과 완전히 동일한 구조(Hero "T&L | WOMEN" + NEW ARRIVAL 8개 + SHOP BY CATEGORY 3개)를 미러링. `mock/products.js`에 women 상품 8개, `mock/categories.js`에 `womenCategories` 추가
  - 리팩터링: MEN 전용이던 `Men.css`를 `GenderPage.css`로 이름 변경해 Men/Women이 공유하도록 정리 (완전 동일한 CSS 중복 방지)
  - 브라우저 확인: WOMEN 히어로/그리드/카테고리 정상, WOMEN 네비 active 정상, MEN 페이지 회귀 없음 확인
- [x] **Product Detail 페이지 구현 완료**: `src/pages/ProductDetail.jsx`+`ProductDetail.css`, `src/mock/productDetail.js`(컬러 3종/사이즈 5종/제품설명) 신규 생성
  - 구조(Figma 그대로): 좌측 상세이미지 3장 세로 스택(4:5 비율) + 우측 **sticky 정보 패널**(상품명/가격/위시리스트 아이콘, 컬러 스와치, 사이즈 선택, 제품정보, 버튼 2개: "장바구니 담기"(secondary)+"바로 구매"(primary)) + 하단 "함께 보면 좋은 상품" 4개(같은 gender만 필터링)
  - `useParams()`로 `:productId` 읽어서 `products` 목업에서 조회, 컬러/사이즈는 `useState`로 선택 상태 관리(클릭 시 라벨/선택 스타일 즉시 반영)
  - 브라우저에서 컬러/사이즈 클릭 인터랙션 확인, sticky 패널 동작을 `window.scrollTo` JS로 여러 지점 찍어서 직접 검증(항상 top:96px 유지 확인)
  - 콘솔에서 반복적으로 잡히던 정체불명 예외의 정체를 이번에 확인 — "message channel closed" 메시지 포함, 브라우저 확장프로그램(자동화 도구) 자체의 메시징 노이즈로 확인됨. 앱 코드와 무관.
- [ ] **다음: 3단계 계속 — Cart(장바구니) 페이지** (CartItemRow + 체크박스 선택/삭제/수량 상태관리 필요). 이후 Order → 로그인/회원가입/마이페이지 → 관리자 4종 순서

### 형상관리
- [x] Git 저장소 초기화됨
- [ ] **아직 커밋 한 번도 없음** — GitHub 원격 저장소도 아직 연결 안 됨 (여러 기기 동기화를 위해 반드시 필요)

### Figma 와이어프레임 (데스크톱) — "first-shop 쇼핑몰 디자인" 파일에서 확인됨
- [x] **MEN** — Header, Hero Banner(이미지 3장+오버레이 텍스트), NEW ARRIVAL 상품그리드(Product Card 8개), SHOP BY CATEGORY(Category Card 3개), Footer
- [x] **Product Detail** — Header, 상세이미지 3장, 정보패널(상품명/가격/컬러스와치/사이즈선택/제품정보/버튼2개), "함께 보면 좋은 상품" 그리드 4개, Footer
- [x] **Cart** — 채워진 상태(상품3개, 체크박스/수량조절/삭제, 주문요약) + 빈 상태(Empty)
- [x] **Order(주문/결제)** — 배송지, 주문상품목록, 결제금액요약, 약관동의, 결제버튼
- [x] **HOME** — Header, Hero(문구 "2026 NEW SEASON COLLECTION"+쇼핑하기 버튼), 카테고리 타일(MEN/WOMEN), 에디토리얼 배너("THE ESSENTIAL LAYER"), NEW ARRIVAL 상품그리드(4개), Footer — 기존 MEN 페이지 컴포넌트 재사용. Figma node: section id `79:396` / wrapper `79:397` (Wireframe · User 페이지)
  - 사이즈 점검 후 수정: Category Card는 내부 이미지가 420px 고정이라 세로로 억지로 늘리면(700) 안 됨 — 너비만 FILL, 높이는 컴포넌트 기본값(474) 유지해야 함. MEN 페이지도 같은 방식으로 폭만 다르게 씀.
- [ ] **WOMEN** — 미작업
- [ ] **마이페이지** — 미작업
- [ ] **로그인/회원가입** — 미작업
- [ ] 관리자 4종(상품/주문/회원/매출관리) — 아직 논의 안 됨, 순서 미정
- [ ] 태블릿/모바일 반응형 — 데스크톱 전체 끝난 뒤 진행 예정
- Header/Footer/Product Card/Category Card 등은 재사용 컴포넌트(instance)로 구성되어 있음

---

## 미확정 사항 (사용자 확정 필요, 임의 결정 금지)
- [ ] 컬러 팔레트 — 추천안: 오프화이트#F5F5F3 + 차콜블랙#1A1A1A + 그레이#8C8C8C + 포인트컬러(딥그린#2F3E34 / 카멜#B08B5A / 네이비#1F2A3C 중 택1)
- [ ] 폰트 — 추천안: 한글 Pretendard + 영문 Inter 또는 Archivo
- [ ] 세부 상품 카테고리 — 추천안: 상의/아우터/하의/신발/액세서리 (단, 이미 만들어진 Figma 와이어프레임에 카테고리 구조가 반영되어 있을 수 있으니 다음 확인 시 대조 필요)

## 확인 필요한 이슈
- [ ] 프로젝트 루트의 `d` 파일 — 27KB, 확장자 없음. 내용 확인 결과 first-shop과 무관한 "랜딩페이지 프롬프트 생성기" HTML 조각으로 보임. 실수로 들어간 파일인지 확인 후 삭제 여부 결정 필요.

---

## 다음에 할 작업 (우선순위 순, 사용자 확정)
1. **Figma 데스크톱 와이어프레임**: HOME → WOMEN → 마이페이지 → 로그인/회원가입 순서로 제작 (관리자 4종은 순서 미정, 별도 논의 필요)
2. 데스크톱 와이어프레임 전체 완료 후 **반응형(태블릿/모바일) 작업**
3. 와이어프레임 → 실제 디자인(컬러/폰트 적용) 단계로 전환
4. 디자인 최종 확정 (컬러/폰트/카테고리)
5. Supabase 프로젝트 실제 생성 + 테이블 스키마 반영 (profiles/products/cart_items/orders/order_items) + Storage 버킷 생성 — 현재 SQL/스키마 파일 없음, DB 실제 세팅 안 된 것으로 추정
6. `.env`에 실제 Supabase URL/anon key 입력 (기기별로 각각 설정 필요 — `.env`는 gitignore 대상이라 Git으로 동기화 안 됨, 매 기기마다 수동 입력해야 함)
7. Git 최초 커밋 + GitHub 원격 저장소 생성/연결
8. 페이지별 실제 기능 구현 착수 (Figma 디자인 완료 후, "작업해" 지시 시 시작)

## 다음 세션 시작 지점
- **WOMEN 페이지 데스크톱 와이어프레임 제작**부터 시작 (사용자가 "작업해"라고 명시할 때 진행). HOME과 동일하게 기존 컴포넌트(Header/Footer/Product Card/Category Card) 재사용, MEN 페이지 구조를 그대로 성별만 바꿔서 미러링하면 될 것으로 예상.
- 그 다음: 마이페이지 → 로그인/회원가입 → (관리자 4종 순서 논의) → 반응형(태블릿/모바일)
- 보류 중인 이슈: `d` 파일 삭제 여부 아직 미확인.

## Figma 작업 시 참고 (컴포넌트 키)
재사용 중인 로컬 컴포넌트(파일 lX1aiEVIERPEOuWTV3kmmq, "Components" 페이지 5:62):
- Header (component set 16:20) — Breakpoint=Desktop 13:20
- Footer (component 14:32)
- Product Card (component set 10:49) — State=Default 10:39, 속성: Name#10:4, Price#10:7, Show Badge#24:0 (텍스트는 기본 상태에서 숨겨져 있고 Hover 상태에서 노출됨)
- Category Card (component set 23:21) — State=Default 23:11, 속성: Label#23:0
- Button (component set 7:83), Hero Pill Button (component set 24:195, 속성: Label#24:6)
- 폰트: Noto Sans KR (Bold/Regular)
