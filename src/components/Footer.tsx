import { Link } from 'react-router-dom'

const footerHeadingClass = 'text-[11px] font-medium tracking-[0.14em] text-white/50'
const footerItemClass = 'text-[13px] leading-[1.7] text-white/70'

function Footer() {
  return (
    <footer className="mt-auto bg-inverse text-surface">
      <div className="px-20 py-40 md:px-32 md:py-48 lg:px-80 lg:py-64 xl:px-140 2xl:px-200">
        <div className="grid grid-cols-2 gap-x-24 gap-y-40 md:grid-cols-12 md:gap-x-32 lg:gap-x-48">
          <div className="col-span-2 flex flex-col items-start md:col-span-12 lg:col-span-4">
            <Link to="/" aria-label="NOVERA 홈으로 이동" className="inline-flex">
              <img
                src="/images/brand/novera-logo-header.png"
                alt="NOVERA"
                className="block h-22 w-auto invert md:h-24"
              />
            </Link>
          </div>

          <nav aria-label="푸터 쇼핑 메뉴" className="md:col-span-2 lg:col-span-2">
            <p className={footerHeadingClass}>SHOP</p>
            <ul className="mt-14 flex list-none flex-col gap-6 p-0">
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

          <section aria-labelledby="footer-customer" className="md:col-span-3 lg:col-span-2">
            <p id="footer-customer" className={footerHeadingClass}>
              CUSTOMER SERVICE
            </p>
            <ul className="mt-14 flex list-none flex-col gap-6 p-0">
              <li className={footerItemClass}>공지사항</li>
              <li className={footerItemClass}>자주 묻는 질문</li>
              <li className={footerItemClass}>1:1 문의</li>
            </ul>
          </section>

          <section aria-labelledby="footer-company" className="md:col-span-5 lg:col-span-3">
            <p id="footer-company" className={footerHeadingClass}>
              COMPANY
            </p>
            <div className="mt-14 flex flex-col gap-4 text-[12px] leading-[1.75] text-white/55 md:text-[13px]">
              <p>(주)노베라 · 대표 이준</p>
              <p>사업자등록번호 000-00-00000</p>
              <p>서울특별시 강남구 테헤란로 000</p>
              <p className="mt-4 text-white/70">고객센터 1544-0000</p>
              <p>평일 10:00–18:00 · 주말/공휴일 휴무</p>
            </div>
          </section>

          <section aria-labelledby="footer-social" className="md:col-span-2 lg:col-span-1">
            <p id="footer-social" className={footerHeadingClass}>
              SOCIAL
            </p>
            <div className="mt-14 flex gap-20 md:flex-col md:gap-6">
              <span className={footerItemClass}>Instagram</span>
              <span className={footerItemClass}>YouTube</span>
            </div>
          </section>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="px-20 py-20 text-[11px] leading-[1.5] text-white/45 md:px-32 lg:px-80 xl:px-140 2xl:px-200">
          <p>© 2026 NOVERA. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
