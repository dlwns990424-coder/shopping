import type { Gender, Product } from '../types'

function img(gender: Gender, folder: string, file: string, index: number) {
  const num = String(index).padStart(2, '0')
  return `/images/products/${gender}/${folder}/${gender}-${file}-${num}.png`
}

export const products: Product[] = [
  // ── MEN · 아우터 · 코트 ──
  {
    id: 'men-coat-1', name: '오버핏 울 코트', price: '₩198,000', gender: 'men', category: '아우터', subCategory: '코트',
    image: img('men', 'coats', 'coat', 1), color: { label: '카멜', hex: '#b08968' },
    description: '여유로운 오버핏 실루엣의 싱글 브레스티드 울 코트. 노치 카라와 웰트 포켓으로 클래식한 무드를 살렸습니다.\n어깨너비 52cm · 가슴단면 62cm · 총장 100cm\n울 70% · 폴리에스터 30%\n드라이클리닝 권장',
  },
  {
    id: 'men-coat-2', name: '더블브레스티드 코트', price: '₩228,000', gender: 'men', category: '아우터', subCategory: '코트',
    image: img('men', 'coats', 'coat', 2), color: { label: '차콜', hex: '#3a3a3a' },
    description: '차콜 톤의 더블 브레스티드 코트. 피크드 라펠과 여섯 개 버튼으로 정갈한 인상을 더합니다.\n어깨너비 51cm · 가슴단면 60cm · 총장 98cm\n울 80% · 나일론 20%\n드라이클리닝 권장',
  },
  {
    id: 'men-coat-3', name: '벨티드 트렌치코트', price: '₩189,000', gender: 'men', category: '아우터', subCategory: '코트',
    image: img('men', 'coats', 'coat', 3), color: { label: '네이비', hex: '#1f2a44' },
    description: '네이비 컬러의 벨티드 맥코트. 카라와 커프스 탭 디테일로 캐주얼하게 연출하기 좋습니다.\n어깨너비 50cm · 가슴단면 58cm · 총장 96cm\n폴리에스터 65% · 코튼 35%\n드라이클리닝 권장',
  },
  {
    id: 'men-coat-4', name: '싱글 브레스티드 코트', price: '₩179,000', gender: 'men', category: '아우터', subCategory: '코트',
    image: img('men', 'coats', 'coat', 4), color: { label: '베이지', hex: '#a9927a' },
    description: '벨트로 허리 라인을 조절할 수 있는 싱글 브레스티드 트렌치코트. 뉴트럴한 베이지 톤이라 활용도가 높습니다.\n어깨너비 51cm · 가슴단면 61cm · 총장 102cm\n코튼 60% · 폴리에스터 40%\n드라이클리닝 권장',
  },

  // ── MEN · 상의 · 셔츠 ──
  {
    id: 'men-shirt-1', name: '옥스포드 셔츠', price: '₩59,000', gender: 'men', category: '상의', subCategory: '셔츠',
    image: img('men', 'shirts', 'shirt', 1), color: { label: '화이트', hex: '#ffffff' },
    description: '화이트 옥스포드 원단의 버튼다운 셔츠. 톡톡한 조직감으로 사계절 활용하기 좋습니다.\n어깨너비 47cm · 가슴단면 56cm · 소매길이 62cm\n코튼 100%\n드라이클리닝 또는 손세탁 권장',
  },
  {
    id: 'men-shirt-2', name: '스트라이프 셔츠', price: '₩65,000', gender: 'men', category: '상의', subCategory: '셔츠',
    image: img('men', 'shirts', 'shirt', 2), color: { label: '차콜', hex: '#3a3a3a' },
    description: '차콜 톤의 잔잔한 패턴 오버셔츠. 여유로운 박스 핏으로 레이어드하기 좋습니다.\n어깨너비 49cm · 가슴단면 58cm · 소매길이 61cm\n코튼 80% · 폴리에스터 20%\n드라이클리닝 권장',
  },
  {
    id: 'men-shirt-3', name: '리넨 블렌드 셔츠', price: '₩69,000', gender: 'men', category: '상의', subCategory: '셔츠',
    image: img('men', 'shirts', 'shirt', 3), color: { label: '라이트블루', hex: '#a9c6dd' },
    description: '리넨이 섞여 시원한 착용감의 라이트 블루 셔츠. 자연스러운 구김이 캐주얼한 무드를 냅니다.\n어깨너비 46cm · 가슴단면 55cm · 소매길이 60cm\n리넨 55% · 코튼 45%\n손세탁 권장',
  },
  {
    id: 'men-shirt-4', name: '오버셔츠', price: '₩72,000', gender: 'men', category: '상의', subCategory: '셔츠',
    image: img('men', 'shirts', 'shirt', 4), color: { label: '네이비', hex: '#1f2d4d' },
    description: '네이비 스트라이프 패턴의 오버셔츠. 체스트 포켓 디테일로 캐주얼한 무드를 더했습니다.\n어깨너비 50cm · 가슴단면 59cm · 소매길이 62cm\n코튼 100%\n드라이클리닝 권장',
  },

  // ── MEN · 상의 · 티셔츠 ──
  {
    id: 'men-tshirt-1', name: '오버사이즈 티셔츠', price: '₩39,000', gender: 'men', category: '상의', subCategory: '티셔츠',
    image: img('men', 'tshirts', 'tshirt', 1), color: { label: '화이트', hex: '#ffffff' },
    description: '화이트 컬러의 오버사이즈 크루넥 티셔츠. 두툼한 저지 원단으로 핏이 안정적입니다.\n어깨너비 54cm · 가슴단면 60cm · 총장 68cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'men-tshirt-2', name: '헤비웨이트 반팔 티셔츠', price: '₩42,000', gender: 'men', category: '상의', subCategory: '티셔츠',
    image: img('men', 'tshirts', 'tshirt', 2), color: { label: '블랙', hex: '#2b2b2b' },
    description: '가먼트 다잉 워싱으로 빈티지한 무드를 낸 헤비웨이트 반팔 티셔츠.\n어깨너비 53cm · 가슴단면 59cm · 총장 67cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'men-tshirt-3', name: '크루넥 티셔츠', price: '₩35,000', gender: 'men', category: '상의', subCategory: '티셔츠',
    image: img('men', 'tshirts', 'tshirt', 3), color: { label: '네이비', hex: '#232837' },
    description: '네이비 컬러의 베이직 크루넥 반팔 티셔츠. 적당한 여유핏으로 데일리하게 입기 좋습니다.\n어깨너비 52cm · 가슴단면 58cm · 총장 66cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'men-tshirt-4', name: '포켓 티셔츠', price: '₩38,000', gender: 'men', category: '상의', subCategory: '티셔츠',
    image: img('men', 'tshirts', 'tshirt', 4), color: { label: '베이지', hex: '#d8c6a8' },
    description: '베이지 톤의 립 조직 반팔 티셔츠. 가슴 포켓 디테일로 포인트를 줬습니다.\n어깨너비 48cm · 가슴단면 54cm · 총장 65cm\n코튼 95% · 폴리우레탄 5%\n드라이클리닝 권장',
  },

  // ── MEN · 상의 · 니트·스웨트 ──
  {
    id: 'men-knit-1', name: '크루넥 니트', price: '₩69,000', gender: 'men', category: '상의', subCategory: '니트·스웨트',
    image: img('men', 'tops', 'top', 1), color: { label: '차콜', hex: '#3a3a3a' },
    description: '차콜 컬러의 베이직 크루넥 니트. 촘촘한 게이지로 보온성이 좋습니다.\n어깨너비 50cm · 가슴단면 57cm · 총장 66cm\n울 50% · 아크릴 50%\n드라이클리닝 권장',
  },
  {
    id: 'men-knit-2', name: '오버핏 스웨트셔츠', price: '₩65,000', gender: 'men', category: '상의', subCategory: '니트·스웨트',
    image: img('men', 'tops', 'top', 2), color: { label: '베이지', hex: '#d9cdb8' },
    description: '오트밀 베이지 톤의 오버핏 스웨트셔츠. 안감 기모로 부드러운 촉감입니다.\n어깨너비 55cm · 가슴단면 61cm · 총장 69cm\n코튼 80% · 폴리에스터 20%\n드라이클리닝 권장',
  },
  {
    id: 'men-knit-3', name: '하프집업 니트', price: '₩79,000', gender: 'men', category: '상의', subCategory: '니트·스웨트',
    image: img('men', 'tops', 'top', 3), color: { label: '네이비', hex: '#1c2740' },
    description: '네이비 컬러의 하프집업 스웨트셔츠. 스탠드 카라로 목선을 깔끔하게 정리합니다.\n어깨너비 53cm · 가슴단면 60cm · 총장 68cm\n코튼 75% · 폴리에스터 25%\n드라이클리닝 권장',
  },
  {
    id: 'men-knit-4', name: '케이블 니트', price: '₩85,000', gender: 'men', category: '상의', subCategory: '니트·스웨트',
    image: img('men', 'tops', 'top', 4), color: { label: '그레이', hex: '#c7c7c7' },
    description: '그레이 톤의 케이블 패턴 니트. 클래식한 무늬로 자켓 이너로도 활용하기 좋습니다.\n어깨너비 51cm · 가슴단면 58cm · 총장 67cm\n울 40% · 아크릴 60%\n드라이클리닝 권장',
  },

  // ── MEN · 하의 · 데님 ──
  {
    id: 'men-denim-1', name: '스트레이트 데님', price: '₩79,000', gender: 'men', category: '하의', subCategory: '데님',
    image: img('men', 'jeans', 'jeans', 1), color: { label: '블랙워시', hex: '#2e2e2e' },
    description: '블랙 워싱의 스트레이트 핏 데님. 은은한 워시감으로 활용도가 높습니다.\n허리단면 41cm · 밑위 30cm · 밑단너비 20cm\n코튼 99% · 폴리우레탄 1%\n찬물 손세탁 권장',
  },
  {
    id: 'men-denim-2', name: '와이드 데님', price: '₩85,000', gender: 'men', category: '하의', subCategory: '데님',
    image: img('men', 'jeans', 'jeans', 2), color: { label: '미드블루', hex: '#4a6b8a' },
    description: '미드 블루 톤의 와이드 핏 데님. 여유로운 실루엣으로 캐주얼하게 매치하기 좋습니다.\n허리단면 42cm · 밑위 32cm · 밑단너비 24cm\n코튼 100%\n찬물 손세탁 권장',
  },
  {
    id: 'men-denim-3', name: '슬림 테이퍼드 데님', price: '₩75,000', gender: 'men', category: '하의', subCategory: '데님',
    image: img('men', 'jeans', 'jeans', 3), color: { label: '다크인디고', hex: '#1c2436' },
    description: '다크 인디고 컬러의 슬림 테이퍼드 데님. 발목으로 갈수록 좁아지는 라인입니다.\n허리단면 39cm · 밑위 28cm · 밑단너비 17cm\n코튼 98% · 폴리우레탄 2%\n찬물 손세탁 권장',
  },
  {
    id: 'men-denim-4', name: '워시드 블랙 데님', price: '₩82,000', gender: 'men', category: '하의', subCategory: '데님',
    image: img('men', 'jeans', 'jeans', 4), color: { label: '라이트워시', hex: '#a8c4d9' },
    description: '라이트 워싱의 스트레이트 데님. 색 빠짐이 자연스러운 빈티지 무드입니다.\n허리단면 41cm · 밑위 29cm · 밑단너비 19cm\n코튼 100%\n찬물 손세탁 권장',
  },

  // ── MEN · 하의 · 슬랙스 ──
  {
    id: 'men-slacks-1', name: '와이드 슬랙스', price: '₩79,000', gender: 'men', category: '하의', subCategory: '슬랙스',
    image: img('men', 'trousers', 'trousers', 1), color: { label: '블랙', hex: '#2a2a2a' },
    description: '블랙 컬러의 와이드 슬랙스. 프론트 턱 디테일로 여유로운 실루엣을 살렸습니다.\n허리단면 40cm · 밑위 32cm · 밑단너비 24cm\n폴리에스터 70% · 레이온 30%\n드라이클리닝 권장',
  },
  {
    id: 'men-slacks-2', name: '스트레이트 슬랙스', price: '₩75,000', gender: 'men', category: '하의', subCategory: '슬랙스',
    image: img('men', 'trousers', 'trousers', 2), color: { label: '다크브라운', hex: '#3f342c' },
    description: '다크 브라운 컬러의 와이드 슬랙스. 부드러운 소재로 떨어지는 라인이 편안합니다.\n허리단면 39cm · 밑위 29cm · 밑단너비 22cm\n폴리에스터 65% · 레이온 35%\n드라이클리닝 권장',
  },
  {
    id: 'men-slacks-3', name: '테이퍼드 슬랙스', price: '₩78,000', gender: 'men', category: '하의', subCategory: '슬랙스',
    image: img('men', 'trousers', 'trousers', 3), color: { label: '카키베이지', hex: '#c8ad7f' },
    description: '카키 베이지 톤의 테이퍼드 슬랙스. 캐주얼한 치노 소재로 데일리하게 입기 좋습니다.\n허리단면 38cm · 밑위 28cm · 밑단너비 18cm\n코튼 97% · 폴리우레탄 3%\n드라이클리닝 권장',
  },
  {
    id: 'men-slacks-4', name: '플리츠 슬랙스', price: '₩82,000', gender: 'men', category: '하의', subCategory: '슬랙스',
    image: img('men', 'trousers', 'trousers', 4), color: { label: '블랙', hex: '#2a2a2a' },
    description: '블랙 컬러의 슬림 테이퍼드 슬랙스. 깔끔한 핀턱으로 단정한 라인을 냅니다.\n허리단면 38cm · 밑위 27cm · 밑단너비 17cm\n폴리에스터 68% · 레이온 32%\n드라이클리닝 권장',
  },

  // ── MEN · 하의 · 반바지 ──
  {
    id: 'men-shorts-1', name: '버뮤다 반바지', price: '₩55,000', gender: 'men', category: '하의', subCategory: '반바지',
    image: img('men', 'shorts', 'shorts', 1), color: { label: '블랙', hex: '#2a2a2a' },
    description: '블랙 컬러의 테일러드 버뮤다 반바지. 무릎 위 길이로 단정하게 연출됩니다.\n허리단면 40cm · 밑위 31cm · 총장 48cm\n폴리에스터 70% · 레이온 30%\n드라이클리닝 권장',
  },
  {
    id: 'men-shorts-2', name: '치노 반바지', price: '₩49,000', gender: 'men', category: '하의', subCategory: '반바지',
    image: img('men', 'shorts', 'shorts', 2), color: { label: '카키', hex: '#cbb188' },
    description: '카키 톤의 치노 반바지. 튼튼한 면 트윌 원단으로 활동성이 좋습니다.\n허리단면 39cm · 밑위 28cm · 총장 45cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'men-shorts-3', name: '와이드 반바지', price: '₩52,000', gender: 'men', category: '하의', subCategory: '반바지',
    image: img('men', 'shorts', 'shorts', 3), color: { label: '블루데님', hex: '#3d5875' },
    description: '미드 블루 데님 소재의 와이드 반바지. 여유로운 핏으로 편안하게 착용할 수 있습니다.\n허리단면 41cm · 밑위 30cm · 총장 47cm\n코튼 100%\n찬물 손세탁 권장',
  },
  {
    id: 'men-shorts-4', name: '스웨트 반바지', price: '₩45,000', gender: 'men', category: '하의', subCategory: '반바지',
    image: img('men', 'shorts', 'shorts', 4), color: { label: '블랙', hex: '#2b2b2b' },
    description: '블랙 컬러의 경량 우븐 반바지. 사이드 포켓과 스트링 디테일로 활동성이 좋습니다.\n허리단면 38cm · 밑위 27cm · 총장 44cm\n나일론 100%\n드라이클리닝 권장',
  },

  // ── WOMEN · 아우터 · 코트 ──
  {
    id: 'women-coat-1', name: '벨티드 트렌치코트', price: '₩228,000', gender: 'women', category: '아우터', subCategory: '코트',
    image: img('women', 'coats', 'coat', 1), color: { label: '카멜', hex: '#b89468' },
    description: '카멜 컬러의 벨티드 롱 트렌치코트. 허리 벨트로 실루엣을 조절할 수 있습니다.\n어깨너비 42cm · 가슴단면 50cm · 총장 112cm\n폴리에스터 65% · 코튼 35%\n드라이클리닝 권장',
  },
  {
    id: 'women-coat-2', name: '오버핏 울 코트', price: '₩198,000', gender: 'women', category: '아우터', subCategory: '코트',
    image: img('women', 'coats', 'coat', 2), color: { label: '차콜', hex: '#35363a' },
    description: '차콜 톤의 오버핏 랩 코트. 벨트로 허리 라인을 살릴 수 있는 디자인입니다.\n어깨너비 43cm · 가슴단면 52cm · 총장 105cm\n울 75% · 폴리에스터 25%\n드라이클리닝 권장',
  },
  {
    id: 'women-coat-3', name: '더블브레스티드 코트', price: '₩218,000', gender: 'women', category: '아우터', subCategory: '코트',
    image: img('women', 'coats', 'coat', 3), color: { label: '네이비', hex: '#1c2436' },
    description: '네이비 컬러의 미니멀한 카라 코트. 여유로운 실루엣으로 이너 레이어드가 편합니다.\n어깨너비 44cm · 가슴단면 53cm · 총장 90cm\n울 60% · 폴리에스터 40%\n드라이클리닝 권장',
  },
  {
    id: 'women-coat-4', name: '롱 울 코트', price: '₩208,000', gender: 'women', category: '아우터', subCategory: '코트',
    image: img('women', 'coats', 'coat', 4), color: { label: '베이지', hex: '#a99879' },
    description: '뉴트럴한 베이지 톤의 롱 벨티드 코트. 여유로운 실루엣이 특징입니다.\n어깨너비 43cm · 가슴단면 51cm · 총장 115cm\n폴리에스터 70% · 코튼 30%\n드라이클리닝 권장',
  },

  // ── WOMEN · 상의 · 셔츠 ──
  {
    id: 'women-shirt-1', name: '셔츠 블라우스', price: '₩65,000', gender: 'women', category: '상의', subCategory: '셔츠',
    image: img('women', 'shirts', 'shirt', 1), color: { label: '화이트', hex: '#ffffff' },
    description: '화이트 컬러의 오버사이즈 셔츠 블라우스. 여유로운 소매 볼륨이 포인트입니다.\n어깨너비 44cm · 가슴단면 54cm · 총장 58cm\n코튼 100%\n드라이클리닝 또는 손세탁 권장',
  },
  {
    id: 'women-shirt-2', name: '옥스포드 셔츠', price: '₩59,000', gender: 'women', category: '상의', subCategory: '셔츠',
    image: img('women', 'shirts', 'shirt', 2), color: { label: '블랙', hex: '#1f1f1f' },
    description: '화이트 카라 포인트가 돋보이는 블랙 블라우스. 잔잔한 패턴 원단으로 디테일을 더했습니다.\n어깨너비 40cm · 가슴단면 50cm · 총장 56cm\n폴리에스터 100%\n드라이클리닝 권장',
  },
  {
    id: 'women-shirt-3', name: '스트라이프 셔츠', price: '₩62,000', gender: 'women', category: '상의', subCategory: '셔츠',
    image: img('women', 'shirts', 'shirt', 3), color: { label: '라이트블루', hex: '#b7d3e8' },
    description: '라이트 블루 톤의 리넨 혼방 셔츠. 가슴 포켓 디테일로 캐주얼한 무드를 더했습니다.\n어깨너비 41cm · 가슴단면 51cm · 총장 57cm\n리넨 50% · 코튼 50%\n손세탁 권장',
  },
  {
    id: 'women-shirt-4', name: '리넨 블라우스', price: '₩68,000', gender: 'women', category: '상의', subCategory: '셔츠',
    image: img('women', 'shirts', 'shirt', 4), color: { label: '아이보리', hex: '#f0e6d2' },
    description: '아이보리 톤의 새틴 블라우스. 은은한 광택으로 포멀한 자리에도 어울립니다.\n어깨너비 39cm · 가슴단면 49cm · 총장 55cm\n폴리에스터 100%\n드라이클리닝 권장',
  },

  // ── WOMEN · 상의 · 티셔츠 ──
  {
    id: 'women-tshirt-1', name: '크루넥 티셔츠', price: '₩35,000', gender: 'women', category: '상의', subCategory: '티셔츠',
    image: img('women', 'tshirts', 'tshirt', 1), color: { label: '화이트', hex: '#ffffff' },
    description: '화이트 컬러의 크롭 박시 티셔츠. 짧은 기장으로 하의와 매치하기 좋습니다.\n어깨너비 45cm · 가슴단면 52cm · 총장 42cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'women-tshirt-2', name: '오버사이즈 티셔츠', price: '₩39,000', gender: 'women', category: '상의', subCategory: '티셔츠',
    image: img('women', 'tshirts', 'tshirt', 2), color: { label: '블랙', hex: '#262626' },
    description: '가먼트 다잉 워싱의 블랙 크롭 티셔츠. 빈티지한 워싱감이 특징입니다.\n어깨너비 44cm · 가슴단면 51cm · 총장 41cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'women-tshirt-3', name: '리브 반팔 티셔츠', price: '₩33,000', gender: 'women', category: '상의', subCategory: '티셔츠',
    image: img('women', 'tshirts', 'tshirt', 3), color: { label: '네이비 스트라이프', hex: '#1d2436' },
    description: '네이비 스트라이프 패턴의 보트넥 티셔츠. 클래식한 마린룩 무드를 연출합니다.\n어깨너비 38cm · 가슴단면 48cm · 총장 54cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'women-tshirt-4', name: '포켓 티셔츠', price: '₩36,000', gender: 'women', category: '상의', subCategory: '티셔츠',
    image: img('women', 'tshirts', 'tshirt', 4), color: { label: '베이지', hex: '#cbb89a' },
    description: '베이지 톤의 립 조직 슬림 티셔츠. 몸에 자연스럽게 붙는 핏감입니다.\n어깨너비 36cm · 가슴단면 44cm · 총장 52cm\n코튼 95% · 폴리우레탄 5%\n드라이클리닝 권장',
  },

  // ── WOMEN · 상의 · 니트·스웨트 ──
  {
    id: 'women-knit-1', name: '리브 니트 탑', price: '₩59,000', gender: 'women', category: '상의', subCategory: '니트·스웨트',
    image: img('women', 'tops', 'top', 1), color: { label: '아이보리', hex: '#f0e9d8' },
    description: '아이보리 톤의 크롭 카디건. 버튼 여밈으로 이너로 레이어드하기 좋습니다.\n어깨너비 39cm · 가슴단면 48cm · 총장 40cm\n울 30% · 아크릴 70%\n드라이클리닝 권장',
  },
  {
    id: 'women-knit-2', name: '크루넥 니트', price: '₩65,000', gender: 'women', category: '상의', subCategory: '니트·스웨트',
    image: img('women', 'tops', 'top', 2), color: { label: '차콜', hex: '#3d3d3f' },
    description: '차콜 톤의 모크넥 니트. 목선을 감싸는 디자인으로 단정하게 연출됩니다.\n어깨너비 40cm · 가슴단면 49cm · 총장 58cm\n울 40% · 아크릴 60%\n드라이클리닝 권장',
  },
  {
    id: 'women-knit-3', name: '오버핏 스웨트셔츠', price: '₩62,000', gender: 'women', category: '상의', subCategory: '니트·스웨트',
    image: img('women', 'tops', 'top', 3), color: { label: '블랙', hex: '#1c1c1c' },
    description: '블랙 컬러의 하프집업 스웨트셔츠. 스탠드 카라 디자인으로 캐주얼하게 매치하기 좋습니다.\n어깨너비 42cm · 가슴단면 50cm · 총장 57cm\n코튼 80% · 폴리에스터 20%\n드라이클리닝 권장',
  },
  {
    id: 'women-knit-4', name: '케이블 니트', price: '₩72,000', gender: 'women', category: '상의', subCategory: '니트·스웨트',
    image: img('women', 'tops', 'top', 4), color: { label: '오트밀베이지', hex: '#d9cfc0' },
    description: '오트밀 베이지 톤의 케이블 니트. 클래식한 무늬가 포인트인 크루넥 디자인입니다.\n어깨너비 41cm · 가슴단면 50cm · 총장 59cm\n울 35% · 아크릴 65%\n드라이클리닝 권장',
  },

  // ── WOMEN · 하의 · 데님 ──
  {
    id: 'women-denim-1', name: '스트레이트 데님팬츠', price: '₩75,000', gender: 'women', category: '하의', subCategory: '데님',
    image: img('women', 'jeans', 'jeans', 1), color: { label: '블랙워시', hex: '#262626' },
    description: '블랙 워싱의 스트레이트 데님 팬츠. 부담 없이 매치하기 좋은 기본 핏입니다.\n허리단면 34cm · 밑위 26cm · 밑단너비 18cm\n코튼 98% · 폴리우레탄 2%\n찬물 손세탁 권장',
  },
  {
    id: 'women-denim-2', name: '하이웨이스트 와이드 데님', price: '₩85,000', gender: 'women', category: '하의', subCategory: '데님',
    image: img('women', 'jeans', 'jeans', 2), color: { label: '미드블루', hex: '#6889a8' },
    description: '미드 블루 톤의 하이웨이스트 와이드 데님. 허리선을 높여 다리가 길어 보이는 라인입니다.\n허리단면 33cm · 밑위 28cm · 밑단너비 24cm\n코튼 100%\n찬물 손세탁 권장',
  },
  {
    id: 'women-denim-3', name: '슬림 데님', price: '₩72,000', gender: 'women', category: '하의', subCategory: '데님',
    image: img('women', 'jeans', 'jeans', 3), color: { label: '다크인디고', hex: '#1f2a42' },
    description: '다크 인디고 톤의 플레어 데님. 허벅지는 슬림하고 밑단으로 갈수록 퍼지는 라인입니다.\n허리단면 32cm · 밑위 25cm · 밑단너비 22cm\n코튼 98% · 폴리우레탄 2%\n찬물 손세탁 권장',
  },
  {
    id: 'women-denim-4', name: '부츠컷 데님', price: '₩79,000', gender: 'women', category: '하의', subCategory: '데님',
    image: img('women', 'jeans', 'jeans', 4), color: { label: '라이트워시', hex: '#9dbcd4' },
    description: '라이트 워싱의 스트레이트 데님. 은은한 워시감으로 캐주얼하게 활용하기 좋습니다.\n허리단면 34cm · 밑위 27cm · 밑단너비 20cm\n코튼 100%\n찬물 손세탁 권장',
  },

  // ── WOMEN · 하의 · 슬랙스 ──
  {
    id: 'women-slacks-1', name: '와이드 슬랙스', price: '₩79,000', gender: 'women', category: '하의', subCategory: '슬랙스',
    image: img('women', 'trousers', 'trousers', 1), color: { label: '차콜', hex: '#2f2f30' },
    description: '차콜 컬러의 와이드 슬랙스. 프론트 턱으로 여유로운 실루엣을 완성합니다.\n허리단면 33cm · 밑위 27cm · 밑단너비 24cm\n폴리에스터 70% · 레이온 30%\n드라이클리닝 권장',
  },
  {
    id: 'women-slacks-2', name: '스트레이트 슬랙스', price: '₩75,000', gender: 'women', category: '하의', subCategory: '슬랙스',
    image: img('women', 'trousers', 'trousers', 2), color: { label: '다크브라운', hex: '#3a3129' },
    description: '다크 브라운 톤의 와이드 슬랙스. 부드러운 소재로 떨어지는 라인이 우아합니다.\n허리단면 32cm · 밑위 26cm · 밑단너비 23cm\n폴리에스터 65% · 레이온 35%\n드라이클리닝 권장',
  },
  {
    id: 'women-slacks-3', name: '테이퍼드 슬랙스', price: '₩76,000', gender: 'women', category: '하의', subCategory: '슬랙스',
    image: img('women', 'trousers', 'trousers', 3), color: { label: '베이지', hex: '#cbb896' },
    description: '베이지 톤의 와이드 슬랙스. 뉴트럴한 컬러로 활용도가 높습니다.\n허리단면 32cm · 밑위 26cm · 밑단너비 24cm\n폴리에스터 68% · 레이온 32%\n드라이클리닝 권장',
  },
  {
    id: 'women-slacks-4', name: '벨티드 슬랙스', price: '₩82,000', gender: 'women', category: '하의', subCategory: '슬랙스',
    image: img('women', 'trousers', 'trousers', 4), color: { label: '블랙', hex: '#232323' },
    description: '블랙 컬러의 테이퍼드 슬랙스. 슬림한 밑단으로 깔끔한 라인을 연출합니다.\n허리단면 31cm · 밑위 25cm · 밑단너비 17cm\n폴리에스터 70% · 레이온 30%\n드라이클리닝 권장',
  },

  // ── WOMEN · 하의 · 반바지 ──
  {
    id: 'women-shorts-1', name: '버뮤다 반바지', price: '₩55,000', gender: 'women', category: '하의', subCategory: '반바지',
    image: img('women', 'shorts', 'shorts', 1), color: { label: '블랙', hex: '#1e1e1e' },
    description: '블랙 컬러의 하이웨이스트 와이드 반바지. 여유로운 핏으로 편안하게 연출됩니다.\n허리단면 33cm · 밑위 27cm · 총장 34cm\n폴리에스터 70% · 레이온 30%\n드라이클리닝 권장',
  },
  {
    id: 'women-shorts-2', name: '와이드 반바지', price: '₩52,000', gender: 'women', category: '하의', subCategory: '반바지',
    image: img('women', 'shorts', 'shorts', 2), color: { label: '카키', hex: '#cdb891' },
    description: '카키 톤의 코튼 트윌 와이드 반바지. 튼튼한 소재로 활동적으로 착용하기 좋습니다.\n허리단면 32cm · 밑위 26cm · 총장 32cm\n코튼 100%\n드라이클리닝 권장',
  },
  {
    id: 'women-shorts-3', name: '데님 반바지', price: '₩49,000', gender: 'women', category: '하의', subCategory: '반바지',
    image: img('women', 'shorts', 'shorts', 3), color: { label: '블루데님', hex: '#6a92b3' },
    description: '미드 블루 데님 소재의 와이드 반바지. 캐주얼하게 매치하기 좋은 기본 아이템입니다.\n허리단면 33cm · 밑위 26cm · 총장 33cm\n코튼 100%\n찬물 손세탁 권장',
  },
  {
    id: 'women-shorts-4', name: '스웨트 반바지', price: '₩45,000', gender: 'women', category: '하의', subCategory: '반바지',
    image: img('women', 'shorts', 'shorts', 4), color: { label: '차콜그레이', hex: '#4a4a4c' },
    description: '차콜 그레이 톤의 테일러드 반바지. 핀턱 디테일로 단정한 인상을 줍니다.\n허리단면 32cm · 밑위 25cm · 총장 31cm\n폴리에스터 65% · 레이온 35%\n드라이클리닝 권장',
  },
]
