import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

function Footer() {
  return (
    <footer className="mt-auto bg-inverse text-surface">
      <div className="flex flex-wrap gap-48 px-24 pb-32 pt-64 md:px-48 lg:px-80">
        <img src={logo} alt="T&L" className="block h-22 w-auto" />

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">SHOP</p>
          <Link to="/men" className="text-body-sm text-surface no-underline opacity-85">
            MEN
          </Link>
          <Link to="/women" className="text-body-sm text-surface no-underline opacity-85">
            WOMEN
          </Link>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">CUSTOMER SERVICE</p>
          <span className="text-body-sm text-surface opacity-85">공지사항</span>
          <span className="text-body-sm text-surface opacity-85">자주묻는질문</span>
          <span className="text-body-sm text-surface opacity-85">1:1 문의</span>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">COMPANY</p>
          <span className="text-body-sm text-surface opacity-85">(주)티앤엘 · 대표 이준</span>
          <span className="text-body-sm text-surface opacity-85">사업자등록번호 000-00-00000</span>
          <span className="text-body-sm text-surface opacity-85">서울특별시 강남구 테헤란로 000</span>
          <span className="text-body-sm text-surface opacity-85">고객센터 1544-0000 (평일 10:00-18:00)</span>
        </div>

        <div className="flex min-w-160 flex-col gap-8">
          <p className="text-caption mb-4 text-disabled">SOCIAL</p>
          <a href="#" className="text-body-sm text-surface no-underline opacity-85">
            Instagram
          </a>
          <a href="#" className="text-body-sm text-surface no-underline opacity-85">
            YouTube
          </a>
        </div>
      </div>

      <div className="text-caption border-t border-white/15 px-24 py-16 text-disabled md:px-48 lg:px-80">
        <p>© 2026 T&amp;L. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
