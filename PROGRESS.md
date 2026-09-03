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
- node_modules가 없는 상태였음 → `npm install` 새로 실행함 (38 packages)
- **Git: 로컬에 커밋 2개, GitHub(origin)엔 아직 안 올라감(push 보류 요청 상태)** — 다른 컴퓨터로 넘어가기 전에 `git push` 필요. 커밋 내역: ① 로그인/회원가입/Toast/AuthContext + Cart 페이지 + 헤더·푸터 로고 이미지 교체 + Home 삭제/라우팅 변경, ② 섹션 간격 통일 + 상품 임시 이미지 + 카테고리 정리(상의/하의 통합, 신발 삭제)·NEW ARRIVAL 고정 8개·카테고리 필터링

## 다른 컴퓨터에서 이어서 작업하는 법
1. 프로젝트 폴더에서: 처음이면 `git clone https://github.com/dlwns990424-coder/shopping.git`, 이미 있으면 `git pull`
2. `npm install` (node_modules는 git에 없음)
3. **이 파일의 "다음 세션 시작 지점" 확인**
4. Figma 작업이 필요하면 그 컴퓨터에서 OAuth 재인증 필요 (기기별 세션이라 GitHub로 안 넘어옴): `plugin:figma:figma` MCP 도구(`authenticate`) 호출 → 뜨는 URL을 브라우저에서 열어 인가. 데스크톱 앱 설치는 불필요.
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
- Figma 원격 MCP(`plugin:figma:figma`, OAuth 인증, mcp.figma.com) 인증 완료 (계정: 뤠준, dlwns990424@gmail.com, Pro 플랜). 예전에 쓰던 로컬 데스크톱 플러그인(`figma@claude-plugins-official`)과는 별개 서버 — 새 컴퓨터에서도 OAuth 로그인만 하면 되고 데스크톱 앱 설치/재인증 불필요.
- 파일: **"first-shop 쇼핑몰 디자인"** — `https://www.figma.com/design/lX1aiEVIERPEOuWTV3kmmq/...`, fileKey `lX1aiEVIERPEOuWTV3kmmq`
- **주의**: `get_metadata(fileKey)`를 nodeId 없이 호출하면 최상위 페이지로 "Cover & Foundations"(0:1)만 나옴(원인 불명, API 인덱싱 이슈로 추정 — 데스크톱 앱 의존 문제 아니었음, OAuth 원격 연동에서도 동일). 실제 와이어프레임은 **"Wireframe · User"라는 별도 페이지**(canvas id `5:63`)에 있고, 이 nodeId를 직접 넣어서 `get_metadata(fileKey, nodeId:"5:63")`로 호출해야 전체 구조가 나옴.
- **완료된 데스크톱 와이어프레임 노드 id (`5:63` 페이지 하위)**:
  - MEN: section `18:2` (frame `18:3`)
  - Product Detail: section `42:100` (frame `42:101`)
  - Cart: section `54:169` — `Cart / Desktop`(`54:170`, 상품 3개 담긴 상태: 전체선택 체크박스+선택삭제, Cart Item Row 3개, 우측 주문요약+결제 버튼), `Cart / Empty`(`54:306`, 빈 장바구니 상태: 아이콘+안내문구+쇼핑 유도 버튼)
  - Order: section `64:287` (frame `64:288` "Order / Desktop" — 배송지, 주문상품 Order Item Row 2개, 결제금액 패널, 약관 체크박스, 결제 버튼)
  - HOME: section `79:396` (frame `79:397`)
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
- `lucide-react` 패키지 추가 — 헤더 아이콘(검색/위시리스트/장바구니/마이페이지)에 사용

### 헤더 — 개편 완료
- 아이콘 4종을 인라인 SVG → `lucide-react`(`Search`/`Heart`/`ShoppingBag`/`User`, size 20 / strokeWidth 1.5)로 교체
- `.site-header`를 `position: fixed`(상단 고정)로 변경 — `UserLayout.jsx`가 `UserLayout.css`를 새로 불러와 `main`에 `padding-top: 64px`(헤더 높이만큼)을 줘서 콘텐츠가 헤더 밑으로 가리지 않게 함. `AdminLayout`은 이번 범위 아님(헤더 자체가 다름)
- MEN/WOMEN 네비 색상: 기본은 `--color-text-disabled`(가장 연한 회색 톤, 처음엔 `--color-text-secondary`로 했다가 사용자 피드백으로 더 연하게 변경), 현재 라우트와 일치할 때만(`NavLink`의 `isActive`) `--color-text-primary`(진한 색)+밑줄 — 즉 MEN 페이지에선 MEN만 진하고 WOMEN은 연하게, WOMEN 페이지에선 반대, 그 외 페이지에선 둘 다 연하게
- 아이콘 4종은 반대 패턴: 기본 진한 색, hover 시 `--color-text-disabled`로 옅어짐
- 브라우저로 Home/Men/Women/Login에서 고정 헤더 스크롤 동작, 네비 색상 전환, 아이콘 hover까지 확인 완료

### 로고 이미지 적용 (2026-09-03)
- 사용자가 `first-shop/img/logo`에 넣어둔 와인레드 "T&L" 워드마크 PNG(투명 배경, 브랜드 포인트 컬러 `#9c2b2b`와 정확히 일치)를 실제 글자 영역만 남기고 트리밍해서 `src/assets/logo.png`로 저장(1068×416)
- 헤더(`Header.jsx`)와 푸터(`Footer.jsx`)의 "T&L" 텍스트 로고를 이 이미지로 교체 (`site-header__logo-img` 26px, `site-footer__logo` 22px, 둘 다 `height` 고정+`width:auto`)
- Men/Women 히어로의 "T&L | MEN·WOMEN" 캡션과 푸터 카피라이트(`© 2026 T&L.`)는 문장 속 텍스트라 그대로 유지 — 로고 단독 자리(헤더/푸터)만 이미지로 교체
- `first-shop/img`의 `bg_1.png`, `hero_human.png`는 아직 미사용(사용자가 다음에 쓸지 결정 예정)

### 공통 컴포넌트 (`src/components/`) — 14개 완료
Header, Footer, Button, HeroPillButton, Input, Checkbox, ProductCard, CategoryCard, Swatch, SizeSelector, QuantityStepper, CartItemRow, OrderItemRow, **Toast**(상단 중앙 고정, `show`/`onClose`/`duration` props, 표시 후 자동 dismiss)
(Badge는 만들었다가 사용자 요청으로 완전 삭제함 — NEW/SALE 뱃지 기능 자체를 안 쓰기로 함)

### 페이지 — 6/8 완료
- **Home 페이지는 삭제함** (2026-09-03) — 별도 `/` 전용 페이지를 두지 않고 `Men`을 기본 홈으로 사용하기로 변경. `src/pages/Home.jsx`/`Home.css` 삭제, `App.jsx`에서 `<Route path="/" element={<Men />} />`와 `<Route path="/men" element={<Men />} />`가 같은 `Men` 컴포넌트를 렌더링(두 URL 다 유지, `/men`도 그대로 살아있음). `Header.jsx`의 MEN 네비는 `NavLink` 대신 `useLocation`으로 `pathname === '/' || pathname === '/men'`일 때 직접 `is-active` 클래스를 줘서, 루트("/")에 있어도 MEN이 활성 표시되도록 함
- [x] **Men** — Hero(3분할 이미지, 100dvh)+에디토리얼 배너(NEW ARRIVAL 위, Home에 있던 것 재사용)+신상품 8개+카테고리 2개(상의/하의, 기존 3개에서 아우터 제거)
- [x] **Women** — Men과 동일 구조 미러링 (`GenderPage.css` 공유, 에디토리얼 배너 문구만 별도)
- [x] **ProductDetail** — 상세이미지 3장+sticky 정보패널(컬러/사이즈 선택 상태관리, useState)+관련상품 4개(같은 gender 필터)
- [x] **Login** — 이메일/비밀번호. `AuthContext`(`src/context/AuthContext.jsx`)의 `login()`으로 localStorage에 저장된 계정과 대조 → 성공 시 세션 저장 후 `/`로 이동, 실패 시 비밀번호 필드에 에러 표시
- [x] **Signup** — 닉네임/이메일/비밀번호/휴대폰번호. 검증 통과 시 `AuthContext`의 `signup()`으로 localStorage에 계정 저장(이메일 중복 체크) → Toast("회원가입이 완료되었습니다.", 화면 상단) → 1.5초 후 `/login`으로 자동 이동
  - 닉네임: 영문/한글/숫자 2~10자 (`/^[a-zA-Z0-9가-힣]{2,10}$/`)
  - 비밀번호: 영문+숫자 포함 8~16자 (`/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/`)
  - 휴대폰번호: `01`로 시작, 대시(`-`) 있어도/없어도 허용 (`/^01[0-9]-?\d{3,4}-?\d{4}$/`), 에러 메시지는 "휴대폰번호를 정확하게 입력해주세요."
  - Login/Signup 공유 레이아웃은 `src/pages/Auth.css`(중앙 정렬 카드형, 기존 그리드 페이지들과 다른 톤)
- [x] **Cart** — Figma `Cart / Desktop`(`54:170`) + `Cart / Empty`(`54:306`) 두 상태 모두 구현. 목업 데이터는 `src/mock/cart.js`(3개 상품, 상품금액 합계가 Figma 예시와 동일한 ₩187,900이 되도록 가격 맞춤)
  - 상태관리(모두 `useState`, `src/pages/Cart.jsx`): `cartItems`(수량/삭제), `selectedIds`(체크박스 선택) — 전체선택/개별선택/선택삭제/개별삭제/수량 변경 모두 구현, 기존 `CartItemRow`/`Checkbox`/`Button` 컴포넌트 그대로 재사용
  - 주문요약(상품금액/배송비 ₩3,000 고정/총 결제금액)은 **선택된 항목 기준**으로만 합산 — 선택 해제한 상품은 금액에서 빠짐. 선택된 항목이 없으면 배송비도 0원 처리, "주문하기" 버튼 비활성화
  - 장바구니가 비면(`cartItems.length === 0`) Empty 상태로 자동 전환 — 아이콘은 Figma 원본 에셋 대신 `lucide-react`의 `ShoppingBag`로 대체(헤더 장바구니 아이콘과 통일감), "쇼핑하러 가기" 클릭 시 `/`로 이동
  - "주문하기" 클릭 시 `/order`로 이동(Order 페이지 자체는 아직 스텁)
  - Header/Footer는 Figma 익스포트에 포함돼 있었지만 다른 페이지들과 동일하게 `UserLayout`이 전역으로 렌더링하므로 Cart.jsx에는 넣지 않음
  - 15px 텍스트("주문 요약" 타이틀, "총 결제금액" 라벨), 요약 패널 20px 패딩/갭, 360px 너비 등 기존 타이포/스페이싱 토큰에 없는 값은 Figma 원본 그대로 리터럴 px 사용(기존 `CartItemRow` 썸네일 100×120px 리터럴 관례와 동일)
  - 브라우저로 전체선택/개별선택/수량증감/개별삭제/선택삭제→빈 장바구니 전환→"쇼핑하러 가기"/"주문하기" 라우팅까지 전체 흐름 실제 동작 확인 완료

### 로그인 상태 관리 (Supabase 연동 전 임시)
- `src/context/AuthContext.jsx` — `AuthProvider`(App.jsx에서 BrowserRouter 감쌈)가 `localStorage`에 계정 목록(`shop_users`)과 현재 세션(`shop_current_user`)을 저장하는 **완전 목업 인증**. `useAuth()`로 `{ user, signup, login, logout }` 어디서든 접근 가능
- **목적**: Supabase Auth 붙이기 전에 로그인/비로그인 상태별 화면 분기를 테스트하기 위함 (Cart/MyPage 등 이후 페이지 작업 시 필요)
- `Header.jsx`가 `user` 상태를 읽어서 반영: 비로그인 시 사람 아이콘 → `/login`, 로그인 시 사람 아이콘 → `/mypage` + "로그아웃" 텍스트 버튼 노출(클릭 시 로그아웃 후 `/`로 이동)
- 비밀번호는 평문으로 localStorage에 저장됨(순수 프론트 목업이라 허용) — **Supabase 연동 시 이 파일 전체를 실제 Supabase Auth 호출로 교체 예정**, 그때 기존 localStorage 데이터는 폐기됨
- Chrome 브라우저로 회원가입→로그인→헤더 상태 전환→로그아웃 전체 흐름 실제 동작 확인 완료
- [ ] Order, MyPage — 스텁(제목만)
- [ ] 관리자 4종(상품/주문/회원/매출관리) — 스텁, 디자인 자체가 없어서 기능 위주로 심플하게 만들 예정

### 상품 카드 관련 디자인 조정 (사용자 피드백, 여러 차례 수정 거침)
- 기본 상태엔 이미지만, 호버 시에만 이름/가격 오버레이 (Figma 원본과 동일하게 재수정함)
- 상하 카드 간격 0 + 각진 모서리(`border-radius:0`) — 위/아래 카드가 한 세트(상의+하의)로 이어지는 느낌
- 카드 크기는 `height:400px` 고정값 대신 **`aspect-ratio:3/4`** 사용 — 반응형에서 열 개수 바뀌어도 비율 유지됨 (고정 px는 반응형에서 찌그러짐 문제 있었음)
- 히어로 섹션 전체 `height:100dvh`

### 섹션 간격 정리 + 상품 임시 이미지 (2026-09-03)
- `.product-grid`/`.category-grid`(`src/index.css`)에 있던 `padding-bottom: var(--spacing-80)`를 제거함 — 각 `.page-section`은 위쪽 패딩(64px)만 갖고 있어서, 두 패딩이 겹치던 곳(예: Men/Women의 NEW ARRIVAL → SHOP BY CATEGORY)은 144px, 안 겹치던 곳(에디토리얼 배너 → NEW ARRIVAL)은 64px로 섹션마다 간격이 들쭉날쭉했음. 제거 후 모든 섹션 사이 간격이 64px(모바일 32px)로 일정해짐. ProductDetail의 "관련상품" 섹션도 같은 클래스를 써서 자동으로 함께 정리됨
- 위 정리 후 페이지 맨 마지막 섹션(Footer 바로 위, 예: Men/Women의 SHOP BY CATEGORY, ProductDetail의 관련상품)이 Footer와 너무 붙어 보인다는 피드백을 받아서, `.page-section:last-of-type { padding-bottom: var(--spacing-64); }`(모바일은 32px)를 추가함 — 페이지의 마지막 `.page-section`에만 아래쪽 여백을 더해서 어두운 Footer 배경과 자연스럽게 분리되도록 함. 다른 섹션 사이 간격(64px)은 그대로 유지
- `src/mock/products.js`의 16개 상품 전부에 `image` 필드 추가 — Lorem Picsum(`https://picsum.photos/seed/tl-p{id}/600/800`, 상품카드 비율 3:4와 동일)로 상품별 고정 시드를 줘서 새로고침해도 같은 이미지가 나오게 함. 실제 제품 사진이 아니라 UX 확인용 임시 이미지라는 점 명확히 함 — 외부 서비스라 오프라인/네트워크 차단 시 깨질 수 있음, Supabase Storage 연동 시 교체 예정

### 카테고리 정리 + NEW ARRIVAL/더보기/카테고리 필터링 (2026-09-03)
- `products.js`의 카테고리 taxonomy를 상의/하의 2종으로 단순화: 기존 '아우터'는 전부 '상의'로 합침(오버핏 울 코트, 더블브레스티드 자켓, 벨티드 트렌치코트, 숏 울 자켓 등). '신발' 카테고리는 완전히 없앰 — 신발 상품 2개(첼시 부츠 p8, 스퀘어토 로퍼 p16)를 삭제하는 대신 같은 id 자리에 새 임의 상품(치노 팬츠/하이웨이스트 와이드 데님, 둘 다 하의)으로 교체해서 성별당 8개, 상의 4/하의 4 균형 유지
- Men/Women 페이지에 `useSearchParams`로 `?category=` 쿼리를 읽어 상품을 거르는 로직 추가 (`src/pages/Men.jsx`, `Women.jsx`):
  - 쿼리 없음(기본 진입) → "NEW ARRIVAL" 제목, `slice(0, 8)`로 **최대 8개 고정** 미리보기, "더보기 +"가 실제 링크로 동작(`/men?category=all`)
  - `category=all` → "전체 상품" 제목, 해당 성별 상품 전체(캡 없음), 더보기 링크는 숨김
  - `category=상의`/`category=하의` → 그 카테고리 라벨을 제목으로 쓰고 해당 카테고리만 필터링, 더보기 링크 숨김. 결과 없으면 "해당 카테고리에 상품이 없습니다." 표시(현재는 발생 안 함, 안전장치)
  - "SHOP BY CATEGORY" 타일(`src/mock/categories.js`, 기존에 이미 `/men?category=상의`식 링크로 걸려 있었음)은 필터 상태와 무관하게 항상 그대로 노출 — 진입점 역할
  - 새 페이지를 따로 만들지 않고 Men/Women 페이지 하나가 "새 상품 미리보기 / 전체 보기 / 카테고리별 보기" 3가지 상태를 다 처리하는 구조

### 데이터
- 목업만 사용 중: `src/mock/products.js`(16개, gender/category 포함, 임시 Picsum 이미지 포함, 카테고리는 상의/하의 2종), `categories.js`, `productDetail.js`(컬러3/사이즈5/설명)
- Supabase 실제 테이블/Storage/`.env` 키 — **전부 미착수**

### 알아둘 것
- 콘솔에 가끔 뜨는 정체불명 `[EXCEPTION] Object`는 브라우저 자동화 확장 자체의 메시징 노이즈로 확인됨(1건은 "message channel closed" 메시지 포함) — 앱 코드 문제 아님, 매번 페이지는 정상 동작 확인함

---

## 다음 세션 시작 지점
**Cart 완료 이후 Men/Women 페이지 다듬기(로고, 카테고리, 섹션 간격, 임시 이미지, 카테고리 필터링)까지 끝낸 상태. 다음 할 일은 Order 페이지 — 아직 시작 안 함 (사용자의 명시적 "작업해" 대기 중).**
- **먼저 `git push` 여부 확인** — 위 "마지막 갱신"에 적힌 대로 로컬 커밋 2개가 origin에 안 올라가 있음. 사용자가 push해도 된다고 하면 그때 진행.
- Order 노드는 이미 확보돼 있음: 위 "Figma 연동 상태" 섹션의 `64:287`(section, 이름 없음) → 프레임 `64:288` "Order / Desktop". `get_design_context(fileKey: lX1aiEVIERPEOuWTV3kmmq, nodeId: "64:288")`로 바로 가져올 수 있음.
- Order 화면 구성(메타데이터로 이미 확인됨): 배송지 정보(이름/연락처/주소 + "변경" 버튼), 주문상품(`Order Item Row` 2개 — 기존 `OrderItemRow` 컴포넌트 재사용), 결제금액 패널(상품금액/배송비/총 결제금액 + 약관동의 체크박스 + 결제 버튼). Cart와 레이아웃 패턴(좌측 리스트 856px + 우측 요약 360px, gap-64)이 거의 동일해서 `Cart.jsx`/`Cart.css` 참고하면 빠름.
- Cart에서 넘어온 선택 상품을 Order에 전달하는 흐름은 아직 미정 — 지금은 각 페이지가 독립된 mock 데이터를 쓰고 있어서(Cart는 `src/mock/cart.js`), Order도 일단 자체 mock으로 만들지, `navigate('/order', { state: ... })`로 선택 항목을 넘길지 사용자와 확인 필요.

## 앞으로 해야 할 것 (전체, 우선순위 순)
1. Order 페이지 (OrderItemRow + 가상결제)
2. MyPage (주문내역, OrderItemRow 재사용)
3. 관리자 4종 (기능 위주, 디자인 없이)
4. Supabase 실연동: 테이블 스키마 설계(profiles/products/cart_items/orders/order_items) → 생성 → Storage 버킷 → 각 페이지 mock을 실제 쿼리로 교체 → `.env` 키 입력(기기마다)
5. Supabase Auth 연결 (이메일/비밀번호), 로그인 상태 기반 라우트 보호. `src/context/AuthContext.jsx`의 localStorage 기반 로직을 실제 `signUp`/`signInWithPassword`/`signOut` 호출로 교체
6. 반응형 정밀 검증 (지금은 1024px 기본 미디어쿼리만 있음, 실기기/개발자도구 미확인)
7. 카테고리 리스팅 페이지(`CategoryListing`) 필터 기능 — 사이즈/가격대 등. 필터 버튼 UI는 없고 상품개수 텍스트만 있는 상태(2026-09-03 작업 시 의도적으로 제외, 사용자 확인)
8. 카테고리 리스팅 페이지 페이지네이션 또는 무한스크롤 — 지금은 목업이 성별당 최대 8개라 필요 없지만, 실제 상품 수 늘어나면 필요
