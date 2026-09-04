import type { Gender, Product } from '../types'

function img(gender: Gender, folder: string, file: string, index: number) {
  const num = String(index).padStart(2, '0')
  return `/images/products/${gender}/${folder}/${gender}-${file}-${num}.png`
}

export const products: Product[] = [
  // ── MEN · 아우터 · 코트 ──
  { id: 'men-coat-1', name: '오버핏 울 코트', price: '₩198,000', gender: 'men', category: '아우터', subCategory: '코트', image: img('men', 'coats', 'coat', 1) },
  { id: 'men-coat-2', name: '더블브레스티드 코트', price: '₩228,000', gender: 'men', category: '아우터', subCategory: '코트', image: img('men', 'coats', 'coat', 2) },
  { id: 'men-coat-3', name: '벨티드 트렌치코트', price: '₩189,000', gender: 'men', category: '아우터', subCategory: '코트', image: img('men', 'coats', 'coat', 3) },
  { id: 'men-coat-4', name: '싱글 브레스티드 코트', price: '₩179,000', gender: 'men', category: '아우터', subCategory: '코트', image: img('men', 'coats', 'coat', 4) },

  // ── MEN · 상의 · 셔츠 ──
  { id: 'men-shirt-1', name: '옥스포드 셔츠', price: '₩59,000', gender: 'men', category: '상의', subCategory: '셔츠', image: img('men', 'shirts', 'shirt', 1) },
  { id: 'men-shirt-2', name: '스트라이프 셔츠', price: '₩65,000', gender: 'men', category: '상의', subCategory: '셔츠', image: img('men', 'shirts', 'shirt', 2) },
  { id: 'men-shirt-3', name: '리넨 블렌드 셔츠', price: '₩69,000', gender: 'men', category: '상의', subCategory: '셔츠', image: img('men', 'shirts', 'shirt', 3) },
  { id: 'men-shirt-4', name: '오버셔츠', price: '₩72,000', gender: 'men', category: '상의', subCategory: '셔츠', image: img('men', 'shirts', 'shirt', 4) },

  // ── MEN · 상의 · 티셔츠 ──
  { id: 'men-tshirt-1', name: '오버사이즈 티셔츠', price: '₩39,000', gender: 'men', category: '상의', subCategory: '티셔츠', image: img('men', 'tshirts', 'tshirt', 1) },
  { id: 'men-tshirt-2', name: '헤비웨이트 반팔 티셔츠', price: '₩42,000', gender: 'men', category: '상의', subCategory: '티셔츠', image: img('men', 'tshirts', 'tshirt', 2) },
  { id: 'men-tshirt-3', name: '크루넥 티셔츠', price: '₩35,000', gender: 'men', category: '상의', subCategory: '티셔츠', image: img('men', 'tshirts', 'tshirt', 3) },
  { id: 'men-tshirt-4', name: '포켓 티셔츠', price: '₩38,000', gender: 'men', category: '상의', subCategory: '티셔츠', image: img('men', 'tshirts', 'tshirt', 4) },

  // ── MEN · 상의 · 니트·스웨트 ──
  { id: 'men-knit-1', name: '크루넥 니트', price: '₩69,000', gender: 'men', category: '상의', subCategory: '니트·스웨트', image: img('men', 'tops', 'top', 1) },
  { id: 'men-knit-2', name: '오버핏 스웨트셔츠', price: '₩65,000', gender: 'men', category: '상의', subCategory: '니트·스웨트', image: img('men', 'tops', 'top', 2) },
  { id: 'men-knit-3', name: '하프집업 니트', price: '₩79,000', gender: 'men', category: '상의', subCategory: '니트·스웨트', image: img('men', 'tops', 'top', 3) },
  { id: 'men-knit-4', name: '케이블 니트', price: '₩85,000', gender: 'men', category: '상의', subCategory: '니트·스웨트', image: img('men', 'tops', 'top', 4) },

  // ── MEN · 하의 · 데님 ──
  { id: 'men-denim-1', name: '스트레이트 데님', price: '₩79,000', gender: 'men', category: '하의', subCategory: '데님', image: img('men', 'jeans', 'jeans', 1) },
  { id: 'men-denim-2', name: '와이드 데님', price: '₩85,000', gender: 'men', category: '하의', subCategory: '데님', image: img('men', 'jeans', 'jeans', 2) },
  { id: 'men-denim-3', name: '슬림 테이퍼드 데님', price: '₩75,000', gender: 'men', category: '하의', subCategory: '데님', image: img('men', 'jeans', 'jeans', 3) },
  { id: 'men-denim-4', name: '워시드 블랙 데님', price: '₩82,000', gender: 'men', category: '하의', subCategory: '데님', image: img('men', 'jeans', 'jeans', 4) },

  // ── MEN · 하의 · 슬랙스 ──
  { id: 'men-slacks-1', name: '와이드 슬랙스', price: '₩79,000', gender: 'men', category: '하의', subCategory: '슬랙스', image: img('men', 'trousers', 'trousers', 1) },
  { id: 'men-slacks-2', name: '스트레이트 슬랙스', price: '₩75,000', gender: 'men', category: '하의', subCategory: '슬랙스', image: img('men', 'trousers', 'trousers', 2) },
  { id: 'men-slacks-3', name: '테이퍼드 슬랙스', price: '₩78,000', gender: 'men', category: '하의', subCategory: '슬랙스', image: img('men', 'trousers', 'trousers', 3) },
  { id: 'men-slacks-4', name: '플리츠 슬랙스', price: '₩82,000', gender: 'men', category: '하의', subCategory: '슬랙스', image: img('men', 'trousers', 'trousers', 4) },

  // ── MEN · 하의 · 반바지 ──
  { id: 'men-shorts-1', name: '버뮤다 반바지', price: '₩55,000', gender: 'men', category: '하의', subCategory: '반바지', image: img('men', 'shorts', 'shorts', 1) },
  { id: 'men-shorts-2', name: '치노 반바지', price: '₩49,000', gender: 'men', category: '하의', subCategory: '반바지', image: img('men', 'shorts', 'shorts', 2) },
  { id: 'men-shorts-3', name: '와이드 반바지', price: '₩52,000', gender: 'men', category: '하의', subCategory: '반바지', image: img('men', 'shorts', 'shorts', 3) },
  { id: 'men-shorts-4', name: '스웨트 반바지', price: '₩45,000', gender: 'men', category: '하의', subCategory: '반바지', image: img('men', 'shorts', 'shorts', 4) },

  // ── WOMEN · 아우터 · 코트 ──
  { id: 'women-coat-1', name: '벨티드 트렌치코트', price: '₩228,000', gender: 'women', category: '아우터', subCategory: '코트', image: img('women', 'coats', 'coat', 1) },
  { id: 'women-coat-2', name: '오버핏 울 코트', price: '₩198,000', gender: 'women', category: '아우터', subCategory: '코트', image: img('women', 'coats', 'coat', 2) },
  { id: 'women-coat-3', name: '더블브레스티드 코트', price: '₩218,000', gender: 'women', category: '아우터', subCategory: '코트', image: img('women', 'coats', 'coat', 3) },
  { id: 'women-coat-4', name: '롱 울 코트', price: '₩208,000', gender: 'women', category: '아우터', subCategory: '코트', image: img('women', 'coats', 'coat', 4) },

  // ── WOMEN · 상의 · 셔츠 ──
  { id: 'women-shirt-1', name: '셔츠 블라우스', price: '₩65,000', gender: 'women', category: '상의', subCategory: '셔츠', image: img('women', 'shirts', 'shirt', 1) },
  { id: 'women-shirt-2', name: '옥스포드 셔츠', price: '₩59,000', gender: 'women', category: '상의', subCategory: '셔츠', image: img('women', 'shirts', 'shirt', 2) },
  { id: 'women-shirt-3', name: '스트라이프 셔츠', price: '₩62,000', gender: 'women', category: '상의', subCategory: '셔츠', image: img('women', 'shirts', 'shirt', 3) },
  { id: 'women-shirt-4', name: '리넨 블라우스', price: '₩68,000', gender: 'women', category: '상의', subCategory: '셔츠', image: img('women', 'shirts', 'shirt', 4) },

  // ── WOMEN · 상의 · 티셔츠 ──
  { id: 'women-tshirt-1', name: '크루넥 티셔츠', price: '₩35,000', gender: 'women', category: '상의', subCategory: '티셔츠', image: img('women', 'tshirts', 'tshirt', 1) },
  { id: 'women-tshirt-2', name: '오버사이즈 티셔츠', price: '₩39,000', gender: 'women', category: '상의', subCategory: '티셔츠', image: img('women', 'tshirts', 'tshirt', 2) },
  { id: 'women-tshirt-3', name: '리브 반팔 티셔츠', price: '₩33,000', gender: 'women', category: '상의', subCategory: '티셔츠', image: img('women', 'tshirts', 'tshirt', 3) },
  { id: 'women-tshirt-4', name: '포켓 티셔츠', price: '₩36,000', gender: 'women', category: '상의', subCategory: '티셔츠', image: img('women', 'tshirts', 'tshirt', 4) },

  // ── WOMEN · 상의 · 니트·스웨트 ──
  { id: 'women-knit-1', name: '리브 니트 탑', price: '₩59,000', gender: 'women', category: '상의', subCategory: '니트·스웨트', image: img('women', 'tops', 'top', 1) },
  { id: 'women-knit-2', name: '크루넥 니트', price: '₩65,000', gender: 'women', category: '상의', subCategory: '니트·스웨트', image: img('women', 'tops', 'top', 2) },
  { id: 'women-knit-3', name: '오버핏 스웨트셔츠', price: '₩62,000', gender: 'women', category: '상의', subCategory: '니트·스웨트', image: img('women', 'tops', 'top', 3) },
  { id: 'women-knit-4', name: '케이블 니트', price: '₩72,000', gender: 'women', category: '상의', subCategory: '니트·스웨트', image: img('women', 'tops', 'top', 4) },

  // ── WOMEN · 하의 · 데님 ──
  { id: 'women-denim-1', name: '스트레이트 데님팬츠', price: '₩75,000', gender: 'women', category: '하의', subCategory: '데님', image: img('women', 'jeans', 'jeans', 1) },
  { id: 'women-denim-2', name: '하이웨이스트 와이드 데님', price: '₩85,000', gender: 'women', category: '하의', subCategory: '데님', image: img('women', 'jeans', 'jeans', 2) },
  { id: 'women-denim-3', name: '슬림 데님', price: '₩72,000', gender: 'women', category: '하의', subCategory: '데님', image: img('women', 'jeans', 'jeans', 3) },
  { id: 'women-denim-4', name: '부츠컷 데님', price: '₩79,000', gender: 'women', category: '하의', subCategory: '데님', image: img('women', 'jeans', 'jeans', 4) },

  // ── WOMEN · 하의 · 슬랙스 ──
  { id: 'women-slacks-1', name: '와이드 슬랙스', price: '₩79,000', gender: 'women', category: '하의', subCategory: '슬랙스', image: img('women', 'trousers', 'trousers', 1) },
  { id: 'women-slacks-2', name: '스트레이트 슬랙스', price: '₩75,000', gender: 'women', category: '하의', subCategory: '슬랙스', image: img('women', 'trousers', 'trousers', 2) },
  { id: 'women-slacks-3', name: '테이퍼드 슬랙스', price: '₩76,000', gender: 'women', category: '하의', subCategory: '슬랙스', image: img('women', 'trousers', 'trousers', 3) },
  { id: 'women-slacks-4', name: '벨티드 슬랙스', price: '₩82,000', gender: 'women', category: '하의', subCategory: '슬랙스', image: img('women', 'trousers', 'trousers', 4) },

  // ── WOMEN · 하의 · 반바지 ──
  { id: 'women-shorts-1', name: '버뮤다 반바지', price: '₩55,000', gender: 'women', category: '하의', subCategory: '반바지', image: img('women', 'shorts', 'shorts', 1) },
  { id: 'women-shorts-2', name: '와이드 반바지', price: '₩52,000', gender: 'women', category: '하의', subCategory: '반바지', image: img('women', 'shorts', 'shorts', 2) },
  { id: 'women-shorts-3', name: '데님 반바지', price: '₩49,000', gender: 'women', category: '하의', subCategory: '반바지', image: img('women', 'shorts', 'shorts', 3) },
  { id: 'women-shorts-4', name: '스웨트 반바지', price: '₩45,000', gender: 'women', category: '하의', subCategory: '반바지', image: img('women', 'shorts', 'shorts', 4) },
]
