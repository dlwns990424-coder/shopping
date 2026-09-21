import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'

const footerHeadingClass = 'text-[13px] font-medium tracking-[0.14em] text-white/90'
const footerItemClass = 'text-[13px] leading-[1.7] text-white/60'

type FooterSectionKey = 'shop' | 'customer' | 'company' | 'social'

interface FooterSectionHeadingProps {
  id: string
  contentId: string
  label: string
  open: boolean
  onToggle: () => void
}

// 모바일에서는 제목을 누르면 펼쳐지는 아코디언(기본은 접힘)으로, md 이상에서는
// 항상 펼친 채로 보인다 — 항목별 줄 수가 서로 달라서(SHOP 3줄 vs COMPANY 5줄)
// 다 펼쳐두면 모바일에서 세로로 너무 길어지고 좌우 밀도도 들쭉날쭉해지는 문제를 해결한다.
function FooterSectionHeading({ id, contentId, label, open, onToggle }: FooterSectionHeadingProps) {
  return (
    <button
      type="button"
      id={id}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-center justify-between gap-8 border-none bg-transparent p-0 text-left md:cursor-default ${footerHeadingClass}`}
    >
      {label}
      <ChevronDown
        size={14}
        strokeWidth={1.5}
        className={`shrink-0 text-white/40 transition-transform md:hidden ${open ? 'rotate-180' : ''}`}
      />
    </button>
  )
}

interface FooterProps {
  reserveBottomNavSpace?: boolean
}

function Footer({ reserveBottomNavSpace = false }: FooterProps) {
  const [openSections, setOpenSections] = useState<Set<FooterSectionKey>>(new Set())

  const toggleSection = (key: FooterSectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <footer className={`mt-auto bg-inverse text-surface ${reserveBottomNavSpace ? 'footer-with-bottom-nav' : ''}`}>
      <div className="px-20 py-40 md:px-32 md:py-48 lg:px-80 lg:py-64 xl:px-140 2xl:px-200">
        <div className="mx-auto flex max-w-1600 flex-col gap-y-40 md:gap-y-48">
          <div className="flex flex-col items-start">
            <Link to="/" aria-label="NOVERA 홈으로 이동" className="inline-flex">
              <img
                src="/images/brand/novera-logo-header.png"
                alt="NOVERA"
                className="block h-22 w-auto invert md:h-24"
              />
            </Link>
          </div>

          {/* 각 섹션이 내용 폭만큼만 차지하고 justify-between으로 간격을 균등 배분한다 —
              칸 수를 직접 지정하는 그리드는 브레이크포인트마다 실제 텍스트 폭과 안 맞아서
              오른쪽(SOCIAL)이 넘치거나 섹션 사이 여백이 들쭉날쭉해지는 문제가 있었다. */}
          <div className="flex flex-col gap-y-24 md:flex-row md:flex-wrap md:items-start md:justify-between md:gap-x-24 md:gap-y-32">
            <nav aria-label="푸터 쇼핑 메뉴" className="border-b border-white/10 pb-16 md:border-none md:pb-0">
              <FooterSectionHeading
                id="footer-shop-toggle"
                contentId="footer-shop-content"
                label="SHOP"
                open={openSections.has('shop')}
                onToggle={() => toggleSection('shop')}
              />
              <ul
                id="footer-shop-content"
                className={`${openSections.has('shop') ? 'mt-14 flex' : 'hidden'} list-none flex-col gap-6 p-0 md:mt-14 md:flex`}
              >
                <li>
                  <Link to="/men" className={`${footerItemClass} no-underline transition-colors hover:text-white`}>
                    MEN
                  </Link>
                </li>
                <li>
                  <Link to="/women" className={`${footerItemClass} no-underline transition-colors hover:text-white`}>
                    WOMEN
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop?category=all"
                    className={`${footerItemClass} no-underline transition-colors hover:text-white`}
                  >
                    ALL PRODUCTS
                  </Link>
                </li>
              </ul>
            </nav>

            <section className="border-b border-white/10 pb-16 md:border-none md:pb-0">
              <FooterSectionHeading
                id="footer-customer"
                contentId="footer-customer-content"
                label="CUSTOMER SERVICE"
                open={openSections.has('customer')}
                onToggle={() => toggleSection('customer')}
              />
              <ul
                id="footer-customer-content"
                className={`${openSections.has('customer') ? 'mt-14 flex' : 'hidden'} list-none flex-col gap-6 p-0 md:mt-14 md:flex`}
              >
                <li className={footerItemClass}>공지사항</li>
                <li className={footerItemClass}>자주 묻는 질문</li>
                <li className={footerItemClass}>1:1 문의</li>
              </ul>
            </section>

            <section className="border-b border-white/10 pb-16 md:max-w-240 md:border-none md:pb-0">
              <FooterSectionHeading
                id="footer-company"
                contentId="footer-company-content"
                label="COMPANY"
                open={openSections.has('company')}
                onToggle={() => toggleSection('company')}
              />
              <div
                id="footer-company-content"
                className={`${openSections.has('company') ? 'mt-14 flex' : 'hidden'} flex-col gap-4 text-[12px] leading-[1.75] text-white/55 md:mt-14 md:flex md:text-[13px]`}
              >
                <p>(주)노베라 · 대표 이준</p>
                <p>사업자등록번호 000-00-00000</p>
                <p>서울특별시 강남구 테헤란로 000</p>
                <p className="mt-4">고객센터 1544-0000</p>
                <p>평일 10:00–18:00 · 주말/공휴일 휴무</p>
              </div>
            </section>

            <section>
              <FooterSectionHeading
                id="footer-social"
                contentId="footer-social-content"
                label="SOCIAL"
                open={openSections.has('social')}
                onToggle={() => toggleSection('social')}
              />
              <div
                id="footer-social-content"
                className={`${openSections.has('social') ? 'mt-14 flex' : 'hidden'} gap-20 md:mt-14 md:flex md:flex-col md:gap-6`}
              >
                <span className={footerItemClass}>Instagram</span>
                <span className={footerItemClass}>YouTube</span>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="px-20 py-20 text-[11px] leading-[1.5] text-white/45 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
          <p>
            © {new Date().getFullYear()} NOVERA · Developed by 이준
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
