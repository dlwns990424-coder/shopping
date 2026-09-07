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
4. `npm run dev`로 로컬 서버 실행
5. 테스트 계정(로그인 시 자동 생성됨, 별도 설정 불필요): 일반 `test@test.com` / `test1234`, 관리자 `admin@test.com` / `admin1234`

## 마지막 갱신
- 날짜: 2026-09-08
- **git 상태: 커밋 완료**(`23ac16f`), 미커밋 변경 없음.
- **이미지 업로드 방식 도입 — 상품관리 + 콘텐츠 관리 (2026-09-08)**: 상품/배너 이미지를 "URL 직접 입력"에서 실제 서비스(Shopify/카페24 등)처럼 "내 컴퓨터에서 파일 선택 → 자동 업로드" 방식으로 전환:
  1. **Supabase Storage `images` 버킷 신규**(전체공개, `products`/`site_content`와 동일하게 RLS 전체 허용 정책) — `insert into storage.buckets`+`storage.objects` 정책 4종 SQL을 사용자가 직접 실행
  2. **`src/utils/uploadImage.ts` 공용 유틸** — 파일을 받아 Storage에 업로드하고 공개 URL을 반환. 상품/콘텐츠 양쪽에서 재사용
  3. **`ProductManage.tsx`**: "이미지 URL" 텍스트 입력 → 파일 선택+미리보기로 교체(`images/products/` 폴더), 목록에도 썸네일 컬럼 추가
  4. **`site_content`에 이미지 슬롯 12개 추가**(`.image`로 끝나는 key 컨벤션, 스키마 변경 없이 기존 텍스트 컬럼 재사용) — Men/Women 히어로+세일배너, Home 히어로/시즌배너/MEN·WOMEN배너/이벤트배너4개. 기존 하드코딩 값(외부 URL 또는 없음)을 그대로 시딩해서 시각적으로 아무것도 안 바뀐 상태로 시작, 관리자가 업로드하면 그때부터 교체됨
  5. **`ContentManage.tsx`**: key가 `.image`로 끝나면 텍스트 수정 대신 파일 업로드+미리보기 UI로 자동 분기(`images/content/` 폴더), 선택 즉시 저장(별도 저장 버튼 없음)
  6. **`window.confirm` 네이티브 alert 제거** — 삭제 확인에 쓰던 `window.confirm`이 브라우저 자동화 도구를 멈추게 하는 문제를 겪은 김에, `MyPage.tsx`의 로그아웃 확인 모달과 동일한 디자인의 공용 `ConfirmModal.tsx`로 통일(앞으로 확인창 필요한 곳은 전부 재사용)
  7. **검증**: 상품 이미지 업로드 → 저장 → 목록 반영 확인(테스트 상품 생성 후 삭제, Storage 파일도 정리). 콘텐츠 관리에서 "홈 이벤트배너 3(데님) 이미지" 업로드 → Home 페이지에 실제 반영 확인(테스트 후 원복). `npx tsc -b` 에러 0건, `npm run lint` 신규 경고 0건
  8. **다음 단계**: 이미지 삭제(원래 색상 블록으로 되돌리기) UI는 아직 없음(필요 시 직접 빈 문자열로 업데이트해야 함). RLS는 여전히 전체 공개 상태 — 배포 전 강화 필요
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

## 다음 세션 시작 지점 (2026-09-05 기준, 최신)
**코드 쪽은 커밋+push 완료 예정, 워킹트리 클린.** 다음 세션은 아래부터 이어가면 됨:
1. **Home 페이지 배너 이미지 작업** — `public/images/hero/`에 사용자가 모델 착용 사진 4장을 새로 추가함(`women-coat-02-model-01.png`/`-v2.png`, `women-coat-02-model-02.png`/`-v2.png`, WOMEN 배너용으로 보임). **아직 `Home.tsx`에 연결 안 됨** — 지금은 색상 블록 placeholder 상태 그대로. 이미지 방향 추천안(젠더 배너 2개는 라이프스타일 사진, 이벤트 배너 4개는 기존 카탈로그 상품사진 재활용)을 사용자에게 전달했고, 다음에 이어서: (a) 이 사진들을 WOMEN 배너에 적용할지 확인, (b) MEN 배너용 사진도 필요, (c) 이벤트 배너 4개는 기존 상품 사진 재활용 여부 결정
2. Figma 작업 — 사용자가 명시적으로 "보류하자"고 해서 손대지 않은 상태. 재개 요청 있을 때까지 대기
3. 아우터 소분류(자켓·블레이저/패딩/가디건) — 사진 없어서 칩만 만들어두고 실제 상품은 비어있음
4. **작업 방식 재확인**: 이 세션에서 사용자가 "임의로 판단해서 작업하지 말고 항상 컨펌받은 다음에 작업해"라고 강하게 요청함 — 다음 세션에서도 계속 적용, 구체적 스펙을 줘도 실행 전 반드시 "진행해"류의 명시적 확인을 받을 것
5. 그 외 우선순위는 아래 "앞으로 해야 할 것" 참고

## 앞으로 해야 할 것 (전체, 우선순위 순)
1. 관리자 4종 (기능 위주, 디자인 없이) — 지금은 제목만 있는 완전 스텁
2. Supabase 실연동: 테이블 스키마 설계(profiles/products/cart_items/orders/order_items) → 생성 → Storage 버킷 → 각 페이지 mock을 실제 쿼리로 교체 → `.env` 키 입력(기기마다). MyPage 주문내역/배송정보, 방금 완료한 주문완료 플로우도 이 단계에서 실 데이터로 연결
3. Supabase Auth 연결 (이메일/비밀번호), 로그인 상태 기반 라우트 보호. `src/context/AuthContext.tsx`의 localStorage 기반 로직을 실제 `signUp`/`signInWithPassword`/`signOut` 호출로 교체
4. 반응형 정밀 검증 (Tailwind `lg:`(1024px) 브레이크포인트로 재작성은 했으나, 이 환경의 브라우저 자동화 도구가 창 리사이즈를 지원하지 않아 모바일 폭에서 실제 스크린샷 검증은 못 함 — 실기기/개발자도구에서 확인 필요)
5. 카테고리 리스팅 페이지(`CategoryListing`) 필터 기능 — 사이즈/가격대 등. 상품에 `subCategory` 필드는 이미 있어서(코트/셔츠/티셔츠/니트·스웨트/데님/슬랙스/반바지) 카테고리 내 세부 필터로 바로 활용 가능
6. 카테고리 리스팅 페이지 페이지네이션 또는 무한스크롤 — 지금은 카테고리당 최대 12개(코트만 4개)라 아직 급하지 않지만, 상품 수 더 늘어나면 필요
7. **상품 이미지 최적화** — `public/images/products/` 56장, 총 82MB(원본 그대로 사용 중). 리사이즈(카드에 필요한 해상도로 축소)/webp 변환 등 필요, 지금은 의도적으로 미룸(사용자 확인). 사용자가 이미지 비율(가로형→세로형 크롭) 수정 작업을 별도로 진행 중이라고 함(2026-09-03) — 다음에 새 이미지로 교체될 수 있음
8. 카테고리 리스팅 페이지 상품카드 hover 인터랙션 추가 — 2026-09-03에 사용자 요청으로 hover 제거하고 이미지+이름+가격을 항상 노출하는 정적 카드로 바꿈(`ProductCard`의 `showInfo` prop). 나중에 사용자가 어떤 hover 효과를 원하는지 알려주면 그때 추가
9. `allowJs`를 껐으니(전체 `.ts`/`.tsx` 전환 완료) 이후 실수로 `.js`/`.jsx` 파일이 다시 섞이지 않는지 주의
