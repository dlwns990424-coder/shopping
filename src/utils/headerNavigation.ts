export interface CompactHeaderConfig {
  title: string
  fallbackPath: string
  showShoppingActions: boolean
  alignTitleLeft?: boolean
  breadcrumb?: {
    rootLabel: string
    rootPath: string
    currentLabel: string
  }
}

function catalogGender(pathname: string, searchParams: URLSearchParams) {
  return pathname === '/men'
    ? { label: '남자', path: '/men' }
    : pathname === '/women'
      ? { label: '여자', path: '/women' }
      : searchParams.get('gender') === 'men'
        ? { label: '남자', path: '/men' }
        : searchParams.get('gender') === 'women'
          ? { label: '여자', path: '/women' }
          : { label: '전체', path: '/shop?category=all' }
}

function catalogSectionTitle(searchParams: URLSearchParams): string {
  if (searchParams.get('q')) return '검색 결과'
  if (searchParams.get('sale') === 'true') return '할인 상품'
  if (searchParams.get('sort') === 'best') return '베스트'

  const category = searchParams.get('category')
  return category && category !== 'all' ? category : '전체 상품'
}

function catalogConfig(pathname: string, searchParams: URLSearchParams) {
  const sectionTitle = catalogSectionTitle(searchParams)
  if (searchParams.get('q')) return { title: sectionTitle }

  const gender = catalogGender(pathname, searchParams)
  return {
    title: `${gender.label} > ${sectionTitle}`,
    breadcrumb: {
      rootLabel: gender.label,
      rootPath: gender.path,
      currentLabel: sectionTitle,
    },
  }
}

export function getCompactHeaderConfig(
  pathname: string,
  searchParams: URLSearchParams,
): CompactHeaderConfig | null {
  if (pathname === '/men' || pathname === '/women') {
    if (!searchParams.has('category')) return null

    const catalog = catalogConfig(pathname, searchParams)

    return {
      ...catalog,
      fallbackPath: pathname,
      showShoppingActions: true,
    }
  }

  if (pathname === '/shop') {
    const catalog = catalogConfig(pathname, searchParams)

    return {
      ...catalog,
      fallbackPath: '/men',
      showShoppingActions: true,
    }
  }

  if (/^\/products\//.test(pathname)) {
    return { title: '상품 상세', fallbackPath: '/men?category=all', showShoppingActions: true }
  }

  if (pathname === '/cart') {
    return {
      title: '장바구니',
      fallbackPath: '/men',
      showShoppingActions: false,
      alignTitleLeft: true,
    }
  }

  if (pathname === '/wishlist') {
    return {
      title: '위시리스트',
      fallbackPath: '/men',
      showShoppingActions: false,
      alignTitleLeft: true,
    }
  }

  if (pathname === '/order') {
    return { title: '주문/결제', fallbackPath: '/cart', showShoppingActions: false }
  }

  if (pathname === '/order/complete') {
    return { title: '주문 완료', fallbackPath: '/mypage', showShoppingActions: false }
  }

  if (pathname === '/login') {
    return { title: '로그인', fallbackPath: '/men', showShoppingActions: false }
  }

  if (pathname === '/signup') {
    return { title: '회원가입', fallbackPath: '/login', showShoppingActions: false }
  }

  if (pathname === '/mypage') {
    const tab = searchParams.get('tab')
    return {
      title: '마이페이지',
      fallbackPath: !tab || tab === 'orders' ? '/men' : '/mypage?tab=orders',
      showShoppingActions: false,
      alignTitleLeft: true,
    }
  }

  return null
}
