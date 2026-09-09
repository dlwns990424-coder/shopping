# first-shop 작업 진행 상황

> 이 파일은 집/학원 등 서로 다른 환경(다른 컴퓨터)에서 작업을 이어가기 위한 기록입니다.
> **새 환경에서 작업을 시작할 때는 이 파일부터 읽고 시작할 것.**
> Claude는 작업을 진행할 때마다(파일 생성/수정, 설계 결정 등 실질적 진행이 있을 때) 이 파일의
> "완료된 작업 / 다음에 할 작업 / 다음 세션 시작 지점"을 반드시 최신 상태로 갱신한다.
> 이 파일은 항상 **현재 상태 하나만** 반영한다 — 낡은 계획/중복 섹션은 새로 갱신할 때 정리해서 지운다.

---

## 새 환경(다른 컴퓨터)에서 시작하기
1. `git pull`
2. `npm install`
3. **`.env.local` 파일을 프로젝트 루트에 새로 생성해야 함** — `.gitignore` 대상이라 git에는 안 올라감. **(2026-09-08부터 필수로 변경됨)** 예전엔 관리자 상품관리 페이지에만 필요했지만, 이제 공개 페이지(Men/Women/상품상세 등)와 히어로·배너 문구까지 전부 Supabase에서 읽어오므로, **이 파일이 없으면 사이트 전체가 빈 상품 목록/기본 문구만 나오는 사실상 정상 동작하지 않는 상태**가 됨:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
   값은 [Supabase 대시보드](https://supabase.com/dashboard/project/nkwofckgxfgsusgqabme) → Settings → API에서 Project URL / anon public key 복사(`service_role` 키는 절대 사용하지 않음)
   **주의**: Vite 개발서버는 `.env`/`.env.local` 둘 다 자동으로 읽지만(`npm run dev`만 할 거면 `.env`도 무방), `scripts/seed-*.ts`(시딩 스크립트)는 파일명을 `.env.local`로 직접 지정해서 읽기 때문에 **시딩 스크립트를 돌릴 일이 있으면 반드시 `.env.local`이라는 이름으로 만들어야 함**
4. `npm run dev`로 로컬 서버 실행
5. **테스트 계정 — 2026-09-09부터 Supabase Auth 실계정으로 전환됨** (더 이상 localStorage 자동생성 아님, 실제 DB에 존재하는 계정): 일반 `test@test.com`(비밀번호는 사용자 본인 계정이라 기록 안 함), 관리자 `admin@test.com` / `admin1234`. 같은 Supabase 프로젝트를 쓰는 한 새 컴퓨터에서도 그대로 로그인 가능(계정이 서버에 있어서 로컬 설정 불필요) — `.env.local`만 있으면 됨

## 마지막 갱신
- 날짜: 2026-09-09 (같은 날 아홉 번째 세션)
- **이번 세션 요약 — 사용자/관리자 UIUX 전면 점검 + 상품 상세페이지 모바일 정보 배치 개선**:
  1. **점검 방법**: 이 환경은 실제 창 리사이즈가 뷰포트에 반영 안 되는 한계가 있어서, `public/` 아래 임시 HTML에 390×844 `<iframe>`을 심어 진짜 모바일 브레이크포인트를 재현하는 방식으로 처음 정밀 검증(점검 후 파일 삭제, git에는 안 남음). 사용자 페이지(홈/카테고리목록/상세/장바구니/헤더 햄버거메뉴/검색/로그인/회원가입/마이페이지)와 관리자 페이지(대시보드/상품/주문/회원/매출/콘텐츠관리) 전부 열어봄
  2. **발견 후 바로 고친 것 — 상품 상세페이지 모바일 정보 배치**: 모바일이 `grid-cols-1`이라 이미지 전체를 다 지나야 상품명/가격/사이즈가 나오던 문제. `ProductDetail.tsx`를 모바일 전용 블록(`lg:hidden`: 첫 이미지→구매정보→나머지 이미지→설명)과 데스크톱 전용 블록(`hidden lg:grid`: 기존 2단 배치 그대로 이동, 변경 없음)으로 분리. 상품명/가격/찜/컬러/사이즈는 `purchaseEssentials` 변수로 한 번만 작성해서 두 블록이 공유(중복 작성 방지, `selectedSize` 등 state도 자동으로 동기화됨)
  3. **검증**: 모바일에서 사이즈 선택→하단 고정 "장바구니 담기" 클릭까지 실제로 localStorage 장바구니에 정확한 옵션(색상·사이즈·가격)으로 담기는 것 확인, 사이즈 미선택 시 에러 문구가 이제 스크롤 없이 바로 보이는 위치에 뜨는 것도 확인(부수적으로 개선됨). 이미지 1장짜리/2장짜리 상품 둘 다, 데스크톱/모바일 둘 다 확인. 데스크톱은 기존과 완전히 동일(2열 페어링, sticky 정보 컬럼, 콘솔 에러 0건). `npx tsc -b`/`npm run lint` 신규 에러 0건
  4. **점검에서 추가로 찾은 것(내일 작업 예정, 이번엔 안 고침)**: 홈 이벤트배너 4개 중 2개(데님 컬렉션·셔츠&블라우스) 이미지 미입력 / MEN 히어로 등 모바일 이미지 미입력(기존에 이미 알려진 항목) / 관리자 "추가 가능한 상품" 목록에 테스트 데이터("상품 추가 테스트") 노출 — 전부 콘텐츠 정리 성격이라 코드 수정 불필요
- **이번 세션 요약 — 상품관리 수정 폼 위치를 해당 행 바로 아래로 변경**: 기존엔 "수정" 클릭 시 폼이 항상 테이블 맨 위에 떠서, 목록 아래쪽 상품을 수정할 때 화면을 위로 스크롤해야 하는 불편이 있었음. `OrderManage.tsx`의 "행 클릭 시 바로 아래에 펼치기" 패턴(`Fragment`+조건부 `<tr>`)을 재사용:
  - 거대한 폼 JSX를 `editFormElement` 변수로 추출(내용 변경 없음)
  - **상품 추가**(신규): `editingId === null`일 때만 기존처럼 테이블 위쪽에 표시(특정 행과 무관한 동작이라 위치 유지)
  - **상품 수정**: 테이블 행 렌더링을 `Fragment`로 감싸고, `editingId === product.id`인 행 바로 다음에 `colSpan={8}` 행으로 폼을 삽입(`OrderManage.tsx` 확장 행과 동일한 `bg-surface-muted`+안쪽 `bg-surface` 카드 스타일)
  - 드래그 정렬 기능과 충돌 없음(폼 행에는 드래그 핸들러가 없어 그냥 지나쳐지는 행)
  - **검증**: 목록 맨 아래 상품 수정 → 그 행 바로 아래에 폼 생성 확인, 다른 행 수정 클릭 → 폼이 새 행으로 이동 확인, 취소 시 정상 닫힘, "상품 추가"는 여전히 상단에 뜨는 것 확인. `npx tsc -b`/`npm run lint` 신규 에러 0건
- **이번 세션 요약 — 여성 상품 상세페이지에 "옷만 나온 사진" 추가**: 상세페이지(`ProductDetail.tsx`)는 `image`(기본)+`detail_images`만 렌더링하고 `hover_image`는 안 씀 — 그런데 여성 상품 30개 전부 `image`엔 모델 착용컷만 있고 `detail_images`는 빈 배열이라, 상세페이지엔 라이프스타일 사진 1장만 뜨고 옷 자체를 깔끔하게 보여주는 사진이 전혀 없었음(사용자가 "hover 이미지 느낌의 사진 하나뿐"이라고 지적). 다행히 그 사진은 이미 `hover_image`(목록 카드 호버용)에 존재해서 새로 만들 필요 없이 재사용:
  - Supabase `products` 30개 행(관리자가 테스트로 추가한 1개 제외) `detail_images = [hover_image]`로 일괄 UPDATE(관리자 세션 브라우저 콘솔에서 직접 실행, 스키마 변경 아니라 SQL 파일 안 만듦)
  - `src/mock/products.ts`의 변환 로직(`detailImages: []` 고정 → `product.hoverImage ? [product.hoverImage] : []`)도 동일하게 수정해서 재시딩해도 안 어긋나게 함(men은 hoverImage 자체가 없어서 영향 없음)
  - 결과: 상세페이지에 **착용컷+옷 사진 2장**이 뜨고, 지난 세션에 만든 "PC 2열 배치"와 자연스럽게 맞물려 나란히 보임
  - **검증**: 코트/니트/후드(jpg 확장자 포함) 등 카테고리별로 상세페이지 실제 확인, 목록 페이지 카드 hover 동작은 기존과 동일(영향 없음) 확인. `npx tsc -b`/`npm run lint` 신규 에러 0건
- **이번 세션 요약 — 사이트 전체 코드 점검(직전 세션) 결과 중 1·2·4·5번 수정**:
  1. **주문(orders)을 Supabase로 이전** — `scripts/sql/012_orders_table.sql` 신규(테이블+`profiles`와 동일한 `is_admin()` 기반 RLS: 본인 또는 관리자만 select/insert/update, delete 정책 없음 — UI에 삭제 기능 자체가 없어서). `OrderHistoryContext.tsx` 전면 재작성(외부 인터페이스는 그대로 유지, 내부만 Supabase 호출로 교체 + `loading`/`error` 추가) — 덕분에 `OrderManage.tsx`/`SalesManage.tsx`/`MemberManage.tsx`/`Dashboard.tsx`(전부 읽기 전용 소비자)는 코드 변경 없이 그대로 작동. `Order.tsx` 결제를 async로 바꿔서 `addOrder` 실패 시 "결제됐다고 나왔는데 주문이 안 남는" 상황 방지. `OrderHistory.tsx`(마이페이지)/`OrderManage.tsx`에 로딩·에러 표시 추가
  2. **장바구니·위시리스트를 로그인 계정별로 분리** — 기존엔 `shop_cart`/`shop_wishlist`라는 전역 키라 같은 브라우저를 여러 계정이 쓰면 서로의 데이터가 그대로 보였음(로그아웃해도 안 지워짐). `CartContext.tsx`는 `shop_cart:{userId}`로(장바구니는 로그인해야만 담을 수 있어 게스트 버킷 불필요), `WishlistContext.tsx`는 `shop_wishlist:{userId}`+게스트 버킷(`shop_wishlist:guest`) 분리, 로그인 시점에 게스트 버킷 내용을 계정 버킷에 병합 후 게스트 버킷 비움(비로그인 때 찜한 게 로그인하면 사라지는 회귀 방지)
  3. **할인가 검증** — `ProductManage.tsx`에서 할인가가 정가 이상이면 저장 자체를 막고 에러 문구 표시(기존엔 검증 없이 그대로 저장/노출됐음)
  4. **카테고리 목록 중복 제거** — `ProductManage.tsx`가 갖고 있던 자체 카테고리/서브카테고리 상수를 지우고 `src/constants/categoryFilters.ts`(지난 세션에 만든 공유 파일)에서 import(`PRODUCT_CATEGORIES` 신규 export 추가)
  5. **검증**: 신규 테스트 계정(`checkcustomer1@test.com`)으로 실제 결제까지 진행 → **관리자 계정(별도 로그인)에서 그 주문이 정확히 보임**(핵심 — 기기/계정 간 주문 공유 확인) → 배송상태 변경이 새로고침 후에도 유지 → admin의 장바구니/위시리스트엔 customer 데이터가 전혀 안 보임(계정 격리) → 비로그인 상태에서 찜한 상품이 로그인 후 계정 위시리스트에 정확히 병합됨(게스트 버킷은 병합 후 비워짐) → 할인가를 정가보다 높게 입력하면 에러로 저장 차단 확인. 테스트 계정/주문 정리 완료(계정 완전삭제, 주문은 삭제 UI/RLS delete 정책이 없어 "취소" 상태로 정리해 매출 집계에서 제외). `npx tsc -b`/`npm run lint` 신규 에러 0건
  6. **디버깅 중 알아둘 것(앱 버그 아님)**: 검증 도중 로그인 세션이 새로고침 후 사라지는 것처럼 보인 적이 있었는데, 원인은 이 브라우저 자동화 세션에서 콘솔로 `signInWithPassword`/`signOut`을 반복적으로 직접 호출하며 생긴 일시적 꼬임이었음(새 탭에서 깨끗하게 로그인하니 정상적으로 세션이 저장·복원됨) — 실제 앱 코드 문제 아님, 재확인 완료. 또한 `computer` 클릭 도구가 텍스트 전용 버튼(모달의 확인/취소, 로그인 버튼 등)에서 간헐적으로 이벤트를 놓치는 현상도 재확인(기존에 이미 알려진 이 자동화 도구 한계, `.z-modal` 등 정확한 selector로 JS에서 직접 `.click()` 호출하면 항상 정상 동작) — 실사용자 클릭엔 영향 없음
- **남은 것**: 3번(products/site_content/images 버킷 RLS 강화)은 이번엔 범위에서 제외, 다음 우선순위. `주문 완전 삭제 UI`는 필요성 낮다고 판단해 만들지 않음(테스트 데이터는 "취소" 처리로 충분)
- **상품 상세페이지 이미지 갤러리 2열 배치**: `ProductDetail.tsx`의 이미지 목록(`product.image` + `detailImages`)이 PC에서 1열로 세로 나열되던 걸 2열 그리드로 변경(`flex flex-col` → `grid grid-cols-1 lg:grid-cols-2`, 모바일은 기존 1열 유지, 이미지 홀수 개면 마지막 1장은 왼쪽 칸만 채움 — 사용자 확인 후 결정). 브라우저로 실제 상품(오버핏 울 코트, 이미지 3장)에서 2열 배치+홀수 처리 확인. `tsc`/`lint` 신규 에러 0건
- **이번 세션 요약 — 홈 이벤트배너를 관리자 페이지에서 순서/링크 대상까지 편집 가능하게 개선**: 기존엔 라벨/이미지만 Supabase로 관리되고 순서·클릭 시 이동 경로(`to`)는 `Home.tsx` 코드에 하드코딩돼 있어 시즌마다 이벤트가 바뀔 때 코드 수정이 필요했던 문제 해결. "링크 URL 직접 입력"이 아니라 `CategoryListing.tsx`가 쓰는 성별/카테고리/서브카테고리 체계를 그대로 드롭다운으로 골라 URL이 자동 조립되는 방식으로 설계.
  1. `CategoryListing.tsx`의 `TABS`/`SUB_CATEGORIES` 상수를 `src/constants/categoryFilters.ts`로 추출(양쪽에서 재사용, 값 변경 없음)
  2. `scripts/sql/011_event_banner_link_target.sql` — 배너 4개 각각에 `.gender`/`.category`/`.sub`/`.order` row 신규 추가(기존 하드코딩 값과 동일하게 시딩). `scripts/seed-content.ts`에도 동일 반영. **사용자가 Supabase SQL Editor에서 실행 완료**
  3. `src/admin/components/EventBannerManager.tsx` 신규 — `FeaturedCarouselManager.tsx`의 드래그 재정렬 패턴(로컬 order id배열 + 드래그 종료 시 실제 순서값 일괄 반영, 예전에 "화면만 바뀌고 순서값 저장이 스킵되던" 버그를 겪었던 방식과 동일하게 재발 방지) 그대로 재사용. 배너 카드마다 드래그핸들+썸네일(클릭 시 기존 `ImageCropModal` 2:3 크롭 재사용)+라벨 인라인수정+성별/카테고리/서브카테고리 select(변경 즉시 저장) 구성
  4. `ContentManage.tsx` — `event_banner` 섹션의 범용 row 렌더링(라벨/이미지 개별 카드) 제외하고 `<EventBannerManager />`로 대체, "메인 캐러셀 상품" 옆에 배치
  5. `Home.tsx` — `EVENT_BANNERS` 배열의 `label`/`to` 하드코딩 제거, id 4개만 남기고 `content`에서 순서/필터값을 읽어 정렬 + `eventBannerUrl()`로 URL 조립
  6. **검증**: 브라우저로 (a) 관리자 페이지에 SQL 시딩값 그대로 4개 카드 정상 렌더링 (b) 서브카테고리 select 변경→새로고침해도 저장 유지 (c) 홈에서 해당 배너 클릭 시 실제로 `/men?category=아우터&sub=코트`로 이동해 정확히 필터링된 상품만 노출 (d) HTML5 DragEvent를 JS로 직접 dispatch해서 드래그 재정렬 재현(이 자동화 도구의 알려진 한계로 실제 마우스 드래그 대신 사용, PROGRESS.md 기존 기록과 동일한 방식)→새로고침 후에도 순서 유지→홈 화면에도 반영 확인. 테스트로 바꾼 값은 전부 원래대로 복구. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건(기존과 동일한 `set-state-in-effect` 패턴 1건 추가뿐)
- **이번 세션(짧은 세션) 요약**: 다른 컴퓨터에서 이어받아 `git pull`+`npm install`+`.env` 재설정(URL/anon key 채움, 이전엔 빈 값이라 앱이 아예 안 떴음)으로 개발 서버 정상화. 이후 `CategoryListing.tsx`에 **"더보기" 버튼형 페이지네이션** 신규 추가(자동 무한스크롤 대신 클릭형으로 결정 — 구현 단순, 로딩 타이밍 사용자 통제 목적) — `PRODUCTS_PER_PAGE=12`, `visibleCount` state로 누적 표시, 카테고리/서브카테고리/사이즈/정렬/검색어/성별 중 하나라도 바뀌면 12개로 리셋되는 `useEffect` 추가. `MemberManage.tsx`의 페이지 크기 상수 패턴을 참고해 통일감 유지. 브라우저로 (a) 12개 단위로 버튼 눌러야 추가 노출 (b) 전체 다 보이면 버튼 사라짐 (c) 필터 변경 시 12개로 리셋 확인까지 완료. `npx tsc -b` 에러 0건, `npm run lint` 신규 경고 0건(기존과 동일한 `set-state-in-effect` 패턴 1건 추가뿐). **아래 "앞으로 해야 할 것" 8번(카테고리 리스팅 페이지네이션/무한스크롤) 항목 완료 처리.**
- **git 상태: Supabase Auth 전환(커밋 `980a560`)까지 커밋 완료. 이번 세션(반응형 UX + 이미지 크롭 기능) 작업분은 이 갱신 직후 커밋+push 예정** — 다음 세션 시작 지점 참고
- **이번 세션(반응형 UX 점검 + 반응형 이미지 크롭 기능) 요약**:
  1. **사용자 페이지 반응형 점검** — Home/Header/CategoryListing은 이미 정상이었고, `ProductCarousel.tsx`(Men/Women 상단 캐러셀)가 모바일에서도 4개 고정폭이라 카드가 지나치게 작아지는 문제 발견 → 모바일 2.2개(45%)/태블릿 3개(33%)/PC 4개(25%)로 반응형 처리, embla 옵션에 `containScroll:'trimSnaps'`(끝 여백 정리) 추가
  2. **캐러셀 스와이프 조작감 개선(사용자 실사용 피드백 반영)** — `touch-pan-y`(세로 스크롤과 제스처 충돌 방지) 추가. 이후 "많이 드래그해도 한 칸만 이동한다"는 피드백을 embla 소스코드(`allowedForce` 함수) 분석으로 원인 확인 — `skipSnaps: true` 없으면 드래그 거리/속도와 무관하게 항상 딱 1칸만 이동하는 게 기본 동작이었음. `skipSnaps: true` 추가로 해결, 사용자 확인 완료("자연스럽다")
  3. **관리자 페이지 반응형 — `AdminLayout.tsx`** — `w-240` 고정 사이드바가 모바일에서 화면의 60% 이상을 차지해 전 관리자 페이지가 사실상 사용 불가였던 문제 발견. `lg:` 미만에서 사이드바를 오프캔버스(슬라이드인 + 배경 오버레이)로 전환, `lg:` 이상은 기존과 동일
  4. **`Header.tsx` 모바일 햄버거 메뉴 신규** — `md:` 미만에서 검색/찜/장바구니/마이페이지 아이콘 4개를 햄버거 1개로 축약, 클릭 시 드롭다운 목록(아이콘+라벨). 검색 선택 시 기존 `SearchOverlay` 그대로 재사용. 사용자 피드백으로 목록 구분선 제거, `SearchOverlay`에 명시적 닫기(X) 버튼 추가(모바일에서 배경 클릭 외엔 닫을 방법이 불명확했던 문제)
  5. **모바일 터치/클릭 UX 리서치 기반 전면 보강** — 다른 커머스 사이트(무신사/29CM/Zara/Uniqlo 등) 리서치 후 6가지 적용: ① hover는 이미 `lg:group-hover:` 등으로 데스크톱 전용 처리돼 있어 손 안 댐 ② `-webkit-tap-highlight-color:transparent` ③ `:active` 눌림 피드백(`Button`/`IconButton`/`ProductCard` 찜버튼/`CategoryCard`/`SizeSelector`/`CategoryListing`/`MyPageNav`) ④ 터치 타겟 최소 44px(헤더 `IconButton` 32→44px, 찜버튼 32→40px) ⑤ `touch-action: manipulation`(더블탭 확대/클릭 지연 방지) ⑥ `user-select: none` — ②⑤⑥은 `index.css` 전역 `button, a, [role="button"]` 셀렉터 한 곳에서 처리. 전부 사용자 페이지 공용 컴포넌트 대상, 관리자 페이지는 데스크톱 중심이라 제외
  6. **콘텐츠 관리 — 반응형 이미지 크롭 기능 신규(가장 큰 작업)** — "카카오톡 프로필 사진처럼 보여질 영역을 직접 정할 수 있게" 요청으로 시작. 코드(`h-screen`/`h-[60vh]`/`grid-cols-2` 등)를 실제로 뜯어서 각 배너 섹션이 화면 크기에 따라 실제로 어떤 비율로 잘리는지 정밀 계산(hero/men_banner/women_banner는 데스크톱↔모바일 비율 차이가 극단적이라 하나의 크롭으로 해결 불가 확인) → 반응형 섹션(hero, men_banner, women_banner)은 이미지를 **모바일용/데스크톱용 2장**으로 분리(`_mobile`/`_desktop` 접미사), `lg`(1024px) 기준 분기. event_banner는 `aspect-[2/3]` 고정이라 1장 그대로.
     - `scripts/sql/006_responsive_content_images.sql` — 기존 `.image` 값을 유지한 채 `_desktop`으로 이름 변경 + `_mobile` 빈 값 신규 추가. **사용자가 Supabase SQL Editor에서 이미 실행 완료.**
     - `react-easy-crop` 신규 의존성 추가, `src/components/ImageCropModal.tsx`(드래그 이동+확대축소 슬라이더+고정비율 프레임) + `src/utils/cropImage.ts`(canvas로 실제 크롭해서 Blob 생성) 신규
     - `ContentManage.tsx`: 파일 선택 시 바로 업로드하지 않고 크롭 모달을 거치도록 변경, 섹션별 목표 비율 매핑(`hero` 데스크톱 16:9/모바일 9:19.5, `men_banner`·`women_banner` 데스크톱 4:5/모바일 9:19.5, `event_banner` 2:3 고정)
     - `Home.tsx`/`Men.tsx`/`Women.tsx`: 반응형 섹션을 `hidden lg:block`(데스크톱용)/`lg:hidden`(모바일용) 2개 div로 분리 렌더링, 모바일 이미지가 비어있으면 데스크톱 이미지로 자동 폴백(마이그레이션 직후 과도기 대응)
     - **버그 발견+수정**: SQL 미실행 상태에서 `aspectForKey()`가 `_mobile`/`_desktop` 접미사 없는 키를 전부 이벤트배너용 고정비율(2:3)로 취급해버려서, 히어로처럼 가로로 넓어야 할 이미지에 세로형 크롭 프레임이 뜨는 버그를 사용자가 실사용 중 발견. `hero`/`men_banner`/`women_banner` 섹션인데 접미사가 없으면 `aspectForKey`가 `null`을 반환하도록 고치고, 업로드 버튼 대신 "마이그레이션 확인 필요" 경고를 보여주는 방어 로직 추가(향후 비슷한 상태 실수를 조용히 넘기지 않도록)
     - **검증**: 브라우저로 이벤트배너 이미지 실제 업로드→크롭→적용→저장까지 전체 플로우 확인, home 히어로 모바일/데스크톱 슬롯 분리 확인, 각각 올바른 비율(세로/가로) 크롭 프레임이 뜨는지 실제 파일 업로드로 확인
  7. **(같은 세션, 후속) 크롭 모달에 안전영역(safe-zone) 가이드 추가** — hero/배너는 기기마다 실제로 잘리는 비율이 달라 목표 비율 숫자를 아무리 맞춰도 어긋난다는 근본 한계가 있음(아래 9번 실사례 참고). "완벽한 숫자를 쫓기보다 방송/인쇄 업계의 title-safe 개념처럼 안전영역을 보여주자"로 방향 결정 → `ImageCropModal.tsx`에 크롭 프레임 안쪽에 점선 안전영역 박스(프레임의 70% 크기, 중앙 정렬, `onCropSizeChange`로 실제 크롭박스 크기 받아와 계산) + 안내 문구 추가
  8. **(같은 세션, 후속) 메인 캐러셀 상품 순서 변경이 전혀 안 되는 버그 발견+수정** — 사용자가 콘텐츠 관리에서 드래그해도 순서가 안 바뀐다고 보고. 원인은 `FeaturedCarouselManager.tsx`: 화면에 보여주는 `featured` 목록이 렌더마다 `featured_order` 기준으로 다시 정렬되는데, 드래그 중엔 `products` 배열의 원소 위치만 바꾸고 `featured_order` 값 자체는 안 바꿔서 다음 렌더에서 항상 원래 순서로 되돌아가던 것 — 그 결과 `handleDragEnd`가 계산하는 "바뀐 부분"이 매번 0건이라 저장 자체가 조용히 스킵되고 있었음. 표시 순서를 담당하는 `order`(id 배열) state를 신규로 두고 드래그 시 이 배열을 직접 재배치하도록 리팩터링. **검증**: 브라우저에서 HTML5 DragEvent를 직접 dispatch해서 재현(react state 커밋 타이밍 때문에 dragstart→dragenter→dragend 사이에 각각 딜레이가 필요했음), DB에 실제로 새 `featured_order` 값이 저장되는 것까지 확인 후 테스트로 바꾼 순서는 원래대로 복구
  9. **(같은 세션, 후속) 모델 착용 이미지를 상품 hover에 연결 — 실수 1회 발견+정정**: 처음에 `src/mock/products.ts`만 고쳤는데 반영이 안 됨 → 실제 공개 페이지는 `ProductsContext.tsx`를 통해 **Supabase `products` 테이블**에서 읽어오고(`mock/products.ts`는 `scripts/seed-products.ts` 재시딩용으로만 쓰이는 경로), DB엔 이미 `hover_image` 컬럼이 있었음. Supabase `products.hover_image`에 직접 UPDATE(women 코트/셔츠/니트/데님 총 13개 상품)하는 방식으로 다시 작업, mock 파일도 재시딩 일관성을 위해 그대로 유지. 사용자 피드백으로 hover 전환 애니메이션(`transition-opacity duration-300`)도 제거해서 즉시 전환되게 함
  10. **(같은 세션, 후속) 상품 이미지 `bg-contain` → `bg-cover` 전면 교체** — "이미지가 꽉 안 차고 여백이 보인다"는 지적으로 전체 이미지 파일의 실제 픽셀 비율을 다 재보고 확인: 기본 상품컷(남녀 전체)은 전부 정확히 3:4라 문제없었지만, **모델 착용컷은 파일마다 비율이 제각각(0.667~0.971)**이고 상세페이지(4:5 컨테이너 vs 실제 3:4 사진)·검색 미리보기(정사각형 박스)도 비율이 안 맞아서 레터박스 여백이 생기고 있었음. `ProductCard.tsx`(기본+hover 이미지)/`ProductDetail.tsx`/`SearchOverlay.tsx` 4곳을 `bg-cover`로 교체, 브라우저로 카드·상세페이지 재확인
  11. **작업 중 겪은 실수 — Storage 파일 비파괴 업로드 방식 덕에 복구 성공**: hero 크롭 비율을 실제 브라우저 뷰포트로 재현 검증하다가 실수로 실제 운영 중이던 `home.hero.image_desktop`을 테스트 이미지로 덮어씀. 업로드 함수(`uploadImage`)가 기존 파일을 지우지 않고 항상 새 파일만 추가하는 구조라 Supabase Storage에 원본이 그대로 남아있었고, 파일 목록을 시간순으로 조회해서 원본 URL을 찾아 즉시 복구함 — 이런 사고가 나도 Storage에서 이전 파일을 찾아 복구할 수 있다는 걸 확인해둠
  12. **다음 세션에서 이어할 것**: `home.men_banner`/`home.women_banner`/`men.hero`/`women.hero`의 모바일용 이미지는 아직 비어있음(데스크톱 이미지로 자동 폴백 중) — 관리자가 실제로 모바일용 이미지를 새로 크롭해서 올려야 완전히 마무리됨. `npx tsc --noEmit` 에러 0건 확인 완료
- **Supabase Auth 실연동 완료 — localStorage 가짜 인증 시대 종료** (앞으로 해야 할 것 1순위였던 작업). 이 항목이 이번 세션 핵심:
  1. **DB 준비**(`scripts/sql/001~005`, 사용자가 SQL Editor에서 직접 실행) — `public.profiles` 테이블(`id`=`auth.users.id`, `email`/`nickname`/`phone`/`role`/`suspended`/**`deleted_at`(휴지통용 소프트삭제)**/`joined_at`/배송지 4종) + `is_admin()` 헬퍼 함수(RLS 재귀 방지용 `security definer`) + RLS 정책(조회/수정은 본인 또는 관리자, 완전삭제는 관리자만) + **`prevent_self_privilege_escalation` 트리거**(일반 회원이 스스로 role/suspended/deleted_at 못 바꾸게 DB 레벨 이중 방어) + **`handle_new_user` 트리거**(auth.users 가입 시 profiles 자동 생성). Authentication → Providers → Email → "Confirm email"은 배포 전까지 꺼둠(가입 즉시 로그인 가능)
  2. **SQL 실행 트러블슈팅(중요, 재발 방지용 기록)**: 채팅창 코드블록에서 복사→붙여넣기 했을 때 서식이 같이 딸려와 `$$` 구분자나 키워드가 깨지는 문제를 두 번 겪음(`text`가 "텍스트"로 번역되어 붙거나, 세미콜론이 씹혀 다음 statement와 합쳐짐). **이후로는 항상 SQL을 실제 `.sql` 파일로 저장해서 "메모장으로 열어서 복사"하는 방식으로 전환**(채팅에서 직접 복사 금지) — 이후로는 문제없이 실행됨. 다음에 SQL 작업 시에도 이 방식 유지할 것
  3. **트리거 버그 발견+수정**: SQL Editor에서 `admin@test.com`을 관리자로 승격하는 UPDATE를 실행했는데 반영이 안 됨 — 원인은 SQL Editor엔 로그인 세션이 없어서 `auth.uid()`가 null이 되고 `is_admin()`이 항상 거짓으로 나와서, "일반 회원의 자기 권한 변경을 막는" 트리거가 SQL Editor의 정상적인 관리자 작업까지 막아버렸음. `prevent_self_privilege_escalation`에 `auth.uid() is not null and not is_admin()` 조건으로 수정(로그인 세션이 아예 없는 서버/SQL 컨텍스트는 트리거 통과, 로그인한 일반 사용자가 앱으로 시도하는 경우만 차단)
  4. **`AuthContext.tsx` 전면 재작성** — `supabase.auth.signUp/signInWithPassword/signOut` + `onAuthStateChange` 구독(세션 복원·토큰 갱신 자동 처리, 예전에 직접 만들었던 `storage` 이벤트 리스너 수동 동기화 로직 불필요해짐). `loading` 상태 추가(세션 복원이 비동기라서). **회원관리 전용 함수(`listUsers`/`setUserRole`/`deleteUser`/`updateMemberInfo`/`setUserSuspended`)는 여기서 전부 제거** — `ProductManage.tsx`가 이미 쓰던 "관리자 페이지가 Supabase를 직접 조회/수정" 패턴으로 통일해서 `MemberManage.tsx`로 옮김
  5. **영어 에러 메시지 노출 버그 발견+수정** — 사용자가 "가입할 때 영어로 에러 뜨는 거 아닌지 확인해보자"고 지적, 실제로 `signup()`이 Supabase의 원본 영어 에러(`error.message`)를 그대로 화면에 보여주고 있었음(레이트리밋 때 "email rate limit exceeded" 그대로 노출됨). `translateAuthError()` 함수 신규 — `error.code` 기준으로 알려진 코드는 한글로 매핑(이미 가입됨/이메일 형식 오류/요청 과다/약한 비밀번호/잘못된 자격증명), 모르는 코드는 원문 대신 "일시적인 오류가 발생했습니다" 같은 안전한 일반 문구로 대체
  6. **`RequireAuth`/`RequireAdmin`에 `loading` 처리 추가** — 세션 복원 전에 리다이렉트해버리면 로그인된 사용자도 새로고침 시 잠깈 튕겨나가므로, loading 중엔 `null` 렌더링 후 대기
  7. **`MemberManage.tsx` — Supabase 직접 연동 + 휴지통(소프트 삭제) 신규**: `profiles` 테이블에서 직접 조회(로컬 state + mutation 후 refetch, `ProductManage.tsx`와 동일 패턴). **"전체 회원"/"휴지통" 탭 신규** — 삭제 버튼은 이제 `deleted_at`에 타임스탬프만 기록하는 소프트 삭제(즉시 목록에서 사라지고 휴지통으로 이동), 휴지통에서 **복구**(즉시 적용) 또는 **완전 삭제**(강한 경고 문구의 확인모달, 진짜 DB row 삭제) 선택 가능. 기존 정렬/검색/페이지네이션/승격확인모달/정지확인모달/정보수정 전부 그대로 유지. 본인 여부 판별을 이메일 대신 `id`(UUID)로 비교하도록 개선
  8. **완전 삭제가 안 되는 진짜 한계는 여전히 남아있음** — `auth.users`는 `service_role` 키 없이는 못 지우므로, "완전 삭제"는 `profiles` row만 지움(로그인 시도해도 프로필이 없어서 즉시 차단되니 실사용엔 문제 없지만, `auth.users`엔 유령 계정이 남음). 이건 애초에 이번 설계(휴지통 도입 논의) 때 사용자와 합의된 트레이드오프
  9. **`Dashboard.tsx`**: `listUsers().length` → `profiles` count 쿼리(`deleted_at is null`)로 교체
  10. **테스트 계정**: `test@test.com`은 이미 사용자 본인이 실제 닉네임("김원식")으로 가입해둔 진짜 계정이었음(건드리지 않음). `admin@test.com`/`admin1234` 신규 가입 후 SQL로 관리자 승격 완료
  11. **`alert`/`confirm`/`prompt` 절대 금지 재확인** — 사용자가 명시적으로 재요청, 이미 `ConfirmModal`로 전부 대체돼 있음을 코드 검색으로 재확인(memory에도 기록)
  12. **검증**: 브라우저로 (a) 회원가입(한글 에러 확인 포함) (b) 로그인 성공/실패(오답 비밀번호 한글 메시지)/정지계정 차단(한글 메시지) (c) 로그아웃 (d) 새로고침 후 세션 유지 (e) `/admin` 접근 제어 (f) 대시보드 회원수 (g) 회원관리: 목록/승격확인모달→적용/강등즉시/정지확인모달→실제 로그인 차단→해제/휴지통 이동→복구 가능한 상태 확인→완전삭제까지 전체 플로우 실제로 확인, 테스트 계정은 전부 정리. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  13. **다음 단계**: RLS를 지금은 `profiles`만 강화했고, `products`/`site_content`/`images` 버킷은 여전히 "전체공개" 상태 — `is_admin()`을 활용해서 마저 강화 필요(배포 전 필수). 본인 비밀번호 변경/찾기 기능도 여전히 없음(마이페이지 쪽 별도 작업)
- **관리자 회원관리(`MemberManage.tsx`) 실제 구현 완료** — 카페24/Shopify 리서치 후 우리 규모에 맞게 간소화해서 반영(등급/마일리지/휴면회원/최근로그인일은 의도적으로 제외, 이유는 아래):
  1. **`User`에 `joinedAt` 필드 신규**(`types.ts`) — 회원가입 시점 ISO 문자열. `AuthContext.signup()`에서 채움, 기존 테스트 계정 2종에도 고정값(`2026-01-01`) 부여
  2. **`AuthContext.tsx`에 관리자 전용 함수 2개 추가** — `setUserRole(email, role)`(다른 회원 권한 변경), `deleteUser(email)`(다른 회원 삭제, **자기 자신 삭제는 막음**). 기존 `updateProfile`은 로그인한 본인 전용이라 관리자가 "남을" 수정/삭제할 수단이 없었음
  3. **`readUsers()`에 방어 로직 추가** — `joinedAt` 필드 도입 이전에 생성된 계정(이 필드 자체가 없음)을 읽을 때 `undefined.slice()`로 크래시하던 문제 발견+수정, `joinedAt: u.joinedAt ?? ''`로 백필. UI에서도 빈 값이면 "-" 표시
  4. **`MemberManage.tsx`**: `OrderManage.tsx`와 동일한 톤의 테이블(닉네임/이메일/휴대폰/가입일/주문 수/누적 구매액/권한 select/삭제). 주문 수·누적 구매액은 `OrderHistoryContext`의 `orders`를 `userEmail` 기준으로 집계(신규 데이터 소스 없이 기존 두 Context 조합). 검색(닉네임/이메일)+권한 필터. 삭제는 `ConfirmModal`(memory 규칙대로 `window.confirm` 안 씀)
  5. **"최근 로그인일"은 의도적으로 제외** — 지금 로그인이 Supabase Auth 전환 예정인 목업이라, Supabase Auth는 `last_sign_in_at`을 기본 제공함. 지금 목업에 직접 구현하면 전환 시 버려지는 코드라 판단. 등급/마일리지/휴면회원 분류도 이 프로젝트 규모엔 과한 기능이라 제외
  6. **검증**: 브라우저 자동화로 (a) 신규 가입 → `joinedAt` 정확히 기록되어 목록에 표시 (b) 권한 변경(일반↔관리자) → localStorage 즉시 반영 (c) 삭제 확인모달 메시지에 대상 회원 정확히 표시 → 확인 클릭 시 정확히 그 회원만 삭제 (d) 본인(로그인 중인 관리자) 행의 삭제 버튼 비활성화까지 전체 플로우 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  7. **알아둘 것(이 환경 한정)**: 이번 검증 중 이 브라우저 자동화 도구의 `computer` 클릭(좌표 기반, ref 기반 둘 다)이 이 페이지의 텍스트 전용 버튼(`삭제`, 패딩 없음)에서 간헐적으로 클릭 이벤트를 놓치는 현상을 겪음(React 상태는 안 바뀌는데 좌표/ref는 올바름) — JS로 직접 `element.click()` 호출하면 항상 정상 동작. 앱 코드 문제 아님, 순수 자동화 툴 한계로 확인(스크린샷 렌더링도 간헐적으로 지연/타임아웃됨). 실사용자 클릭에는 영향 없음
  8. **(같은 세션, 후속 수정) 권한 변경이 화면에 반영 안 되는 버그 발견+수정** — 사용자가 실제로 관리자 계정에서 권한을 바꿔보고 "안 되는 것 같다"고 보고. 원인은 `AuthContext.listUsers()`가 매번 `localStorage`를 직접 읽는 일반 함수라서(React state 아님), 다른 회원의 데이터를 바꿔도 React가 재렌더링 트리거를 못 받는 구조적 문제였음(직전 항목 6번의 "검증 완료"는 매 테스트 사이 `navigate()`로 페이지를 새로고침해서 우연히 최신 데이터로 다시 그려진 것이었고, 실제로는 안 되고 있었음 — 검증 부실). `OrderHistoryContext`의 `orders`가 이미 쓰던 "state로 관리 + 변경 시 setState" 패턴으로 `AuthContext`도 통일: `users`를 `useState`로 전환, `signup`/`updateProfile`/`setUserRole`/`deleteUser` 전부 이 state를 갱신하도록 리팩터링(`persistUsers` 헬퍼로 state 갱신+localStorage 저장 동시 처리)
  9. **회원 행 클릭 시 주문내역 펼치기 추가** — 사용자 제안으로 추가. `OrderManage.tsx`의 "행 클릭 → 아래 펼침" 패턴 그대로 재사용(`Fragment`+`expandedEmail` state), 펼친 영역에 해당 회원의 주문(`orders.filter(userEmail 일치)`) 목록을 주문번호/날짜/상태/금액으로 표시. select/삭제 버튼 클릭은 `stopPropagation`으로 행 펼침과 분리(주문관리와 동일한 처리)
  10. **재검증(이번엔 새로고침 없이)**: (a) 권한 select 변경 → 페이지 이동 없이 "관리자" 필터를 걸어서 변경된 회원이 즉시 필터 결과에서 반영되는지 확인(재렌더링 실제 트리거 확인) (b) 실제 사용자가 관리자 계정으로 넣은 주문 1건이 회원관리 목록에 정확히 집계(1건, ₩69,000)되고, 행 클릭 시 펼침 영역에 해당 주문(`ORD-...`, 날짜, 결제완료, 금액)이 정확히 표시되는지, 다시 클릭하면 접히는지까지 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  11. **작업 방식 관련 피드백**: 사용자가 "앞으로 검증/점검 하라고 하면 코드를 하나하나 확인하면서 꼼꼼하게 점검해"라고 명시적으로 요청함 — 브라우저 클릭 몇 번으로 "확인됨"이라 보고하지 말고, 코드를 실제로 읽고 로직을 추적해서 점검할 것(이번 권한변경 버그를 브라우저 테스트만으로는 놓쳤던 것이 계기)
  12. **(커밋 이후 후속) 관리자 자기 자신 락아웃 버그 발견+수정** — 커밋 직후 사용자가 "갑자기 admin 페이지 안 들어가진다"고 보고. 원인: `deleteUser`는 자기 자신 삭제를 막아뒀는데 `setUserRole`엔 동일한 방어가 없어서, 관리자가 실수로(혹은 방금 고친 기능을 테스트하다가) 본인 행의 권한을 "일반회원"으로 바꾸면 그대로 적용되어 즉시 `/admin` 접근 권한을 잃고, 되돌릴 방법도 없어지는 락아웃 상태였음(실제로 사용자의 `admin@test.com` 계정이 이 상태였음 — localStorage를 직접 확인해서 원인 확정 후 `role`을 `admin`으로 복구해 즉시 접근 복구). **`setUserRole`에 자기 자신 여부 체크 추가**(`deleteUser`와 동일한 가드), `MemberManage.tsx`에서도 본인 행의 권한 select를 `disabled`로 비활성화(삭제 버튼과 동일한 처리). 재검증: 본인 select 비활성화 확인 + 다른 계정 권한 변경은 여전히 정상 동작하는지 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  13. **(같은 세션, 후속) 회원 많아짐/주문 많아짐 대비 — 페이지네이션 + 주문내역 상한 추가** — 사용자가 "회원이 많아졌을 경우와 주문내역이 많아졌을 경우도 고려해야 한다"고 지적. 두 가지 다 손봄:
      - **회원 목록 페이지네이션**: `MEMBERS_PER_PAGE = 20`, 필터링된 결과 기준으로 페이지 분할, 하단에 이전/다음 컨트롤(`totalPages`가 1이면 컨트롤 자체를 숨김). 검색어/권한 필터를 바꾸면 1페이지로 리셋
      - **회원별 주문내역 펼치기 상한**: 최근 `RECENT_ORDERS_LIMIT = 5`건만 표시(주문은 이미 `OrderHistoryContext`에서 최신순으로 앞에 쌓이므로 별도 정렬 불필요). 5건 초과 시 "최근 5건만 표시 중 · 총 N건" 안내 + "전체 주문 보기 →" 링크를 `주문관리`(`/admin/orders?search=이메일`)로 연결
      - **`OrderManage.tsx`에 URL 쿼리 초기값 지원 추가** — 기존 검색창은 그 페이지 안에서 타이핑한 값만 기억하고 URL은 안 읽었음. `useSearchParams()`로 `?search=` 초기값을 읽어와 `useState`의 초기값으로 사용(카테고리 페이지의 `?category=` 패턴과 동일한 방식)해서, 회원관리에서 넘어온 이메일이 자동으로 필터링된 채로 열리게 함
      - **검증**: 더미 회원 25명+더미 주문 7건을 localStorage에 임시로 심어서(테스트 후 원래 데이터로 정확히 복구) (a) 27명 상태에서 "1 / 2" 페이지네이션 노출, "다음" 클릭 시 2페이지 이동 (b) 검색 필터 적용 시 정상 필터링 (c) 주문 7건인 회원을 펼치면 정확히 5건만 보이고 "총 7건" 안내+링크 노출 (d) 링크의 실제 URL(`/admin/orders?search=dummy1%40test.com`)로 이동하면 주문관리 검색창에 이메일이 자동으로 채워지고 7건 전부 표시되는 것까지 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  14. **(같은 세션, 후속) 주문관리/회원관리 select 스타일을 상품관리와 통일** — 사용자가 상품관리(`ProductManage.tsx`)의 "전체 성별" select(브라우저 기본 화살표 대신 `lucide-react`의 `ChevronDown` 아이콘 오버레이)와 비교하며 스크린샷으로 지적. `주문관리`(상태 필터/일괄변경/행별 상태, select 3곳)와 `회원관리`(권한 필터/행별 권한, select 2곳) 전부 동일한 패턴(`relative` 래퍼 + `appearance-none` + 절대배치 `ChevronDown`)으로 교체. 브라우저로 5곳 전부 시각 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  16. **(같은 세션, 후속) 회원관리 "실사용 관점" 점검 후 5개 항목 반영** — 사용자 요청으로 "실제로 쓴다고 생각했을 때 불편한 점" 코드 재점검 후 발견한 6개 항목 중 5개(비밀번호 재설정은 Supabase Auth 전환 시점으로 보류) 반영:
      - **`src/utils/validators.ts` 신규** — `Signup.tsx`에 있던 `NICKNAME_REGEX`/`EMAIL_REGEX`/`PASSWORD_REGEX`/`PHONE_REGEX`를 이 파일로 이전, `Signup.tsx`는 여기서 import(값 변경 없음, 나중에 검증 규칙 재사용할 곳이 늘어날 걸 대비해 중복 방지)
      - **① 관리자 승격 시 확인 절차** — 권한 select에서 일반→관리자로 바꿀 때만 `ConfirmModal` 확인, 관리자→일반(강등)은 기존처럼 즉시 적용(위험한 방향에만 마찰 추가하는 원칙, 지난 락아웃 버그와 같은 이유)
      - **② 휴대폰번호 검색 지원** — 기존 닉네임/이메일 검색에 휴대폰번호 추가. `-` 유무 상관없이 매칭되도록 검색어/저장값 둘 다 숫자만 추출해서 비교(`digitsOnly` 헬퍼)
      - **③ 회원 정보(닉네임/휴대폰) 수정** — 행에 "수정" 버튼(본인 행은 비활성, 본인 정보는 마이페이지에서) → 모달에서 회원가입과 동일한 정규식 검증 후 저장. `AuthContext.updateMemberInfo(email, updates)` 신규(기존 `updateProfile`은 본인 전용이라 그대로 둠)
      - **④ 목록 정렬** — 가입일/주문 수/누적 구매액 열 헤더를 클릭 가능하게 만들어 오름차순/내림차순 토글(`ChevronDown`/`ChevronUp`으로 방향 표시), 정렬 바꾸면 1페이지로 리셋
      - **⑤ 계정 정지** — `User.suspended?: boolean` 신규. `AuthContext.setUserSuspended(email, suspended)` 신규(본인 정지 불가), **`login()`에 정지 계정 체크 추가**(정지 시 "정지된 계정입니다. 고객센터에 문의해주세요."로 로그인 자체 차단). 목록에 "상태" 열(활성/정지됨 표시 + 정지/해제 토글) 추가 — **정지로 바꿀 때만** 확인모달, 해제는 즉시 적용(③번과 같은 원칙)
      - **⑥ 비밀번호 재설정은 보류** — 사용자가 "Supabase 연동할 때쯤 같이 하자"고 결정. 지금 목업 인증 위에 만들어봤자 Auth 전환 시 버려질 코드라는 점에 동의
      - **검증**: 임시 테스트 계정(`checktest@test.com`)으로 (a) 휴대폰번호 검색(대시 없이) 매칭 (b) 가입일 정렬 asc/desc 토글 정확성 (c) 승격 시 확인모달 뜨고 취소 전엔 실제 role 안 바뀜 확인 → 확인 클릭 시 적용 (d) 강등은 모달 없이 즉시 적용 (e) 정지 확인모달 → 확인 후 실제로 그 계정 로그인 시도 시 "정지된 계정입니다" 메시지로 차단 확인 (f) 해제는 즉시 적용 후 재로그인 가능 (g) 정보수정 모달에서 잘못된 닉네임(1자) 시 에러 표시, 올바른 값 저장 시 반영까지 전체 플로우 확인, 테스트 계정은 삭제로 정리. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  17. **(같은 세션, 후속) 재점검에서 발견한 2건 수정 + 근본적 한계 재확인**:
      - **정보수정 모달 Input에 `id` 누락 수정** — 라벨 클릭 시 포커스 이동 안 되던 접근성 디테일 수정(`member-edit-nickname`/`member-edit-phone`)
      - **`RequireAuth`/`RequireAdmin`에 `user.suspended` 체크 추가** + **`AuthContext`에 `storage` 이벤트 리스너 신규**(다른 탭에서 `shop_users`/`shop_current_user`가 바뀌면 현재 탭의 `user`/`users` state도 동기화, 정지 확인되면 자동 로그아웃)
      - **⚠️ 검증 중 발견한 근본적 한계**: 2개 탭(정지 대상 계정 탭 + 관리자 탭)으로 "다른 사람이 정지시켰을 때 실시간 강퇴"를 재현하려 했으나, **localStorage는 탭이 아니라 브라우저/기기 단위로 공유되는 저장소**라는 사실을 재확인 — 관리자가 다른 탭에서 로그인하는 순간 그 세션이 전체 브라우저의 로그인 상태 자체를 바꿔버려서 애초에 "같은 브라우저 안에서 두 계정이 동시에 로그인된 상태"를 만들 수 없었음. 더 근본적으로는, **실제 서비스 시나리오(관리자와 정지 대상이 서로 다른 사람, 서로 다른 기기)에서는 애초에 localStorage가 기기 간 공유되지 않으므로, 정지 조치가 상대방 브라우저에 실시간으로 전파될 방법이 구조적으로 없음** — 이번에 추가한 `storage` 이벤트 리스너는 **같은 사람이 같은 브라우저에서 여러 탭을 열어놓고 테스트/작업할 때의 탭 간 로그인 상태 동기화**에는 유효하지만, "정지된 회원 강제 즉시 로그아웃"이라는 원래 목표는 **이 localStorage 기반 목업 인증 구조에서는 근본적으로 완전히 해결 불가능**하고, Supabase Auth(서버가 세션을 실제로 검증)로 전환해야만 진짜로 해결됨. 지금 수준에서 실질적으로 보장되는 건 "정지된 계정은 다음 로그인 시도부터 확실히 차단된다"까지임
      - 검증: 2개 탭으로 로그인/정지 흐름 실제 재현, 위 한계를 직접 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  18. **(같은 세션, 후속) 회원 수 카운트 + 배송지 노출 + 주문 상세 가독성 개선** — 사용자 요청 3건("총 회원수 표시", "회원 주문내역에 배송지 표시", "누가/어디로 배송인지 잘 보이게") 반영:
      - **`MemberManage.tsx`**: 상단에 "총 N명"(필터 적용된 결과 기준) 표시. 회원별 주문 펼치기 표에 "배송지" 열 추가(받는사람 · 주소)
      - **`OrderManage.tsx` 배송정보 가독성 전면 개선** — 기존엔 회색 작은 글씨로 라벨 없이 "이름 · 전화번호" / "주소"만 나열돼 있어서 뭐가 뭔지 구분이 안 됐음. **"주문자"/"받는 사람"/"배송지"/"배송 요청사항"** 라벨(회색, 작은 글씨) + 값(진한 색, 본문 크기)을 분리한 카드형 2열 그리드로 재구성, 리서치 결과(Shopify 등의 "라벨-값 명확히 분리" 패턴) 반영
      - **주문 상세의 상품 목록에 `max-h-400 overflow-y-auto` 추가** — "한 주문에 상품이 많으면 관리자가 보기 불편하지 않겠냐"는 질문에 리서치(Shopify: 목록엔 개수만 요약, 상세보기에서만 전체 노출 후 스크롤/접기 처리가 일반적)로 답한 뒤 반영. 실제 8개 상품이 든 주문으로 스크롤 동작 확인
      - **CSV 내보내기/다중선택 일괄작업**: 개념 설명만 하고 구현은 안 함(요청받지 않음) — CSV는 목록을 파일로 내보내는 기능, 다중선택 일괄작업은 체크박스로 여러 건을 한번에 처리하는 기능(주문관리엔 이미 있음, 회원관리엔 없음)
      - **배송상태 기능 재확인**: 사용자가 "선택해서 넣기로 하지 않았나" 질문 → 이전 세션(2026-09-06)에 이미 구현되어 있음을 코드로 재확인(결제완료/배송준비/배송중/배송완료/취소, 개별+일괄변경)
      - **검증**: 브라우저로 (a) 회원관리 "총 2명" 표시 (b) 회원 펼치기의 배송지 열 정상 표시·값 정확 (c) 실제 주문(`ORD-1788871082196`, 상품 8개, ₩1,187,000)으로 상세 스크롤 동작 확인 (d) 배송정보 카드의 라벨/값 구분 시각 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  19. **다음 단계**: 매출관리(`SalesManage.tsx`)가 유일하게 남은 완전 스텁 상태(→ 아래 20번에서 착수). 회원관리 항목 중 보류된 "비밀번호 재설정"과, 발견한 "정지 즉시 강퇴" 한계는 Supabase Auth 전환 작업에서 함께 처리 예정
- **매출관리(`SalesManage.tsx`) 실제 구현 완료 — 관리자 5종 전부 스텁 탈출** — 카페24/Shopify 매출 리포트 구조 리서치 후 반영. 우리 데이터로 낼 수 있는 것(주문 기반 매출·주문수·평균 주문금액)과 없는 것(방문자/세션이 없어 전환율 불가, 가짜 결제라 결제수단 구분 불가)을 먼저 구분하고 설계:
  1. **`recharts` 라이브러리 신규 설치** — 일별 매출 막대그래프용(직접 만든 막대그래프 대신 라이브러리 설치를 사용자가 선택)
  2. **`src/utils/orderStats.ts` 신규** — `orderTotal(order)`/`isRevenueOrder(order)`(상태가 '취소'가 아닌 주문만 매출로 인정) 공용 함수. `Dashboard.tsx`가 이걸 쓰도록 교체
  3. **취소 주문 매출 제외 버그 수정** — 기존 `Dashboard.tsx`의 "총 매출"이 취소된 주문 금액까지 그대로 합산하고 있던 걸 매출관리 설계 중 발견+수정. "총 주문 수"는 취소 포함(접수된 주문 건수 자체는 취소도 포함하는 게 맞다고 판단), "매출"만 취소 제외
  4. **`SalesManage.tsx` 구성**: 기간 필터(오늘/이번 주/이번 달/전체) → KPI 카드 4개(총 매출/주문 수/평균 주문금액(AOV)/취소율) → 일별 매출 막대그래프(recharts, 사이트 포인트 컬러 `#45697a`) → 베스트셀러 TOP 5(상품명 기준 판매수량·매출 집계) → 카테고리별 매출 비중(성별+카테고리 조합) → 주문 상태 분포(5단계 건수·비중)
  5. **상품 매칭 방식**: 장바구니 아이템의 `id`가 `상품id-색상-사이즈` 조합이라 상품 id로 역매칭이 불안정 — **상품명(`item.name`) 기준으로 `useProducts()` 상품 목록과 매칭**해서 카테고리/성별을 알아냄(상품이 삭제된 경우 등 매칭 실패 시 "기타"로 분류)
  6. **차트 디자인**: `dataviz` 스킬 가이드 참고 — 단일 시리즈라 범례 없음, 막대 상단만 라운드(4px)+하단은 베이스라인에 붙임, 그리드는 가로선만 옅은 회색, 값은 호버 툴팁으로만(막대마다 라벨 안 붙임). 베스트셀러/카테고리/상태분포는 색상 구분이 필요 없는 단순 비교라 차트 대신 기존 관리자 페이지들과 통일감 있는 표(table) 형태로 유지(불필요한 색상 팔레트 도입 안 함)
  7. **검증**: 브라우저로 실제 주문 데이터(2건, ₩1,256,000)로 KPI/차트/베스트셀러/카테고리/상태분포 전부 정상 렌더링 확인, 기간 필터(오늘) 전환 시 값 정상 재계산 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  8. **(같은 세션, 후속) 다른 관리자 페이지들과 비교 점검 후 5건 수정** — 사용자 요청으로 상품관리/주문관리/회원관리/콘텐츠관리 코드와 패턴을 하나씩 비교한 결과:
      - **로딩 상태 처리 추가** — `useProducts()`의 `loading`을 그동안 안 써서, 상품이 아직 로딩 중일 때 카테고리별 매출이 전부 "기타"로 잘못 표시됐다가 로딩 완료 시 다시 그려지는 깜빡임이 있었음. 다른 페이지들(상품관리/콘텐츠관리/상품상세)과 동일하게 "불러오는 중..." 문구 추가(카테고리별 매출 섹션에만, 그 섹션만 상품 데이터에 의존하므로)
      - **에러 상태 처리 추가** — `useProducts()`의 `error`를 상품관리와 동일한 패턴(`text-point` 빨간 텍스트)으로 표시
      - **테이블 3곳에 `overflow-x-auto` 반응형 래퍼 추가** — 베스트셀러/카테고리별/상태분포 표. 주문관리·회원관리 테이블은 전부 이 래퍼가 있는데 매출관리만 빠져 있었음(좁은 화면에서 찌그러질 수 있었음)
      - **기간 필터를 버튼 그룹 → `<select>`+`ChevronDown`으로 통일** — 다른 모든 필터(권한/주문상태/성별/카테고리)가 이 패턴이라 시각적 일관성 확보
      - **차트 Y축 눈금 포맷 수정** — 기존엔 `값/10000`로 무조건 "만원" 단위 반올림해서, 매출이 몇천원대로 작으면 모든 눈금이 "0만"으로 겹쳐 보일 수 있는 잠재 버그가 있었음. `formatAxisValue()`로 교체(1만원 미만은 원 단위 그대로 콤마 표기)
      - **검증**: 브라우저로 select 정상 동작(오늘 필터 전환), Y축 "0" 정상 표시, `overflow-x-auto` 래퍼 3곳 적용 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  9. **(같은 세션, 후속) 매출관리에 커스텀 날짜 범위 조회 추가** — 사용자 요청으로 프리셋 4개(오늘/이번 주/이번 달/전체) 옆에 **"직접 선택"** 옵션 신규. 선택 시 시작일/종료일 `<input type="date">` 2개가 나타나서 임의 기간 조회 가능(둘 다 `max`를 오늘로 제한해 미래 날짜 선택 방지). 시작일이 종료일보다 늦게 입력되어도(거꾸로) `rangeStart`/`rangeEnd`를 항상 min/max로 재계산해서 안전하게 처리. 기존처럼 이 필터 하나가 KPI/그래프/베스트셀러/카테고리/상태분포 전부의 소스이므로 커스텀 기간을 선택해도 화면 전체가 그대로 연동됨(신규 데이터 흐름 추가 없이 `period === 'custom'` 분기 하나만 추가)
      - **검증**: 브라우저로 (a) 데이터 없는 날짜(어제)만 선택 시 0건/₩0 정상 표시 (b) 실제 주문이 있는 09-01~09-08 범위로 넓히면 2건/₩1,256,000 정확히 재집계 (c) 시작일>종료일로 거꾸로 입력해도 동일하게 정상 집계되는 것까지 확인. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  10. **(같은 세션, 후속) 세션 전체 재점검 후 2건 정리** — 사용자 요청으로 이번 세션에 손댄 회원관리/주문관리/매출관리 코드를 처음부터 다시 훑어봄:
      - **버그 수정: 회원관리 "누적 구매액"이 취소 주문 포함해서 계산되던 문제** — `Dashboard.tsx`/`SalesManage.tsx`에서 세운 "취소 주문은 매출 제외" 정책이 `MemberManage.tsx`의 `statsByEmail` 집계에는 적용 안 돼 있었음. `isRevenueOrder()` 체크 추가(주문 수는 기존처럼 취소 포함 유지, 누적 구매액만 제외)
      - **`orderTotal()` 중복 정리** — `OrderManage.tsx`/`MemberManage.tsx`/`OrderHistory.tsx`(마이페이지)에 각자 있던 로컬 정의를 전부 `src/utils/orderStats.ts`의 공용 함수 import로 교체(`formatPrice()` 중복과 같은 패턴이 되기 전에 이번엔 바로 정리)
      - **검증**: 브라우저로 실제 주문 하나를 "취소"로 바꿔서 회원관리의 "주문 수"는 그대로(2건), "누적 구매액"만 취소분 제외하고 정확히 줄어드는 것 확인(₩1,256,000 → ₩1,187,000) 후 원래 상태로 복구. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  11. **다음 단계**: 관리자 6종(대시보드/상품/주문/회원/콘텐츠/매출) 전부 실제 구현 완료 — 남은 건 Supabase Auth 전환뿐
- **브랜드 리뉴얼: T&L → NOVERA** — 로고 이미지(`public/images/brand/novera-logo-header.png`, 헤더는 원본, 푸터는 `invert` 필터로 흰색 처리), 포인트 컬러 Mineral Blue(`#45697A`, `src/index.css`의 `--color-point*` 3개 값만 바꾸면 전체 반영되는 구조), 사이트 전체 텍스트("T&L"→"NOVERA")·DB 콘텐츠 값·`scripts/seed-content.ts`까지 전부 교체 완료
- **사이트 검색 기능 신규** — 헤더 검색 아이콘 → 실시간 미리보기 오버레이(`SearchOverlay.tsx`, MEN/WOMEN 태그 표시) → "전체 결과 보기"를 누르면 **별도 `/search` 페이지가 아니라 카테고리 리스팅 화면(`CategoryListing.tsx`)으로 이동**해서 검색어가 필터로 적용됨(해외/국내 이커머스 리서치 후 결정한 구조, Zara/29CM 등도 검색을 별도 페이지가 아니라 상품목록 화면의 필터로 처리)
- **`CategoryListing.tsx`를 Men/Women 공용 "상품 탐색" 화면으로 통합 개편**:
  - 검색어(`q`)가 카테고리/사이즈/정렬과 동급 필터로 편입, 검색창 상시 노출 + X(지우기) 버튼(누르면 검색만 해제되고 "전체 상품" 화면으로 복귀)
  - **검색 중일 때만** 성별 필터 칩(전체/MEN/WOMEN)이 나타남 — 평소엔 `/men`·`/women` 경로가 성별을 그대로 결정(기존과 동일), 검색 시에만 두 성별을 넘나들며 볼 수 있음
  - `Men.tsx`/`Women.tsx`는 이제 전체 상품 배열 + `defaultGender`만 넘김(기존엔 미리 필터링된 배열을 넘겼음)
- **상품 사이즈·할인가·진열순서·메인 캐러셀** 신규(이전 세션 항목 참고) 위에 이어서:
  - **상품 이미지 체계 확장** — `image`(대표, 기존) + **`detail_images`(상세페이지 갤러리, 최대 6장, `MAX_DETAIL_IMAGES` 상수)** + **`hover_image`(상품카드 마우스 오버 시 전환, 선택)** 신규. PDP가 대표 이미지 1장을 3번 반복하던 문제 해결(`ProductDetail.tsx`), `ProductCard.tsx`는 `hoverImage` 있을 때만 크로스페이드
  - 상품관리(`ProductManage.tsx`) 폼에 상세 이미지 다중 업로드(추가/삭제)+호버 이미지 업로드 UI 추가
- **Home 페이지**: 에디토리얼/시즌배너 섹션 삭제(히어로 → MEN/WOMEN 배너 바로 연결), 히어로 검은 오버레이 제거 후 하단 1/3만 옅게 어두워지는 그라데이션(`from-black/25`)+흰 타이틀+그림자(`drop-shadow-md`)로 교체, 브랜드 캡션(eyebrow) 삭제하고 타이틀만 노출
- **Men/Women 페이지**: 히어로 60vh로 축소(Home은 100vh 유지), 상단 캡션 삭제, 4개씩 페이징되는 상품 캐러셀(embla-carousel-react) 추가(관리자가 콘텐츠관리에서 노출 상품/순서 직접 지정), SHOP BY CATEGORY에 "모두 보기" 타일 신규(첫 번째 배치, `cover` 이미지)
- **콘텐츠관리(`/admin/content`) 구조 개선** — 하드코딩 순서 배열(`KEY_ORDER`) 제거하고 `site_content.display_order` 컬럼 기반으로 전환, 페이지 안에서 섹션별(히어로/MEN배너 등) 그룹핑, 죽은 콘텐츠(세일/시즌배너, 히어로 eyebrow) 정리
- **DB 마이그레이션 다수 실행됨**(SQL 원문은 세션 대화 기록 또는 Supabase SQL Editor 히스토리 참고): `products.sizes`/`sale_price`/`featured`/`featured_order`/`detail_images`/`hover_image`, `site_content.display_order`
- 전 과정 `npx tsc -b`/`npm run lint` 신규 에러·경고 0건 확인, 주요 플로우 브라우저 실동작 확인 완료
- **`window.confirm` 제거 + 콘텐츠 관리 UI 개선/정렬 수정 (2026-09-08, 이미지 업로드 작업 직후 후속)**:
  1. **`window.confirm` → 공용 `ConfirmModal.tsx`** — 상품 삭제 확인에 쓰던 네이티브 alert가 브라우저 자동화 도구를 멈추게 하는 문제를 겪은 뒤, `MyPage.tsx`의 로그아웃 확인 모달과 동일한 디자인으로 공용 컴포넌트화. 둘 다 이걸 사용하도록 교체. 앞으로 확인창이 필요한 곳은 전부 재사용
  2. **콘텐츠 이미지 "제거" 기능 추가** — 업로드는 있었는데 되돌리기(원래 색상 블록으로 복귀)가 없던 것을 보완. `ConfirmModal`로 확인 후 값을 빈 문자열로 리셋
  3. **`ContentManage.tsx` 전면 리디자인** — 기존엔 텍스트/이미지 항목이 한 테이블에 섞여 있어 가독성이 나빴던 것을, 항목당 카드 하나로 바꾸고(`grid md:grid-cols-2 lg:grid-cols-3`), 네이티브 "파일 선택" 버튼을 디자인 시스템에 맞는 "이미지 변경" 버튼(label+숨김 input)으로 교체, 썸네일 클릭 시 라이트박스로 확대해서 볼 수 있게 추가
  4. **콘텐츠 목록 표시 순서 수정** — 기존엔 `key` 알파벳 순 정렬이라 "이벤트배너 3(men-denim)"이 "이벤트배너 1(men-outer)"보다 문자열상 앞이라 화면에 뒤죽박죽으로 나오던 문제를, `KEY_ORDER` 배열(코드 내 상수, DB 컬럼 추가 없음)로 원하는 순서(홈→MEN→WOMEN, 각 페이지 안에서 히어로→배너→이벤트배너1~4)를 직접 지정해서 해결
  5. **부수 발견**: 검증 중 `men.sale_banner.image`가 DB에 빈 값으로 들어있던 걸 발견(원인 불명, 공개 화면은 fallback 로직 덕분에 실제 영향 없었음) — `seed-content.ts`(upsert라 재실행 안전) 재실행으로 복구
  6. **검증**: 브라우저로 카드 레이아웃/라이트박스/순서 전부 확인, `npx tsc -b` 에러 0건, `npm run lint` 신규 경고 0건
- **이미지 업로드 방식 도입 — 상품관리 + 콘텐츠 관리 (2026-09-08)**: 상품/배너 이미지를 "URL 직접 입력"에서 실제 서비스(Shopify/카페24 등)처럼 "내 컴퓨터에서 파일 선택 → 자동 업로드" 방식으로 전환:
  1. **Supabase Storage `images` 버킷 신규**(전체공개, `products`/`site_content`와 동일하게 RLS 전체 허용 정책) — `insert into storage.buckets`+`storage.objects` 정책 4종 SQL을 사용자가 직접 실행
  2. **`src/utils/uploadImage.ts` 공용 유틸** — 파일을 받아 Storage에 업로드하고 공개 URL을 반환. 상품/콘텐츠 양쪽에서 재사용
  3. **`ProductManage.tsx`**: "이미지 URL" 텍스트 입력 → 파일 선택+미리보기로 교체(`images/products/` 폴더), 목록에도 썸네일 컬럼 추가
  4. **`site_content`에 이미지 슬롯 12개 추가**(`.image`로 끝나는 key 컨벤션, 스키마 변경 없이 기존 텍스트 컬럼 재사용) — Men/Women 히어로+세일배너, Home 히어로/시즌배너/MEN·WOMEN배너/이벤트배너4개. 기존 하드코딩 값(외부 URL 또는 없음)을 그대로 시딩해서 시각적으로 아무것도 안 바뀐 상태로 시작, 관리자가 업로드하면 그때부터 교체됨
  5. **`ContentManage.tsx`**: key가 `.image`로 끝나면 텍스트 수정 대신 파일 업로드+미리보기 UI로 자동 분기(`images/content/` 폴더), 선택 즉시 저장(별도 저장 버튼 없음)
  6. **검증**: 상품 이미지 업로드 → 저장 → 목록 반영 확인(테스트 상품 생성 후 삭제, Storage 파일도 정리). 콘텐츠 관리에서 "홈 이벤트배너 3(데님) 이미지" 업로드 → Home 페이지에 실제 반영 확인(테스트 후 원복). `npx tsc -b` 에러 0건, `npm run lint` 신규 경고 0건
  7. **다음 단계**: RLS는 여전히 전체 공개 상태 — 배포 전 강화 필요 (이미지 제거 UI/`window.confirm` 교체는 바로 위 항목에서 후속 처리 완료)
- **페이지별 브라우저 탭 제목 + 사이트 콘텐츠 관리 기능 추가 (2026-09-08)**:
  1. **`react-helmet-async` 설치** — 모든 페이지에서 브라우저 탭 제목이 방치된 Vite 기본값 `vite-tmp` 그대로였던 문제 발견 후 수정. `index.html` 기본값을 `T&L`로, 사용자 11개+관리자 5개 페이지 전부에 `<Helmet><title>...</title></Helmet>` 추가(예: "T&L \| MEN", "T&L \| 옥스포드 셔츠")
  2. **알려진 라이브러리 이슈 발견+수정**: `<title>` 안에 문자열과 변수를 여러 JSX 자식으로 섞어 쓰면(`T&L | {name}`처럼) react-helmet-async가 제목을 빈 값으로 렌더링하는 버그 확인 — 템플릿 리터럴 하나로 합쳐서(`{`T&L | ${name}`}`) 해결. 상품상세/카테고리 필터 페이지 2곳 해당
  3. **`site_content` 테이블 신규**(`key`/`page`/`label`/`value`) — Men/Women/Home의 히어로·배너·이벤트배너 하드코딩 문구 16개를 이 테이블로 이전. `products`와 동일하게 RLS `for all using(true)` 전체공개 정책
  4. **`ContentContext` 신규**(`ProductsContext`와 동일 패턴) — 앱 마운트 시 전체 조회 후 `{key: value}` 맵으로 제공. `Men.tsx`/`Women.tsx`/`Home.tsx`가 하드코딩 문자열 대신 `content[key] ?? 기본값` 형태로 조회(기본값은 원래 하드코딩돼 있던 문구 그대로 유지, row 없을 때 대비)
  5. **관리자 페이지에 `콘텐츠 관리`(`/admin/content`) 신규** — 페이지별(홈/MEN/WOMEN)로 그룹핑된 목록 + 인라인 수정(추가/삭제 불필요, key 고정)
  6. **Women.tsx 히어로 카피 복붙 버그 해소** — 기존엔 Men.tsx와 똑같은 "댄디하고 심플한..." 문구가 그대로 있었는데, 이번 시딩에서 "세련되고 감각적인 무드의 새 시즌 컬렉션"으로 다르게 채움
  7. **검증**: 브라우저로 Home/Men/Women/카테고리필터/상품상세 탭 제목 정상 표시 확인, 관리자 `콘텐츠 관리`에서 여성 히어로 타이틀 수정 → `/women` 새로고침 시 즉시 반영 확인(테스트 후 원복). `npx tsc -b` 에러 0건, `npm run lint` 신규 경고는 `ContentContext`/`ContentManage.tsx`의 기존과 동일한 패턴(2건)뿐
  8. **다음 단계**: 이미지/링크는 이번 범위에서 의도적으로 제외(문구만 관리자 편집 가능). `formatPrice()` 중복 정의(7개 파일) 정리는 여전히 후보로 남아있음
- **공개 페이지(Men/Women/ProductDetail/CategoryListing 등)를 mock 데이터에서 Supabase로 전환 완료 (2026-09-08)** — 그동안 관리자 페이지(Supabase)와 공개 페이지(mock)가 서로 다른 데이터 소스를 써서 관리자가 상품을 수정해도 실제 화면에 반영 안 되던 이원화 문제를 해소. "운영자가 관리자 페이지에서 상품을 관리하면 실제 서비스에 반영되어야 한다"는 프로젝트 핵심 목표의 첫 단계:
  1. **`ProductsContext` 신규**(`src/context/ProductsContext.tsx`) — 앱 마운트 시 `supabase.from('products').select('*').order('created_at', {ascending: true})`로 전체 상품을 한 번 조회해 전역 상태로 제공(`AuthContext` 등과 동일한 Context 패턴). `App.tsx`에 Provider 추가(`AuthProvider` 바로 안쪽)
  2. **`Product.price` 타입을 `string`(`"₩198,000"`) → `number`로 전면 변경**(`types.ts`) — 코드 전체를 훑어본 결과 `CartItem.price`를 비롯해 장바구니/주문/관리자 쪽은 이미 전부 숫자로 다루고 있었고 `Product.price`만 예외적으로 문자열이었음이 확인되어, 표시할 때만 `formatPrice()`(신규 `src/utils/formatPrice.ts`)로 포맷하는 기존 지배적 패턴에 맞춤. `mock/products.ts`의 60개 상품 `price` 리터럴도 문자열→숫자로 일괄 변환, `scripts/seed-products.ts`의 `parsePrice()` 변환 로직도 제거(이제 그대로 숫자 전달)
  3. **`mock/products` 직접 import 6곳을 `useProducts()` 훅으로 교체**: `Men.tsx`, `Women.tsx`, `ProductDetail.tsx`, `Wishlist.tsx`, `Header.tsx`(활성 gender 판별용, `getActiveGender`를 모듈 스코프 함수에서 products를 파라미터로 받는 형태로 변경), `RecentlyViewed.tsx`
  4. **`ProductCard.tsx`/`ProductDetail.tsx` 가격 표시에 `formatPrice()` 적용**, `CartContext.tsx`의 `parsePrice()`(문자열→숫자 변환용, 이제 불필요) 삭제하고 `product.price` 그대로 전달
  5. **`ProductDetail.tsx`에 로딩 상태 추가** — Supabase 조회가 비동기라 데이터 도착 전에는 `!product`가 참이 되어 "상품을 찾을 수 없습니다"가 잘못 뜨는 문제를 막기 위해 `loading` 우선 체크 후 "불러오는 중..." 표시
  6. **스키마는 기존 `products` 테이블 그대로 사용, 변경 없음** — 실제 테이블을 조회해 확인한 결과(`id/name/price/gender/category/sub_category/image/color_label/color_hex/description/created_at/updated_at`) 공개 페이지가 필요로 하는 필드를 전부 커버하고 있어 컬럼 추가/변경 불필요
  7. **검증**: 브라우저로 (a) Men 페이지 상품 그리드가 Supabase 데이터로 정상 렌더링, 가격 포맷 정상 (b) 상품상세 페이지 정상 (c) 카테고리 소분류 필터(하의→12개) 정상 (d) **관리자로 로그인 후 `상품관리`에서 가격을 59,000→77,000으로 수정 → 상품상세 페이지 새로고침 시 77,000으로 즉시 반영되는 것까지 확인**(이번 작업의 핵심 목표 검증), 이후 원래 값으로 복구. `npx tsc -b` 에러 0건, `npm run lint` 신규 경고는 `ProductsContext.tsx`의 `react(only-export-components)` 1건뿐(기존 5개 Context 파일과 동일한 이미 알려진 패턴)
  8. **다음 단계**: `mock/products.ts`는 UI에서는 더 이상 쓰이지 않지만 `scripts/seed-products.ts`가 여전히 참조하므로 삭제하지 않고 시딩용 원본으로 유지. 다음 우선순위 후보는 "사이트 콘텐츠(히어로/배너 문구) 관리 기능"을 관리자 페이지에 신규로 만드는 것 — Supabase에 콘텐츠 테이블을 추가하고 `ProductManage.tsx`와 유사한 CRUD 화면을 만들어 Men/Women/Home의 하드코딩된 문구(그중 Women.tsx 히어로 카피가 Men.tsx와 동일하게 복붙된 실수도 포함)를 교체하는 작업. `formatPrice()`가 `Cart.tsx`/`Order.tsx`/`OrderHistory.tsx`/`OrderComplete.tsx`/`Dashboard.tsx`/`OrderManage.tsx`/`ProductManage.tsx` 7개 파일에 중복 정의되어 있는 것도 정리 후보(이번 범위에서는 손대지 않음)
- **주문관리(`OrderManage.tsx`) 실제 구현 완료 (2026-09-06)** — 실제 쇼핑몰(카페24 계열)/Shopify 관리자 주문관리 방식을 조사한 뒤(운송장번호 입력은 이번엔 생략하기로 결정) 반영:
  1. **`OrderStatus` 유니온 타입 도입** — `types.ts`의 `Order.status: string` → `'결제완료' | '배송준비' | '배송중' | '배송완료' | '취소'`로 변경(예전부터 설명만 해뒀던 개선 사항을 이번에 적용)
  2. **`OrderHistoryContext`에 `updateOrderStatuses(orderIds, status)` 추가** — 배열을 받아 한 번의 `setState`로 여러 건을 동시에 갱신(개별 변경도 이 함수에 길이 1 배열로 호출)
  3. **목록 + 행 클릭 시 상세 펼침** — 실제 사이트들의 "목록은 요약만, 상세는 펼쳐서/들어가서 확인" 패턴을 반영. 클릭하면 해당 행 아래로 배송지·배송요청사항·상품 목록(`OrderItemRow` 재사용)이 펼쳐짐. 체크박스/상태 select 클릭은 `stopPropagation`으로 행 펼침과 분리
  4. **체크박스 다중 선택 + 일괄 상태 변경** — 헤더 체크박스로 전체 선택/해제, 1건 이상 선택 시 상단에 "n건 선택됨 + 상태 select + 일괄 변경" 툴바 노출. 실무 사이트들의 "여러 건 선택 후 한 번에 발송처리" 패턴을 참고해 미리 반영하기로 결정(원래는 나중에 추가할지 고민했으나 지금 같이 넣기로 함)
  5. **상태별 필터 + 주문번호/이메일 검색**
  6. 상품관리와 달리 **Supabase 미사용** — 주문 데이터는 계속 `OrderHistoryContext`(localStorage) 그대로 사용(신규 백엔드 작업 불필요)
  7. **검증**: 브라우저로 (a) 행 클릭 시 배송지/상품 상세 펼침 (b) 개별 상태 select로 변경 (c) 전체선택 체크박스 → 일괄 변경 툴바 → 상태 일괄 적용 (d) 상태 필터로 결과 좁혀지는지 확인, 테스트로 바꾼 상태는 원래 값(결제완료)으로 복구함. `npx tsc -b`/`npm run lint` 신규 에러·경고 0건
  8. **다음 단계**: 회원관리(`MemberManage.tsx`)는 아직 스텁 상태로 미착수
- **상품관리(`ProductManage.tsx`) 실제 구현 완료 (2026-09-06)**:
  1. `supabase.from('products')`로 목록 조회(`created_at` 역순), 성별/카테고리 필터 + 상품명 검색(클라이언트 사이드 필터링)
  2. 추가/수정 폼 하나를 토글로 공유(추가 시 `editingId: null`, 수정 시 해당 상품 값으로 폼 채움) — 성별/카테고리/서브카테고리는 `CategoryListing.tsx`와 동일한 옵션 목록 재사용, 카테고리 바꾸면 서브카테고리 옵션도 같이 갱신
  3. 신규 상품 `id`는 `${gender}-admin-${Date.now()}` 형식으로 자동 생성(관리자가 직접 입력 안 함)
  4. 삭제는 `window.confirm` 확인 후 `delete().eq('id', ...)`
  5. **알려진 oxlint 경고 1건 추가**: `react(set-state-in-effect)` — mount 시 `loadProducts()`를 `useEffect`에서 호출하는 패턴 자체를 oxlint가 보수적으로 잡아냄(await 이후의 setState까지도 감지). 코드를 부자연스럽게 바꾸지 않는 이상 없앨 수 없는 경고라 기존 5건의 무관한 경고와 같이 그대로 둠(신규 데이터fetching 컴포넌트라 코드베이스 최초 사례)
  6. **검증**: 브라우저에서 관리자 계정으로 (a) 60개 목록 정상 렌더링 (b) 검색/필터 정상 (c) 기존 상품 가격 수정 → 저장 → 목록 즉시 반영 (d) 새 상품 추가 → 검색으로 노출 확인 (e) 방금 추가한 테스트 상품 삭제(→`window.confirm` 스텁 처리해서 확인) 까지 전체 CRUD 플로우 확인, 수정 테스트에 썼던 데이터는 원래 값으로 복구함. `npx tsc -b` 에러 0건
  7. **다음 단계**: 주문관리(`OrderManage.tsx`)/회원관리(`MemberManage.tsx`)는 아직 스텁 상태로 미착수. 공개 페이지(Men/Women/상세)를 Supabase로 전환하는 건 별도 결정 필요(현재는 상품관리만 Supabase, 공개 페이지는 계속 mock)
- **Supabase 연동 진행 중 — 테이블 생성 + 시딩 완료 (2026-09-06)**:
  1. 사용자가 Supabase 프로젝트 생성(`nkwofckgxfgsusgqabme`), `.env.local`에 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 기록(gitignore 대상, 커밋 안 됨). anon key만 사용, service_role 키는 받지 않음
  2. **RLS 정책 결정**: 지금 로그인이 Supabase Auth가 아니라 localStorage 가짜 인증이라 `auth.uid()` 기반 권한 분리가 불가능함을 설명 → 사용자가 "지금은 전체 공개(A안)"로 결정. `products` 테이블에 RLS는 켜두되 `for all using (true) with check (true)` 정책 하나로 사실상 전체 공개. **주의**: anon key가 프론트 번들에 노출되므로 지금은 누구나 상품을 수정/삭제할 수 있는 상태 — 실제 배포 전에는 반드시 Supabase Auth 전환 + 관리자 전용 쓰기 정책으로 승격 필요
  3. 사용자가 Supabase SQL Editor에서 `products` 테이블 생성 SQL 실행 완료(컬럼: id/name/price(정수)/gender/category/sub_category/image/color_label/color_hex/description/created_at/updated_at). **상품관리(관리자)만 이 테이블을 쓰기로 결정** — 공개 페이지(Men/Women/상세)는 계속 `src/mock/products.ts` 사용, price도 여기선 문자열(`"₩198,000"`)인 채로 안 건드림(둘은 당분간 별개 데이터 소스)
  4. **`scripts/seed-products.ts` 신규** — `src/mock/products.ts`의 60개 상품을 읽어 Supabase `products` 테이블에 upsert하는 1회성 스크립트. `price` 문자열→정수 변환, `subCategory`→`sub_category`, `color.{label,hex}`→`color_label`/`color_hex`로 매핑. `npx tsx scripts/seed-products.ts`로 실행, 60개 전부 삽입 확인(`select count`, 샘플 로우 조회로 검증)
  5. **다음 단계**: `src/admin/pages/ProductManage.tsx` 실제 구현 — 목록(필터/검색) + 추가/수정 폼(가격은 숫자 입력, 화면엔 포맷) + 삭제, `src/lib/supabaseClient.ts`(기존 파일)로 CRUD
- **관리자 페이지 착수 — 인증가드 + role + 대시보드 (2026-09-06, 미커밋)**:
  1. **`User`에 `role: 'admin' | 'user'` 필드 추가**(`types.ts`에 `UserRole` 타입 신규). 회원가입 시 항상 `role: 'user'`로 생성
  2. **테스트 관리자 계정 추가** — `AuthContext.tsx`의 `ensureTestAccounts()`(기존 `ensureTestAccount` 단수→복수로 변경)가 이제 `test@test.com`(일반)과 `admin@test.com` / `admin1234`(관리자, `role: 'admin'`) 둘 다 없으면 생성
  3. **`useAuth`에 `listUsers()` 추가** — 저장된 전체 회원 목록을 비밀번호 제거하고 반환(회원관리/대시보드용, 지금까지는 로그인한 본인만 조회 가능했음)
  4. **`src/components/RequireAdmin.tsx` 신규** — `RequireAuth`와 같은 패턴, `user.role !== 'admin'`이면(비로그인 포함) `/`로 리다이렉트. `App.tsx`에서 `/admin` 전체 라우트를 이걸로 감쌈
  5. **대시보드 페이지 신규**(`src/admin/pages/Dashboard.tsx`, `/admin` 인덱스 라우트) — KPI 카드 4개(총 매출/총 주문 수/오늘 주문 수/총 회원 수) + 최근 주문 8건 테이블. 기존 `useOrderHistory()`(이미 전체 유저 주문 보유)와 신규 `listUsers()`만으로 구성, 새 데이터 소스 불필요. `AdminLayout.tsx` 사이드바에 "대시보드" 링크 추가
  6. **검증**: 브라우저로 (a) 비로그인 상태 `/admin` 접근 → `/`로 리다이렉트, (b) 일반 회원(`test@test.com`) 로그인 상태에서 `/admin` 접근 → `/`로 리다이렉트, (c) `admin@test.com`/`admin1234` 로그인 → 대시보드에 실제 주문(₩198,000, 1건)·회원 수(2명) 정상 표시까지 전체 플로우 확인. `npx tsc -b`/`npm run lint` 에러 0건(기존 5건 경고만 무관하게 존재)
  7. **다음 단계**: 상품관리(`ProductManage.tsx`)를 Supabase 연동 — `products` 테이블 스키마를 사용자에게 제시 후 Supabase SQL 에디터에서 직접 생성 요청(anon key로는 DDL 불가), 시딩, `src/lib/supabaseClient.ts`(이미 존재)를 통한 CRUD 페이지 구현 예정. 주문관리/회원관리 페이지는 아직 스텁 상태로 미착수
- **상품 카드 hover 정보 노출 제거 (2026-09-06)**: 기존엔 데스크탑에서 상품카드에 마우스를 올려야만 이름/가격이 나타났는데(`showInfo` prop으로 모바일/PC 분기), 모바일·태블릿처럼 PC에서도 이름/가격이 항상 보이도록 변경. 찜하기 하트 버튼은 기존대로 PC(`lg:`)에서만 hover 시 노출되는 동작은 그대로 유지(요구사항이 "hover하면 찜하기 버튼만 나오게"였음). `ProductCard.tsx`에서 `showInfo` prop과 hover 오버레이 `<div>` 완전 삭제, 이름/가격 블록을 이미지 아래 항상 렌더링. `CategoryListing.tsx`/`Wishlist.tsx`의 `<ProductCard showInfo />` 호출부에서도 prop 제거. 브라우저로 PC 폭에서 이름/가격 항상 표시 + 하트만 hover 시 노출 확인, `npx tsc -b` 에러 0건
- **사이트 전체 좌우 패딩 스케일 재정의 (2026-09-06)**: 기존 `px-24 → md:px-48 → lg:px-80`(모바일 24/태블릿 48/데스크톱 80)를 **`px-24 → md:px-32 → lg:px-40`**로 전면 교체. 태블릿이 데스크톱보다 여백이 커지는 역전 현상을 막기 위해 태블릿 값도 같이 낮춤. `Header`/`Footer`/`index.css`의 `.page-section`(MyPage/Wishlist가 자동 적용받음)/`CategoryListing`/`Home`/`Men`/`Women`/`ProductDetail`/`Cart`/`Order` 총 10개 파일 24곳 전부 교체. `Cart`/`Order`/`ProductDetail`은 기존에 `md:` 단계 자체가 없었어서(모바일→데스크톱으로 바로 점프) 이번에 `md:px-32`를 새로 추가해 다른 페이지들과 통일. 브라우저로 확인, `npx tsc -b` 에러 0건
- **`public/images/hero/`에 사용자가 모델 사진 4장 추가함**(women-coat-02-model-01/02, 각 버전+v2) — 지금은 Women 히어로에 임시 외부 URL 이미지를 쓰고 있어서 **이 로컬 사진들은 아직 어디에도 연결 안 함**, 다음에 필요하면 교체
- **Men/Women 페이지 섹션 재구성 + 타이틀/간격/PDP 폰트 조정 (2026-09-05~06, 전부 미커밋)**:
  1. **섹션 순서 전면 재구성** — 기존 "Hero → 에디토리얼 배너 → SHOP BY CATEGORY → NEW ARRIVAL(8개 혼합)"을 **"Hero → 상품(셔츠 4개, 타이틀 없음) → 에디토리얼 배너 → 상품(아우터 4개, 타이틀 없음) → SHOP BY CATEGORY"**로 전면 재구성. 셔츠/아우터 섹션은 `subCategory==='셔츠'`/`category==='아우터'`로 필터링한 4개를 `product-grid`(NEW ARRIVAL과 동일 레이아웃)로 배치, 타이틀·"더보기" 링크 없음. 기존 "NEW ARRIVAL" 섹션 자체는 삭제
  2. **에디토리얼 배너 이미지+카피 교체** — 배경을 사용자가 준 Cloudinary URL(`9.2 Sale Third Banner`)로 교체, 카피를 "Sale's up to 50% off" 하나로 단순화(기존 "THE ESSENTIAL LAYER"+서브카피 삭제)
  3. **Women 히어로 이미지 교체** — 기존 3분할 색상 블록 대신 사용자가 준 임시 외부 이미지(Cloudinary `craftcore_des`)로 교체(`bg-cover bg-center`, 기존 어두운 오버레이 유지). Men 히어로는 아직 색상 블록 그대로(별도 이미지 요청 없었음)
  4. **에디토리얼 배너 엣지투엣지 처리** — 배너를 감싸던 `<section>`의 좌우 패딩(`px-24 md:px-48 lg:px-80`)을 제거해서 배너가 화면 전체 폭에 꽉 차도록 변경(배너 내부 텍스트 패딩은 유지)
  5. **Hero/에디토리얼 배너 타이틀 padding을 사이트 기본값으로 통일** — 좌우는 `px-24 md:px-48 lg:px-80`(헤더와 동일한 사이트 기본 패딩)로, 세로는 상단 32px 유지하고 하단만 48px로 키워서 텍스트가 배너 하단에서 좀 더 위로 올라오도록 조정(`px-24 pt-32 pb-48 md:px-48 lg:px-80`, Hero의 기존 `lg:p-64` 축약형은 제거)
  6. **관리자(`/admin`) 인증 가드는 의도적으로 보류 확정** — 사용자가 "사이트 구성이 어느 정도 됐을 때 진행할 것, 지금 만들면 확인할 때마다 로그인 요구가 뜰 것"이라고 명시적으로 이유를 설명하며 보류 요청. 다음에 먼저 물어보지 않고 진행하지 말 것
  7. **`Home.tsx`의 에디토리얼/젠더/이벤트 배너도 Men/Women과 동일하게 엣지투엣지 처리** — 3개 섹션 전부 outer `<section>`의 좌우 패딩 제거. 에디토리얼 배너는 내부 텍스트도 Men/Women과 동일한 `px-24 pt-32 pb-48 md:px-48 lg:px-80` 패턴 적용. 젠더/이벤트 배너는 내부 텍스트 패딩(`p-32`/`p-20`)은 그대로 유지(사용자가 배치/외곽 패딩만 요청)
  8. **`Men.tsx`/`Women.tsx` 코드 중복 — 리팩터링 보류 확정** — 사용자가 "구조는 같지만 내용(상품/이미지/카피)은 앞으로 완전히 달라질 것"이라고 확인. 지금은 거의 동일한 코드지만, 공통 컴포넌트로 합치는 리팩터링은 진행하지 않기로 함(향후 콘텐츠 발산을 고려한 판단)
  9. **카카오 주소검색 로직을 공통 훅으로 분리** — `src/hooks/useDaumPostcodeSearch.ts` 신규(`(onComplete: (roadAddress: string) => void) => () => void` 형태, 내부에서 `new window.daum.Postcode({oncomplete}).open()` 호출). `AccountSettingsForm.tsx`와 `Order.tsx`에 각각 따로 있던 동일 로직을 이 훅으로 교체. **주의**: 훅 이름이 `use`로 시작해서 oxlint의 `react-hooks(rules-of-hooks)`가 "조건부 호출" 여부를 정적으로 검사함 — Order.tsx에서 처음엔 early-return(`if (!items) return null`) 아래에 배치했다가 린트 에러 발생, 다른 `useState` 호출들과 함께 컴포넌트 최상단으로 옮겨서 해결
  10. 브라우저로 전체 확인(Home 엣지투엣지, 마이페이지·주문서 양쪽에서 주소검색 정상 동작), `npx tsc -b`/`npm run lint` 둘 다 에러 0건(기존 Context 5개의 `only-export-components` 경고만 무관하게 존재)
  4. **"SHOP BY CATEGORY" 타이틀** — `text-h2`(24px) → `text-base font-bold`(16px)
  5. **섹션 간 간격을 Home과 동일하게** — 각 섹션이 쓰던 공용 `.page-section` 클래스(32→48→64px 반응형 패딩) 대신 `mt-20 px-24 md:px-48 lg:px-80`로 직접 교체(마지막 섹션엔 `pb-20`). `.page-section` 클래스 자체는 ProductDetail/Wishlist도 같이 쓰기 때문에 안 건드림
  6. **`page-section__header`의 `mb-24` → `mb-10`** — 타이틀과 아래 콘텐츠 사이 간격 축소(공용 클래스라 ProductDetail "함께 보면 좋은 상품"에도 동일 적용됨, 확인 완료)
  7. **`CategoryCard.tsx` 전면 재구성** — 기존 "이미지 아래 타이틀+화살표 아이콘" 방식에서 **"이미지 안쪽에 밑줄 텍스트만"** 방식으로 변경(화살표 아이콘 완전 삭제). 기본 색상 `text-primary`, hover 시 `text-point`(기존 색상 스킴 그대로 유지, 배치 방식만 변경), 폰트는 `font-semibold`
  8. **PDP(`ProductDetail.tsx`) 타이틀/가격/관련상품 타이틀 폰트 조정** — 상품 타이틀 `text-h2`(24px)→`text-h3 font-bold`(20px, bold 유지), 가격은 공용 `.text-price` 클래스는 안 건드리고 이 자리에서만 `font-medium` 추가(16px 유지, 굵기만 축소). "함께 보면 좋은 상품" 타이틀은 `text-h3 font-bold`(20px)로 통일(다른 곳과 통일 목적으로 16px 시도했다가 사용자가 20px로 재조정 요청)
  9. 전부 브라우저로 확인, `npx tsc -b` 에러 0건
- **Order 배송요청 select 커스텀 화살표 + 배너 rounded 제거 (2026-09-05)**:
  1. `Order.tsx`의 배송 요청사항 `<select>`가 브라우저 기본 화살표를 쓰고 있어 간격 제어가 안 되던 것을, `appearance-none` + `lucide-react`의 `ChevronDown`을 직접 배치하는 방식으로 교체(우측 16px 고정)
  2. **Home/Men/Women의 "큰 배너/섹션 블록"만** `rounded-sm` → `rounded-none`으로 변경 — Home의 에디토리얼 배너·MEN 배너·WOMEN 배너·이벤트 배너 4개(총 6곳) + Men/Women의 에디토리얼 배너(각 1곳). Button/Input/Checkbox/Toast/모달/칩/스와치 등 **작은 UI 요소는 의도적으로 그대로 둠**(사용자가 큰 배너만 지정)
  3. 브라우저로 확인, `npx tsc -b` 에러 0건
- **유지보수성 점검 후속 정리 — "그 외 작은 것들" 전부 처리 (2026-09-05)**: 관리자 작업 착수 전 코드 전체를 유지보수 관점에서 훑어본 리뷰(구조적 이슈 3건/중복 코드 4건/작은 것들 6건)에서, 그중 "작은 것들" 6개를 전부 처리함. 구조적 이슈(관리자 인증가드 없음, Order.status 타입 없음, 아우터 소분류 죽은 탭)와 중복 코드(localStorage 래퍼 중복, formatPrice/parsePrice 중복, Men/Women 거의 동일 등)는 **아직 손 안 댐** — 다음에 필요하면 그때 진행:
  1. **`SHIPPING_FEE` 공용화** — `src/constants.ts` 신규, `Cart.tsx`/`Order.tsx`가 각자 하드코딩하던 `3000`을 여기서 import
  2. **z-index 토큰화** — `index.css` `@theme`에 `--z-index-fixed-bar(90)/--z-index-header(100)/--z-index-modal(200)/--z-index-toast(1000)` 정의, `Header`/`ProductDetail`/`AuthModalContext`/`MyPage`/`Toast`의 `z-[N]` 임의값을 `z-header`/`z-fixed-bar`/`z-modal`/`z-toast`로 교체
  3. **`text-[13px]` → `text-body-sm` 치환** — `Order.tsx`, `OrderHistory.tsx`의 페이지 텍스트에서만 교체(정확히 동일한 13px 값이라 안전). `text-[15px]`는 과거에 이미 "Figma 원본 그대로 리터럴 사용하기로 확정"된 의도적 예외라 그대로 둠. `Button.tsx`/`SizeSelector.tsx`의 `text-[13px]`도 `text-body-sm`이 추가로 갖는 `leading-[1.4]`가 고정 높이 버튼의 수직 정렬에 영향 줄 수 있어 의도적으로 안 건드림
  4. **`ProductDetail.tsx` 썸네일 3연복 제거** — 동일한 이미지 `div` 3개를 `[0,1,2].map()`으로 축소
  5. **미사용 코드 삭제** — `HeroPillButton.tsx`(아무도 import 안 함), `index.css`의 `.text-display` 클래스(사용처 없음)
  6. **localStorage 쓰기 에러 처리 통일** — `src/utils/storage.ts` 신규(`safeSetItem` 헬퍼, try/catch로 조용히 무시 — 읽기 쪽과 동일한 패턴), `AuthContext`/`CartContext`/`WishlistContext`/`OrderHistoryContext`/`utils/recentlyViewed.ts`의 `localStorage.setItem` 호출 9곳을 전부 이걸로 교체
  7. **검증**: `npx tsc -b` 에러 0건, `npm run lint` 신규 경고 0건(기존에도 있던 Context 파일들의 `react/only-export-components` 경고 5건은 이번 변경과 무관), 브라우저로 위시리스트 토글이 실제로 localStorage에 정상 반영되는지까지 확인 완료
- **주문서(`Order.tsx`) — 배송 요청사항 + 주문시점 배송지 수정 기능 (2026-09-05)**:
  1. **관리자 페이지 작업에 앞서, 코드 유지보수성 점검 리뷰를 먼저 진행**(별도 커밋 없음, 리뷰 리포트만) — localStorage 래퍼 중복(4개 Context), `formatPrice`/`parsePrice` 중복, `Men.tsx`/`Women.tsx` 거의 동일, `SHIPPING_FEE` 이중 하드코딩, z-index/폰트사이즈 임의값 산재, `/admin` 라우트 인증 가드 없음, `Order.status`가 타입 없이 문자열 하드코딩 등 발견 — 전부 기록만 하고 아직 수정 안 함(다음에 필요할 때 참고)
  2. **`Order` 타입에 배송 스냅샷 필드 추가** — `shippingName/shippingPhone/shippingAddress/shippingAddressDetail/deliveryRequest`. 기존엔 주문에 배송지 정보가 아예 없어서 마이페이지 프로필 주소를 나중에 바꾸면 과거 주문 배송지 표시도 같이 바뀌는 구조적 문제가 있었는데, 이제 주문 시점 값을 스냅샷으로 저장
  3. **`OrderHistoryContext.addOrder`의 시그니처 변경** — `(userEmail, items)` → `(userEmail, items, shipping)`로 배송 스냅샷을 같이 받도록 수정
  4. **`Order.tsx`에 배송지 인라인 수정 기능 추가** — 기존엔 "변경" 클릭 시 마이페이지로 이탈했는데, 이제 그 자리에서 수령인/연락처/주소(카카오 주소검색 재사용)/상세주소를 바로 수정 가능. 저장된 배송지가 없는 첫 주문은 편집 폼이 곧바로 펼쳐짐(마이페이지로 안 보냄). "이 배송지를 기본 배송지로 저장" 체크박스(기본 미체크) — 체크 시에만 `updateProfile`로 마이페이지 프로필도 갱신, 체크 안 하면 이번 주문에만 적용(다른 사람 집으로 한 번만 보낼 때 등)
  5. **배송 요청사항 섹션 신규** — 프리셋 드롭다운("문 앞에 놓아주세요"/"경비실에 맡겨주세요"/"배송 전 연락 바랍니다"/"직접 입력") + 직접입력 선택 시에만 텍스트 입력 노출. 선택 안 해도 주문 가능(선택사항)
  6. **결제 버튼 가드 추가** — 기존엔 약관동의 체크박스만 보고 있어서 배송지 정보 없이도 결제가 가능했던 버그성 허점이 있었는데, `isShippingValid`(수령인/휴대폰형식/주소 필수) 조건을 같이 추가해 배송지 미입력 시 결제 버튼이 비활성화되도록 수정
  7. **`OrderHistory.tsx`(마이페이지 주문내역)에 배송지+배송요청사항 표시 추가**
  8. **검증**: 브라우저로 (a) 저장된 배송지 없는 첫 주문 → 편집폼 즉시 노출 → 카카오 주소검색 스텁으로 채움 → 기본배송지 저장 체크 → 배송요청 직접입력 → 결제 → `shop_orders`/`shop_users`에 정확히 저장되는지, (b) 두 번째 주문에서 저장된 배송지 요약+"변경"→"완료" 토글 정상 동작, (c) 마이페이지 주문내역에 배송지/배송요청 표시까지 전체 플로우 확인 완료. `npx tsc -b` 에러 0건
- **마이페이지 배송지 — 카카오(다음) 우편번호 서비스 연동 (2026-09-05)**:
  1. `index.html`에 `//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js` 스크립트 태그 추가(API 키 불필요, 무료 공개 서비스)
  2. `src/types/daum-postcode.d.ts` 신규 — `window.daum.Postcode` 전역 타입 선언(`declare global`)
  3. `types.ts`의 `User`에 `shippingAddressDetail?: string` 필드 추가(도로명주소와 상세주소를 분리 저장)
  4. `AccountSettingsForm.tsx` — 기존 "주소" 텍스트 입력을 readOnly 입력+"주소 검색" 버튼으로 변경(`new window.daum.Postcode({oncomplete}).open()`으로 팝업 열고 `roadAddress`를 자동 채움), 그 아래 "상세주소"(동/호수 등) 입력을 새로 추가
  5. `Order.tsx`의 배송지 표시를 `{shippingAddress} {shippingAddressDetail}`로 합쳐서 노출
  6. **검증 방법**: 이 브라우저 자동화 환경에서 `daum.Postcode.open()`이 여는 실제 팝업 창은 MCP가 추적하는 탭 그룹 밖에서 열려서 스크린샷 확인은 불가(툴 한계, 코드 문제 아님) — 대신 `window.daum.Postcode`를 임시로 스텁 처리해서 `oncomplete` 콜백이 실제로 폼 상태를 갱신하는지 확인, 저장 버튼으로 `localStorage`(`shop_users`)에 `shippingAddress`+`shippingAddressDetail`이 정확히 저장되는지, Order 페이지에서 두 값이 합쳐서 표시되는지까지 전체 플로우 확인 완료. `npx tsc -b` 에러 0건
- **Home 페이지 신규 추가 + 카드 디자인 조정 (2026-09-05)**:
  1. **`/` 라우팅 분리** — 기존엔 `/`와 `/men`이 완전히 같은 `Men` 컴포넌트를 공유했는데(2026-09-03에 의도적으로 합쳤던 결정을 이번에 되돌림), `src/pages/Home.tsx` 신규 생성 후 `App.tsx`에서 `/`를 여기로 연결. `/men`은 그대로 `Men` 유지
  2. **`Home.tsx` 구성**: Hero(100vh, Men/Women과 동일한 `-mt-64`+헤더 오버레이 패턴, 성별 무관 카피) → 에디토리얼 배너 → **MEN/WOMEN 배너 2개**(큰 카드, `/men`·`/women`으로 링크, 타이틀+설명+"SHOP MEN'S/WOMEN'S") → **이벤트 배너 4개**("가을 필수 아이템", 카테고리/소분류로 링크). 사용자 확인 결과 이미지는 전부 색상 블록 placeholder로 우선 진행(실사진 없음, 나중에 받으면 교체)
  3. **`Header.tsx`의 `getActiveGender`에서 `/` → 'men' 특수처리 제거** — Home에서는 MEN/WOMEN 둘 다 비활성(연한 색)으로 표시되도록 수정
  4. **`CategoryCard.tsx` 개편** — 이미지 비율을 모바일/태블릿 `aspect-[3/4]`(세로형, 카드 커짐) / `lg:aspect-[3/2]`(PC는 기존 가로형 유지), 타이틀 폰트 20px→16px(medium), "더 보기" 텍스트 삭제하고 우측에 `lucide-react`의 `ArrowRight` 아이콘 배치 + hover 시 텍스트·아이콘 색상만 포인트 컬러로 전환(이동 애니메이션은 사용자 요청으로 제외)
  5. **`ProductCard.tsx` 모바일/태블릿 정보 표시 방식 변경** — 기존엔 `showInfo` prop에 따라 "이미지 위 hover 오버레이"(NEW ARRIVAL 등) vs "이미지 아래 항상 노출"(카테고리 리스팅 등) 두 방식이 나뉘었는데, `lg:` 미만(모바일/태블릿)에서는 `showInfo` 값과 무관하게 무조건 이미지 아래 항상 노출로 통일(레퍼런스 사이트 참고). `lg:` 이상(PC)에서는 기존 구분 그대로 유지. 가격 폰트도 카드 안에서만 16px bold → 14px semibold로 축소(공용 `.text-price` 클래스는 그대로 둠, PDP/장바구니 등 다른 곳엔 영향 없음)
  6. **`.product-grid`(`src/index.css`) row-gap 수정** — 모바일/태블릿에서 카드 아래 정보가 항상 보이게 되면서 기존 `gap-y-0`이 답답해 보인다는 피드백으로 `gap-y-32 lg:gap-y-0`으로 변경했다가, "32px는 너무 넓다"는 재피드백을 받아 `gap-y-20 lg:gap-y-0`으로 최종 조정(모바일/태블릿 20px, PC는 기존처럼 카드가 붙어 보이는 디자인 유지)
  7. **`.category-grid`(`src/index.css`) 태블릿 3열로 수정** — `md:grid-cols-2` → `md:grid-cols-3`(카테고리가 3개뿐이라 태블릿에서 하나가 다음 줄로 떨어지던 문제 해결)
  8. 전부 375/768/1024/1280px 브라우저로 확인 완료, `npx tsc -b` 에러 0건
  9. **Home 페이지 후속 수정(같은 날, 사용자 재피드백 반영)** — 에디토리얼 배너/MEN 배너/WOMEN 배너 높이를 전부 `h-screen`(100vh)으로 변경(기존 `aspect-[21/8]`/`aspect-[4/5]`였음). 이벤트 배너 4개는 상단 "가을 필수 아이템" `h2` 타이틀을 삭제하고, 각 타일 이미지 위에 타이틀+"이동 →" 버튼을 오버레이로 얹는 방식으로 변경(레퍼런스 스크린샷 참고, `aspect-[2/3]`). Home 섹션 간격은 `.page-section` 공용 클래스 대신 개별 `mt-20`으로 통일(사이트 전역 스페이싱에 영향 없음, Home 전용). 이후 MEN/WOMEN 배너 사이 간격과 이벤트 배너 4개 사이 간격을 각각 `gap-20` → `gap-0`으로 한 번 더 수정(사용자가 "간격 0"으로 요청)
  10. **작업 방식 관련 중요 피드백**: 사용자가 "내가 작업하라고 하기 전까진 절대 작업하지 마, 임의로 판단해서 작업하지 말고 항상 컨펌받은 다음에 작업해"라고 명시적으로 강하게 요청함 — 이후부터는 아무리 스펙이 구체적이어도(레퍼런스 이미지 포함) 계획만 먼저 말하고 **반드시 "진행해"류의 명시적 확인을 받은 뒤에만** 파일을 수정함. 이 규칙은 세션 내내 계속 적용(한 번 허락받았다고 이후 변경들에 자동 적용 안 됨)
- **반응형 작업 후속(2026-09-04 세션, Abercrombie/H&M 레퍼런스 조사 후 사용자 지시로 진행)**:
  1. **Men/Women 섹션 순서 변경** — 기존 "Hero → 에디토리얼 배너 → NEW ARRIVAL → SHOP BY CATEGORY" 순서를 "Hero → 에디토리얼 배너 → SHOP BY CATEGORY → NEW ARRIVAL"로 스왑(`src/pages/Men.tsx`, `Women.tsx`)
  2. **Hero 섹션을 모바일/태블릿/PC 전부 `100vh` 고정 + 헤더가 그 위에 position으로 떠 있는 구조로 변경** — 기존엔 `<main>`에 전역 `pt-64`(헤더 높이만큼)가 있어서 Hero가 헤더 아래부터 시작(`h-dvh` 추가로 실질적으로 100vh+64px를 차지). Hero 섹션에만 `-mt-64`(음수 마진으로 헤더 높이만큼 끌어올림) + `h-dvh → h-screen`(100vh 고정)을 줘서 Hero가 뷰포트 최상단(y=0)부터 정확히 100vh를 채우고, 고정된 헤더가 그 위에 겹쳐 뜨도록 함. 다음 섹션(에디토리얼 배너)은 정확히 100vh 지점부터 이어짐(겹침/틈 없음, 브라우저로 확인 완료). 다른 페이지들의 `pt-64`는 안 건드림(Hero가 있는 Men/Women만 해당)
  3. **PDP(`ProductDetail.tsx`) 모바일/태블릿 하단 고정 구매바 추가** — 기존 "장바구니 담기"/"바로 구매" 버튼은 `lg:` 이상에서만 보이도록(`hidden lg:flex`) 유지하고, `lg:hidden`인 별도 `fixed inset-x-0 bottom-0` 바를 추가해서 두 버튼을 가로로 나란히 배치(모바일에서 스크롤해도 항상 하단에 고정, `env(safe-area-inset-bottom)`로 아이폰 하단 홈 인디케이터 여백 처리). 본문에 `pb-112 lg:pb-0`을 줘서 마지막 콘텐츠가 바에 가리지 않게 함(단, 맨 아래로 끝까지 스크롤하면 Footer 일부가 바에 덮이는 건 의도된 정상 동작 — 업계 흔한 트레이드오프)
  4. ProductCard의 hover 정책(데스크톱만 hover, 모바일/태블릿은 항상 노출)은 이전 반응형 작업에서 이미 적용돼 있어서 이번엔 추가 수정 없이 재확인만 함
  5. 브라우저(iframe 트릭)로 375/768/1280px 모두 재확인 완료 — Hero 겹침 없음, 섹션 순서, PDP 고정바 표시/숨김 정상
- **이전 반응형 작업 핵심 (같은 세션)**:
  1. **브레이크포인트 3단으로 확장** — 기존엔 `lg:`(1024px) 하나만 써서 모바일/태블릿이 완전히 동일한 레이아웃이었음. `src/index.css`의 `page-section`/`product-grid`/`category-grid`에 `md:`(768px) 단계 추가 — `product-grid` 2→3→4열, `category-grid` 1→2→3열. `Header`/`Footer`/`CategoryListing` 좌우 패딩도 `px-24 → md:px-48 → lg:px-80`로 통일
  2. **헤더 실버그 발견+수정** — 375px 폭에서 로고 이미지가 flex-shrink로 완전히 0폭이 되어 사라지는 버그 발견(`shrink-0` 누락). 로고/네비/아이콘 gap도 모바일에서 좁게(`gap-16` md 이상은 `gap-32`), 로고 높이도 `h-22 → md:h-26`로 축소해서 375px에서 전체 헤더 콘텐츠가 실제로 들어가도록 수정(기존엔 좁은 화면에서 폭이 약 90px 초과했음)
  3. **장바구니 아이템 행(`CartItemRow`) 실버그 발견+수정** — 375px에서 `QuantityStepper`(−/숫자/+, `overflow-hidden`)가 flex-shrink로 짜부라져 거의 안 보이는 얇은 조각으로 렌더링되던 버그 발견. `md:contents` 트릭으로 모바일에선 "체크박스+이미지+정보" 1행 / "수량조절+삭제" 2행으로 줄바꿈, `md:` 이상에서는 `display:contents`로 원래의 한 줄 레이아웃 그대로 복원
  4. **`ProductCard`의 hover-only 인터랙션을 터치 기기 대응으로 변경** — 위시리스트 하트 버튼과 이름/가격 오버레이가 기존엔 `group-hover`로만 나타나서(데스크톱 마우스 전제) 모바일/태블릿(터치, hover 없음)에서는 사실상 안 보이거나 발견하기 어려웠음. `lg:` 이상에서만 hover-reveal 유지, 그 아래(모바일/태블릿)에서는 항상 노출되도록 변경
  5. **`MyPage` 좌측 탭+우측 콘텐츠 2단 레이아웃의 분기점을 `lg:`(1024px) → `md:`(768px)로 변경** — 태블릿 폭(768~1024px)에서도 사이드바+콘텐츠가 나란히 보이도록(기존엔 이 구간에서 모바일과 동일하게 세로로 쌓였음)
  6. **검증 방법**: 이 환경 브라우저 자동화 도구의 `resize_window`가 실제로는 창 크기를 못 바꾸는 게 재확인됨(이전 기록대로) — 대신 빈 탭에 `iframe`(원하는 폭으로 고정)을 만들어 그 안에 앱을 로드하는 방식으로 375/768/1280px 폭을 흉내내어 스크린샷 검증함. Header/Men·Women/CategoryListing/ProductDetail/Cart/Order/MyPage/Wishlist/Login·Signup 전부 이 방식으로 확인 완료
  7. ProductDetail(1024px 분기 그대로 유지, 태블릿에서도 스택형이 맞다고 판단), Order/OrderItemRow, Wishlist, Login/Signup은 기존 코드가 이미 반응형으로 잘 되어 있어서 수정 없이 확인만 함
- **다음에 재확인하면 좋을 것**: 관리자 4종은 이번 반응형 작업 범위에서 의도적으로 제외함(스텁 상태라 디자인 자체가 없음)
- **이번 세션(오늘) 핵심 — 아래 "완료된 작업"에 없는 최신 내용**:
  1. 상품 상세페이지 바로구매/장바구니 버튼 동작 안 하던 버그 수정
  2. 컬러 스와치를 상품당 실제 촬영 색상 하나만(다중 가짜 옵션 제거) — `Product.color: {label, hex}` 필드로 전환, `src/mock/products.ts` 전 상품에 실제 사진 보고 색상/설명 직접 기재(모델 신장 문구는 넣지 않기로 확정)
  3. **위시리스트 신규 구현** — `WishlistContext`(localStorage), `/wishlist` 페이지, 상품카드 hover 시에만 하트 노출(찜한 상태여도 hover 전엔 항상 숨김), 비로그인도 사용 가능
  4. **로그인 게이팅 + 선택 모달** — `AuthModalContext` + `RequireAuth`(라우트 가드): 장바구니/주문/마이페이지는 로그인 필요, 클릭 시 바로 `/login` 리다이렉트가 아니라 "로그인이 필요합니다" 모달(로그인하기/닫기)을 띄움
  5. 마이페이지 로그아웃 버튼 → 확인 모달("로그아웃 하시겠습니까?") 추가
  6. **주문내역 실데이터 연결** — `OrderHistoryContext` 신규, 결제 완료 시 실제 주문이 저장되고 로그인 계정의 `userEmail`로 필터링돼 마이페이지 주문내역에 표시됨 (기존 `mock/orders.ts` 고정 목업 제거)
  7. 장바구니 6개 초과 시 "더보기" 버튼(전체 페이지 스크롤 방식, 내부 스크롤 아님) + 우측 결제요약 패널 `lg:sticky`. 위시리스트 카드 그리드 데스크탑 6열, 카드 하단 여백 조정
  8. Toast 애니메이션 버그 수정(슬라이드 후 오른쪽으로 순간이동하던 문제) — Tailwind v4의 `translate` 속성과 커스텀 `@keyframes`의 `transform` 충돌이 원인, `-translate-x-1/2` 유틸리티 제거+`animation-fill-mode: forwards` 추가로 해결
  9. **상의 - 후드 소분류 신규** — `public/images/products/{men,women}/hoodies/`에 사용자가 추가한 사진 4장으로 상품 4개 추가(`img()` 헬퍼에 확장자 파라미터 추가해 `.jpg` 지원)
  10. `CategoryListing`에 **소분류 필터 칩 UI** 추가(기본값 "전체") — 상의(셔츠/티셔츠/니트·스웨트/후드), 하의(데님/슬랙스/반바지)는 실존 상품 기준, **아우터는 코트 외 자켓·블레이저/패딩/가디건도 칩으로 노출**(아직 상품 없음 → 클릭 시 "0개 상품" 빈 상태, 사진 준비되면 상품만 추가하면 됨)
  11. 헤더/푸터 좌우 패딩을 본문 섹션과 동일하게 통일(`px-24 lg:px-80`) — 기존엔 헤더만 `px-32` 고정이라 어긋나 있었음
  12. **Figma 작업 시작** — 기획서 페이지 신규 제작 완료(아래 "Figma 연동 상태" 참고), Components 페이지에 Chip/Toast/Modal 컴포넌트 3종 신규 추가. 기존 5개 와이어프레임(MEN/Product Detail/Cart/Order/HOME)은 **아직 코드와 어긋난 채로 미수정** — 다음 세션에서 이어서 할 것(아래 참고)
- 저장소에 이미지가 많이 들어가 있어서 `.git` 용량이 약 97MB+ — 다른 컴퓨터에서 최초 `git clone` 시 예전보다 시간이 좀 걸릴 수 있음

## 다른 컴퓨터에서 이어서 작업하는 법
1. 프로젝트 폴더에서: 처음이면 `git clone https://github.com/dlwns990424-coder/shopping.git`, 이미 있으면 `git pull`
2. `npm install` (node_modules는 git에 없음)
3. **이 파일의 "다음 세션 시작 지점" 확인**
4. Figma 작업이 필요하면 그 컴퓨터에서 OAuth 재인증 필요 (기기별 세션이라 GitHub로 안 넘어옴): `plugin:figma:figma` MCP 도구(`authenticate`) 호출 → 뜨는 URL을 브라우저에서 열어 인가. 데스크톱 앱 설치는 불필요.
5. **`.env.local`은 gitignore 대상이라 안 넘어옴 — 이제 필수임(위 "새 환경에서 시작하기" 3번 참고), 없으면 사이트가 정상 동작 안 함**
6. `npm run dev`로 확인 (5173이 다른 프로젝트가 점유 중이면 자동으로 다른 포트로 뜸 — 터미널 로그에서 실제 포트 확인)

---

## 프로젝트 개요
- React(TypeScript) + Tailwind CSS + Supabase 기반 반응형 의류 쇼핑몰. 포트폴리오 + 학습 목적. (2026-09-04까지는 React(JS)+커스텀 CSS였다가 전면 마이그레이션함 — 아래 "기술 스택 전환" 섹션 참고)
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
- **파일 내 페이지**: Cover & Foundations(`0:1`), Components(`5:62`), Wireframe · User(`5:63`), **기획서(`129:2`, 2026-09-04 신규)**
- **와이어프레임 노드 id (`5:63` 페이지 하위) — ⚠️ 아래 5개는 최신 코드와 어긋난 상태로 아직 미수정**:
  - MEN: section `18:2` (frame `18:3`) — ⚠️ 실제 코드엔 있는 "THE ESSENTIAL LAYER" 에디토리얼 배너 섹션이 와이어프레임엔 빠져있음
  - Product Detail: section `42:100` (frame `42:101`) — ⚠️ 제품정보 텍스트에 "모델 신장 183cm, L 사이즈 착용" 문구가 아직 남아있음(실제 서비스는 모델 신장 미표기로 확정됐으니 지워야 함)
  - Cart: section `54:169` — `Cart / Desktop`(`54:170`), `Cart / Empty`(`54:306`) — ⚠️ "더보기"(6개 초과 시)/sticky 결제요약 반영 안 됨
  - Order: section `64:287` (frame `64:288`)
  - HOME: section `79:396` — ⚠️ **삭제 대상**: 실제 서비스는 "/"와 "/men"이 완전히 같은 페이지라 별도 HOME 화면이 없음
  - 이 5개 수정 작업(Phase 1)을 서브에이전트로 진행하다 사용자가 중단시켜서 미완료 상태로 남음 — 재개 시 위 항목들만 고치면 됨
  - **아직 와이어프레임 자체가 없는 페이지(Phase 2, 착수 전)**: WOMEN, Category Listing(소분류 칩 포함), Wishlist, Login, Signup, MyPage(탭형), Order Complete, Admin 4종
- **재사용 로컬 컴포넌트(Components 페이지 `5:62`)**: Header(`16:20`), Footer(`14:32`), Product Card(`10:49`), Category Card(`23:21`), Button(`7:83`), Hero Pill Button(`24:195`), Input(`7:112`), Checkbox(`10:16`), Badge(`10:28`), Swatch(`41:7`), Size Selector(`41:19`), Icon Button(`41:31`), Quantity Stepper(`52:177`), Cart Item Row(`52:203`), Order Item Row(`63:17`), **Chip(`125:10`, 소분류 필터용, 2026-09-04 신규)**, **Toast(`125:19`, 2026-09-04 신규)**, **Modal(`128:30`, LoginRequired/LogoutConfirm, 2026-09-04 신규)**. 폰트는 Noto Sans KR(Figma 내부용, 코드는 Pretendard)
- **기획서 페이지(`129:2`) — 2026-09-04 신규 완성**: Section1 서비스개요&페르소나(`129:3`, 포트폴리오목적/서비스목적 구분+페르소나 2명 특징·페인포인트·니즈·행동패턴) / Section2 IA(`129:5`) / Section3 화면별기능정의(`129:7`) / Section4 핵심사용자플로우(`129:9`) / Section5 데이터모델(`129:11`) / Section6 기술스택(`129:13`). "향후 계획"/"차별화 포인트" 섹션은 사용자 요청으로 의도적으로 뺌

---

## 완료된 작업

### 기술 스택 전환 — TypeScript + Tailwind CSS 전면 마이그레이션 (2026-09-04, 완료)
사용자 지시로 프로젝트 전체(컴포넌트 14개, 페이지 10개, 레이아웃, context, mock 데이터, utils, lib, 관리자 스텁 4개 — 약 60개 파일)를 `.jsx`/`.js`+개별 `.css` 구조에서 `.tsx`/`.ts`+Tailwind 유틸리티 클래스로 전면 재작성함. 기존 디자인/기능은 100% 동일하게 유지(픽셀 단위로 비교 확인함), 코드 스타일만 전환.
- **툴체인**: `typescript`, `@tailwindcss/vite`, `tailwindcss`(v4) 설치. `vite.config.js` → `.ts`(`tailwindcss()` 플러그인 추가), `tsconfig.json`/`tsconfig.app.json`(strict:true)/`tsconfig.node.json` 신규, `main.jsx`→`main.tsx`, `App.jsx`→`App.tsx`
- **Tailwind 스페이싱 스케일을 1px 기준으로 재정의**(`@theme { --spacing: 1px }`) — 이게 핵심 트릭: Tailwind 기본은 숫자 1 = 0.25rem(4px)이라 `p-4`가 16px가 되는데, 이 프로젝트는 기존 디자인 토큰이 전부 "숫자=px값"(spacing-64 = 64px 등)이었어서, 기준 단위를 1px로 바꿔버리면 `p-64`가 그대로 64px가 됨. 토큰에 없던 리터럴 값(20px, 15px, 6px 등)도 `p-20`처럼 그냥 숫자로 바로 씀(임의값 대괄호 문법 불필요)
- **컬러 토큰 재매핑**(`src/index.css`의 `@theme`) — 기존 12개 CSS 변수를 8개 Tailwind 컬러 키로 통합: `--color-bg-primary`/`--color-text-inverse`→`color-surface`, `--color-bg-secondary`→`color-surface-muted`, `--color-bg-inverse`→`color-inverse`, `--color-bg-placeholder`/`--color-border-default`→`color-line`, `--color-text-primary`/`--color-border-strong`→`color-primary`, `--color-text-secondary`→`color-secondary`, `--color-text-disabled`→`color-disabled`, `--color-point`/`-hover`/`-tint`는 그대로 유지. 사용 예: `bg-surface`, `text-secondary`, `border-line`
- **`radius-sm/md/lg`를 Tailwind 기본 스케일에 덮어써서** 기존 4px/8px/12px 값 그대로 `rounded-sm`/`rounded-md`/`rounded-lg`로 재사용
- **공용 클래스는 `@apply`로 유지** — 타이포 스케일(`.text-h1`~`.text-price`)과 페이지 레이아웃 패턴(`.page-section`, `.product-grid`, `.category-grid`)은 매 페이지마다 유틸리티를 풀어쓰지 않고 `src/index.css`의 `@layer components`에 그대로 재정의(내부만 Tailwind 유틸리티로 구현) — 클래스명이 그대로라 각 페이지 코드에서 여전히 `className="text-h2"`처럼 씀. 반응형 분기(1024px)는 Tailwind 기본 `lg:` breakpoint가 정확히 1024px라 그대로 매칭돼서 `lg:` prefix로 처리(모바일 우선 방식으로 재작성 — 기존 desktop-first `@media (max-width:1024px)`와 반대 방향이라 값 순서가 바뀜에 유의)
- **컴포넌트별 고유 스타일은 각 `.tsx` 안에 인라인 Tailwind 클래스로 직접 작성** — 예를 들어 `Checkbox`는 네이티브 input을 `sr-only`(Tailwind 내장 클래스, 기존 커스텀 `.sr-only`와 동일)로 숨기고 `peer`+`peer-checked:`로 체크 상태 스타일링, `Swatch`의 선택 링(box-shadow 2중)은 `ring-2 ring-offset-2` 조합으로 재현
- **타입 정의**: `src/types.ts` 신규(`Product`/`Category`/`ColorOption`/`User`/`CartItem`/`Order`/`AuthResult`/`SignupInput`). `AuthContext`가 `useAuth()` 호출 시 Provider 밖이면 에러를 던지도록 강화(런타임 동작은 동일, 타입에서 `user`가 항상 non-null인 것처럼 안전하게 씀)
- **검증**: `npx tsc -b` 에러 0건, `npm run lint`(oxlint) 신규 경고 0건(기존 무관 경고 1건만 존재), 브라우저로 전체 플로우(Men/Women 홈+카테고리 필터, ProductDetail 색상/사이즈 선택, 로그인/회원가입+Toast, Cart→Order→OrderComplete→MyPage 3탭) 재확인 완료 — 마이그레이션 전과 픽셀 단위로 동일하게 렌더링됨
- **주의**: 이 마이그레이션으로 이 문서의 이전 항목들(아래 섹션들)이 언급하는 `.jsx`/`.css` 경로는 실제로는 더 이상 존재하지 않음(전부 `.tsx`로 대체됨). 각 항목이 설명하는 기능 자체는 여전히 정확함

### Order / OrderComplete 페이지 신규 완료 (2026-09-04)
- Figma `64:288`("Order / Desktop") 기준으로 `src/pages/Order.tsx` 구현 — 배송지 카드(로그인 사용자의 `shippingName`/`shippingPhone`/`shippingAddress`가 있으면 표시, 없으면 "배송지 정보를 입력해주세요" + "입력하기"/"변경" 버튼으로 `/mypage?tab=settings` 이동), 주문상품(`OrderItemRow` 재사용, 읽기전용), 결제금액 패널(상품금액/배송비 고정 ₩3,000/총액 + 약관동의 체크박스로 게이팅되는 "결제하기" 버튼)
- **Cart → Order 데이터 흐름**: `Cart.tsx`의 "주문하기"가 `navigate('/order', { state: { items: selectedItems } })`로 체크된 상품만 전달. `Order.tsx`는 `location.state`에 items가 없으면(직접 URL 접근 등) `/cart`로 즉시 리다이렉트하는 가드 포함
- **주문완료 페이지 신규**(`src/pages/OrderComplete.tsx`, 라우트 `/order/complete`, Figma 디자인 없어 자체 구성) — 체크 아이콘(`lucide-react` `CheckCircle`, 브랜드 포인트 컬러)+"주문이 완료되었습니다"+주문 요약(상품 개수·총액)+"쇼핑 계속하기"(`/`)/"주문내역 보기"(`/mypage?tab=orders`) 버튼. `Order.tsx`의 "결제하기"가 `navigate(..., { replace: true })`로 이동해서 뒤로가기 시 `/order`가 아닌 `/cart`로 돌아감(중복결제 방지 의도). `state` 없이 직접 접근 시 `/`로 리다이렉트
- **(2026-09-04 갱신) 주문내역 실데이터 연결 완료** — 위 문장은 작성 당시 기준이며, 이후 세션에서 `OrderHistoryContext` 신규 구현으로 결제 완료 시 실제 주문이 저장되고 마이페이지 주문내역에 반영되도록 바뀜(`src/mock/orders.ts`는 삭제됨). 자세한 내용은 이 문서 최상단 "마지막 갱신" 참고
- 최소 높이 640px(모바일 480px)로 여백 조정(사용자 요청, 기존 Cart 빈 상태의 560px에서 분리)
- 브라우저로 Cart 부분선택→Order 표시 정확성→체크박스 게이팅→OrderComplete 요약→주문내역 이동, `/order`·`/order/complete` 직접 접근 가드까지 전체 플로우 확인 완료

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
- [x] **Men** — Hero(3분할 이미지, 100dvh)+에디토리얼 배너(NEW ARRIVAL 위, Home에 있던 것 재사용)+신상품 8개+카테고리 3개(아우터/상의/하의 — 아래 "카테고리 리스팅 페이지 + 카테고리 3종 확장" 항목 참고)
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
- `src/context/AuthContext.jsx` — `AuthProvider`(App.jsx에서 BrowserRouter 감쌈)가 `localStorage`에 계정 목록(`shop_users`)과 현재 세션(`shop_current_user`)을 저장하는 **완전 목업 인증**. `useAuth()`로 `{ user, signup, login, logout, updateProfile }` 어디서든 접근 가능
- **목적**: Supabase Auth 붙이기 전에 로그인/비로그인 상태별 화면 분기를 테스트하기 위함 (Cart/MyPage 등 이후 페이지 작업 시 필요)
- 모듈 로드 시 `ensureTestAccount()`가 `test@test.com` / `test1234` 계정을 없으면 한 번만 자동으로 심어둠 — 매번 회원가입 안 하고 로그인 상태 테스트 가능
- `updateProfile(updates)` — 로그인된 사용자의 닉네임/휴대폰/배송정보(수령인·연락처·주소, 신규 필드)를 계정 목록+세션 양쪽에 반영. MyPage 계정설정 폼에서 사용
- `Header.jsx`가 `user` 상태를 읽어서 반영: 비로그인 시 사람 아이콘 → `/login`, 로그인 시 사람 아이콘 → `/mypage`. **로그아웃 버튼은 헤더에서 제거함** — 로그아웃은 마이페이지에서만 가능(사용자 요청)
- 비밀번호는 평문으로 localStorage에 저장됨(순수 프론트 목업이라 허용) — **Supabase 연동 시 이 파일 전체를 실제 Supabase Auth 호출로 교체 예정**, 그때 기존 localStorage 데이터는 폐기됨
- Chrome 브라우저로 회원가입→로그인→헤더 상태 전환→로그아웃 전체 흐름 실제 동작 확인 완료
- [x] **Order / OrderComplete** — 완료 (위 "Order / OrderComplete 페이지 신규 완료" 섹션 참고)
- [ ] 관리자 4종(상품/주문/회원/매출관리) — 스텁(`.tsx`로 전환은 됐으나 내용은 그대로), 디자인 자체가 없어서 기능 위주로 심플하게 만들 예정

### 마이페이지 — 탭 구조로 전면 개편 완료 (2026-09-03)
- `/mypage?tab=settings|orders|recent` 쿼리 파라미터 방식(카테고리 리스팅과 동일 패턴)으로 좌측 탭 메뉴 + 우측 콘텐츠 2단 레이아웃(`MyPage.jsx`, `MyPage.css`, 1024px 이하는 1컬럼)
- `MyPageNav.jsx` — 계정 설정/주문 내역/최근 본 상품 탭 + 로그아웃(작게, 하단 별도)
- `AccountSettingsForm.jsx` — 닉네임/이메일(읽기전용)/휴대폰번호 + 배송정보(수령인/연락처/주소), 회원가입과 동일한 정규식 검증, 저장 시 Toast
- `OrderHistory.tsx` — (2026-09-04 갱신) `OrderHistoryContext`에서 실제 결제 완료된 주문을 로그인 계정의 `userEmail`로 필터링해 표시. `mock/orders.ts`는 삭제됨. Supabase 연동 시 이 Context 내부만 실제 쿼리로 교체하면 됨
- `RecentlyViewed.jsx` + `src/utils/recentlyViewed.js` — `ProductDetail` 방문 시 `localStorage`(`shop_recently_viewed`, 최대 8개)에 기록, 마이페이지에서 `ProductCard` 그리드로 표시. 실제로 동작하는 기능(스텁 아님)
- `.mypage-content`에 데스크톱 전용 `min-height: 600px`(가장 긴 탭 기준) — 탭 전환 시 Footer 위치가 들쭉날쭉하지 않도록. 1024px 이하 미디어쿼리에서는 `min-height: 0`으로 해제(모바일에서 빈 여백 방지)

### Footer / Header 아이콘 정리 (2026-09-03)
- Footer SOCIAL(Instagram/YouTube)은 아이콘 없이 텍스트 링크로(세로 정렬, 다른 컬럼과 동일 스타일) — lucide-react는 브랜드 로고를 제공하지 않아서(라이선스 이슈) 한 번 `react-icons`로 시도했다가 사용자 요청으로 다시 텍스트로 되돌림, `react-icons` 의존성도 제거함
- 상품 상세 찜하기 버튼: 손그림 커스텀 SVG → `lucide-react`의 `Heart` 아이콘

### 전역 레이아웃 버그 수정 (2026-09-03)
- `UserLayout.css`에 sticky-footer 패턴(`display:flex; flex-direction:column; min-height:100svh` + `main{flex:1}`) 적용 — 로그인처럼 콘텐츠 짧은 페이지에서 Footer가 뷰포트 하단에 붙지 않고 그 아래 빈 여백이 남던 문제 해결(모든 페이지 공통 적용)
- `Header.jsx`의 MEN/WOMEN 활성 탭 판정이 `/products/:id` 상세페이지에서는 안 먹던 버그 — `getActiveGender()`로 pathname이 상세페이지 패턴이면 목업에서 상품을 찾아 `gender`로 판정하도록 수정
- `ScrollToTop.jsx` 추가(`App.jsx`의 `BrowserRouter` 안) — 페이지 이동/카테고리 탭 전환(pathname+search 변경) 시 스크롤을 항상 맨 위로 리셋

### 상품 카드 관련 디자인 조정 (사용자 피드백, 여러 차례 수정 거침)
- 기본 상태엔 이미지만, 호버 시에만 이름/가격 오버레이 (Figma 원본과 동일하게 재수정함)
- 상하 카드 간격 0 + 각진 모서리(`border-radius:0`) — 위/아래 카드가 한 세트(상의+하의)로 이어지는 느낌
- 카드 크기는 `height:400px` 고정값 대신 **`aspect-ratio:3/4`** 사용 — 반응형에서 열 개수 바뀌어도 비율 유지됨 (고정 px는 반응형에서 찌그러짐 문제 있었음)
- 히어로 섹션 전체 `height:100dvh`

### 섹션 간격 정리 + 상품 임시 이미지 (2026-09-03)
- `.product-grid`/`.category-grid`(`src/index.css`)에 있던 `padding-bottom: var(--spacing-80)`를 제거함 — 각 `.page-section`은 위쪽 패딩(64px)만 갖고 있어서, 두 패딩이 겹치던 곳(예: Men/Women의 NEW ARRIVAL → SHOP BY CATEGORY)은 144px, 안 겹치던 곳(에디토리얼 배너 → NEW ARRIVAL)은 64px로 섹션마다 간격이 들쭉날쭉했음. 제거 후 모든 섹션 사이 간격이 64px(모바일 32px)로 일정해짐. ProductDetail의 "관련상품" 섹션도 같은 클래스를 써서 자동으로 함께 정리됨
- 위 정리 후 페이지 맨 마지막 섹션(Footer 바로 위, 예: Men/Women의 SHOP BY CATEGORY, ProductDetail의 관련상품)이 Footer와 너무 붙어 보인다는 피드백을 받아서, `.page-section:last-of-type { padding-bottom: var(--spacing-64); }`(모바일은 32px)를 추가함 — 페이지의 마지막 `.page-section`에만 아래쪽 여백을 더해서 어두운 Footer 배경과 자연스럽게 분리되도록 함. 다른 섹션 사이 간격(64px)은 그대로 유지
- `src/mock/products.js`의 16개 상품 전부에 `image` 필드 추가 — Lorem Picsum(`https://picsum.photos/seed/tl-p{id}/600/800`, 상품카드 비율 3:4와 동일)로 상품별 고정 시드를 줘서 새로고침해도 같은 이미지가 나오게 함. 실제 제품 사진이 아니라 UX 확인용 임시 이미지라는 점 명확히 함 — 외부 서비스라 오프라인/네트워크 차단 시 깨질 수 있음, Supabase Storage 연동 시 교체 예정

### 카테고리 리스팅 페이지 + 카테고리 3종 확장 (2026-09-03)
- `CategoryListing.jsx`(+`.css`) 신규 컴포넌트 — `?category=` 있을 때 Men/Women이 Hero/배너 없이 타이틀+탭+상품개수+그리드로 구성된 별도 레이아웃을 렌더링(기본 진입 NEW ARRIVAL은 기존 Hero 그대로 유지)
- Men/Women 페이지에 `useSearchParams`로 `?category=` 쿼리를 읽어 상품을 거르는 로직 (`src/pages/Men.jsx`, `Women.jsx`):
  - 쿼리 없음(기본 진입) → "NEW ARRIVAL" 제목, `slice(0, 8)`로 **최대 8개 고정** 미리보기, "더보기 +"가 실제 링크로 동작(`/men?category=all`)
  - `category=all` → "전체 상품" 제목, 해당 성별 상품 전체(캡 없음)
  - `category=아우터`/`상의`/`하의` → 그 카테고리만 필터링. 결과 없으면 "해당 카테고리에 상품이 없습니다." 표시
- **카테고리를 상의/하의 2종 → 아우터/상의/하의 3종으로 재확장** (`src/mock/categories.js`, `CategoryListing.jsx`의 `TABS`, `index.css`의 `.category-grid`를 3열로) — 사용자가 `first-shop/img/clothing`에 카테고리별 실제 상품 사진(코트/셔츠/티셔츠/니트·스웨트/데님/슬랙스/반바지, 성별×7종×4장=56장)을 제공해서 가능해짐. 아우터=코트, 상의=셔츠·티셔츠·니트·스웨트, 하의=데님·슬랙스·반바지로 매핑(사용자 확정)
- "SHOP BY CATEGORY" 타일(`src/mock/categories.js`)은 필터 상태와 무관하게 항상 노출 — 진입점 역할. 대표 이미지도 추가함(`image` prop, 기존엔 `Men.jsx`/`Women.jsx`가 `CategoryCard`에 이 prop을 안 넘겨서 계속 회색이었던 버그도 같이 고침)

### 상품 이미지 실제 사진으로 교체 (2026-09-03)
- 이미지 56장을 `public/images/products/{men,women}/{coats,shirts,tshirts,tops,jeans,trousers,shorts}/`로 프로젝트에 복사, `src/mock/products.js`를 16개(Picsum 임시 이미지) → **56개(성별 28개, 카테고리당 4개)** 전면 교체. 상품마다 `category`(아우터/상의/하의)와 `subCategory`(코트/셔츠/티셔츠/니트·스웨트/데님/슬랙스/반바지) 필드 둘 다 가짐 — `subCategory`는 아직 UI에서 안 쓰지만 나중에 카테고리 내 필터(앞으로 해야 할 것 7번)에 바로 쓸 수 있게 미리 넣어둠
- **이미지가 가로형(4:3, 1448×1086)인데 상품카드/카테고리카드는 세로형(3:4, 4:5)이라 `background-size: cover`를 쓰면 옷이 크게 확대되며 잘리는 문제 발생** → `ProductCard.css`/`CategoryCard.css`/`ProductDetail.css` 전부 `background-size: contain`(+`background-repeat: no-repeat`)으로 변경, 배경색도 사진의 연한 회색 배경과 어울리게 `--color-bg-placeholder`(진한 회색) → `--color-bg-secondary`(연한 회색 `#f5f5f5`)로 변경. 옷 전체가 잘리지 않고 카드 안에 레터박스 형태로 표시됨
- `ProductDetail.jsx`의 상세 이미지 3칸도 그동안 배경색만 있고 실제 이미지 바인딩이 아예 없었음(빈 회색 박스) — `product.image`를 연결해서 보이게 함(사진이 상품당 1장뿐이라 3칸 다 같은 사진 반복, 여러 각도 사진은 없음)
- **주의**: 이미지 56장 총 용량 **82MB**(장당 1.2~1.7MB, 원본 그대로 사용) — 리사이즈/webp 변환 등 최적화는 의도적으로 미루기로 함(사용자 확인), 아래 "앞으로 해야 할 것" 참고

### 카테고리 리스팅 페이지 상품카드 — hover 제거, 정보 항상 노출 (2026-09-03)
- `ProductCard.jsx`에 `showInfo` prop 추가 — 기본값(false)은 기존과 동일(이미지 위 hover 오버레이로 이름/가격), `showInfo`를 켜면 hover 오버레이 대신 이미지 **아래**에 이름/가격을 항상 노출하는 정적 레이아웃으로 전환(`CategoryCard`와 같은 패턴)
- `CategoryListing.jsx`에서만 `showInfo`를 켜서 사용 — 홈 NEW ARRIVAL, 상세페이지 관련상품, 마이페이지 최근 본 상품은 영향 없이 기존 hover 방식 그대로
- `CategoryListing.css`에 `.category-listing .product-grid { row-gap: var(--spacing-32) }` 추가 — 전역 `.product-grid`(다른 곳에서 쓰는 `row-gap: 0`)는 안 건드리고 카테고리 리스팅 페이지 안에서만 위아래 카드 간격을 벌림

### 데이터
- 목업만 사용 중: `src/mock/products.js`(56개, gender/category/subCategory 포함, 실제 상품 사진), `categories.js`(3종), `productDetail.js`(컬러3/사이즈5/설명 — 모든 상품 공용, 상품별로 다르진 않음), `orders.js`(주문 2건, 계정과 연결 안 됨)
- Supabase 실제 테이블/Storage/`.env` 키 — **전부 미착수**

### 알아둘 것
- 콘솔에 가끔 뜨는 정체불명 `[EXCEPTION] Object`는 브라우저 자동화 확장 자체의 메시징 노이즈로 확인됨(1건은 "message channel closed" 메시지 포함) — 앱 코드 문제 아님, 매번 페이지는 정상 동작 확인함

---

## 다음 세션 시작 지점 (2026-09-09 기준, 최신 — 다른 컴퓨터에서 이어서 작업 예정)
**코드는 이번 세션 작업분까지 전부 커밋+push 완료.** SQL은 007~010번까지 전부 사용자가 Supabase SQL Editor에서 실행 확인 완료(밀린 것 없음). 이번 세션에 한 것:

- **주문 상태 모델 리팩토링**: `Order.status`(단일 필드) → `shippingStatus`(결제완료~취소) + `returnStatus`(반품요청~반품완료, 선택) 두 필드로 분리. 예전엔 반품 시작되면 "배송완료였다"는 사실이 사라지는 버그가 있었음, 이제 해결됨
- **취소 기능**: 고객(마이페이지)·관리자(주문관리) 양쪽에 취소 버튼 + 확인모달, 취소 가능 상태(`결제완료`+`배송준비`)를 `orderStats.ts`의 `CANCELABLE_SHIPPING_STATUSES`로 공유
- **반품 기능 신규**: 배송완료 → 반품요청(고객 제출, 사유+사진 필수) → 반품접수(관리자 승인) → 반품완료(3단계). 7일 반품기간 제한(`RETURN_WINDOW_DAYS`), 대시보드에 반품요청 건수 KPI(강조 표시)
- **배송비 버그 수정**: 주문 저장 시 `shippingFee`가 안 남아서 마이페이지/관리자 매출 집계가 항상 배송비만큼 덜 잡히던 버그 수정
- **위시리스트 개편**: 카드에 인라인 사이즈선택+"장바구니 담기" 버튼 추가(개별), "선택" 버튼 눌러야 체크박스 나오는 선택모드로 전환 + 선택삭제(일괄 장바구니 담기는 애매해서 뺌). 모바일에서 하트 버튼 크기도 반응형으로(터치영역 32px 유지, 시각적 원만 24px로 축소)
- **히어로/카테고리 UI**: Home/Men/Women 히어로 타이틀 크기·굵기, 젠더배너·이벤트배너 CTA 영문화+즉시 hover, 카테고리 카드 그라디언트+흰 텍스트, Men/Women 히어로 높이를 Home과 동일하게(h-screen), 카테고리 카드 라벨/이미지 관리자 편집 기능 추가
- **헤더**: 히어로 페이지 투명 헤더에 hover 시에도 불투명해지는 동작 추가(기존엔 스크롤해야만 불투명해졌음)
- **크롭 도구**: 히어로 이미지 크롭 시 상단에 "헤더에 가려짐" 위험영역 표시 추가, `women-hero.jpg` 실제로 크롭해서 women 히어로 데스크톱에 적용 완료(**모바일용은 아직 안 올림**)
- **여성 상품 hover 이미지**: 전체 30개 상품(coat/shirt/knit/denim/tshirt/hoodie/slacks/shorts) hover_image 연결 + 기본↔hover 이미지 자리 스왑(착용컷이 기본, 플랫레이가 hover) — **men은 아직 착용컷 자체가 없어서 그대로 플랫레이만**
- 상품 설명에서 사이즈별로 실제로 다른데 고정값으로 나오던 실측치(어깨너비/허리단면 등) 전부 제거
- 푸터 하위 텍스트가 카테고리 라벨보다 밝아서 위계가 거꾸로였던 것 수정(색상만 낮춤)

**작은 미결정 사항**: 위시리스트 카드의 "찜 해제" 버튼이 하트 아이콘인데, 이 페이지는 다 이미 찜한 상품이라 "찜 상태 표시"로서는 의미 없다는 지적 있었음 — X 아이콘으로 바꾸는 안을 냈으나 사용자가 "우선 냅두자"로 보류함. 다음에 다시 논의.

**작업 방식(계속 적용)**: 이해 안 되거나 애매하면 먼저 되물어보고, 확정 지시 전엔 실행하지 않는다. "검증/점검"은 코드를 실제로 읽고 로직을 추적 + 가능하면 브라우저로 실제 클릭까지 확인. alert/confirm/prompt 절대 금지, 항상 모달 컴포넌트로. SQL은 채팅에 붙여넣지 말고 항상 `.sql` 파일로 저장해서 Supabase SQL Editor 탭 이름(NN_설명)과 함께 전달.

## 앞으로 해야 할 것 (우선순위 순, 2026-09-09 갱신)
1. **women 히어로 모바일 이미지 업로드** — 데스크톱은 이번에 끝냈지만 모바일용(`women.hero.image_mobile`)은 아직 비어서 데스크톱 이미지로 폴백 중
2. men 상품 hover 이미지(착용컷) — 아직 하나도 없음. 다 채운 뒤 women처럼 기본↔hover 스왑할지도 결정 필요(보류 중이던 이미지 최적화 작업도 이거 끝나면 진행하기로 함)
3. `products`/`site_content`/`images` RLS를 "쓰기는 관리자만"으로 강화(배포 전 필수, anon key 노출 상태라 지금은 누구나 데이터 조작 가능)
4. 본인 비밀번호 변경/찾기 기능 — Supabase Auth `updateUser`/`resetPasswordForEmail` 기반으로 설계는 논의됐으나 "배포 전에 다시 생각해보자"로 보류
5. 상품 이미지 최적화(리사이즈/webp) — men hover 이미지 다 채운 뒤 진행하기로 보류
6. 위시리스트 하트→X 아이콘 변경 여부 결정 (위 참고)
7. 반품 부분취소(상품 단위) — 보류 중, 별도 설계 필요
8. ~~카테고리 리스팅 페이지네이션/무한스크롤~~ — **완료(2026-09-09 세 번째 세션)**, `CategoryListing.tsx`에 "더보기" 버튼형으로 구현됨
9. Figma 와이어프레임을 최신 코드에 맞게 재정합 — 격차 계속 벌어지는 중, 재개 요청 있을 때까지 대기
10. 반응형 실기기 정밀 검증(이 환경 브라우저 자동화가 실제 창 리사이즈를 지원하지 않아 iframe 트릭으로만 확인해옴)
9. `allowJs` 꺼둔 상태 유지(전체 `.ts`/`.tsx`), 실수로 `.js`/`.jsx` 재유입 주의
