import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-auto bg-inverse text-surface">
      <div className="flex flex-wrap gap-48 px-20 pb-32 pt-64 md:px-32 lg:px-40">
        <img src="/images/brand/novera-logo-header.png" alt="NOVERA" className="block h-22 w-auto invert" />

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">SHOP</p>
          <Link to="/men" className="text-body-sm text-disabled no-underline transition-colors hover:text-surface">
            MEN
          </Link>
          <Link to="/women" className="text-body-sm text-disabled no-underline transition-colors hover:text-surface">
            WOMEN
          </Link>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">CUSTOMER SERVICE</p>
          <span className="text-body-sm text-disabled">공지사항</span>
          <span className="text-body-sm text-disabled">자주묻는질문</span>
          <span className="text-body-sm text-disabled">1:1 문의</span>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">COMPANY</p>
          <span className="text-body-sm text-disabled">(주)노베라 · 대표 이준</span>
          <span className="text-body-sm text-disabled">사업자등록번호 000-00-00000</span>
          <span className="text-body-sm text-disabled">서울특별시 강남구 테헤란로 000</span>
          <span className="text-body-sm text-disabled">고객센터 1544-0000 (평일 10:00-18:00)</span>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">SOCIAL</p>
          <a href="#" className="text-body-sm text-disabled no-underline transition-colors hover:text-surface">
            Instagram
          </a>
          <a href="#" className="text-body-sm text-disabled no-underline transition-colors hover:text-surface">
            YouTube
          </a>
        </div>
      </div>

      <div className="text-caption border-t border-white/15 px-20 py-16 text-disabled md:px-32 lg:px-40">
        <p>© 2026 NOVERA. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
