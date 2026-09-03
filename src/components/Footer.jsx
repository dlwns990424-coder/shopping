import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <img src={logo} alt="T&L" className="site-footer__logo" />

        <div className="site-footer__col">
          <p className="site-footer__col-title text-caption">SHOP</p>
          <Link to="/men" className="text-body-sm">MEN</Link>
          <Link to="/women" className="text-body-sm">WOMEN</Link>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__col-title text-caption">CUSTOMER SERVICE</p>
          <span className="text-body-sm">공지사항</span>
          <span className="text-body-sm">자주묻는질문</span>
          <span className="text-body-sm">1:1 문의</span>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__col-title text-caption">COMPANY</p>
          <span className="text-body-sm">(주)티앤엘 · 대표 이준</span>
          <span className="text-body-sm">사업자등록번호 000-00-00000</span>
          <span className="text-body-sm">서울특별시 강남구 테헤란로 000</span>
          <span className="text-body-sm">고객센터 1544-0000 (평일 10:00-18:00)</span>
        </div>

        <div className="site-footer__col">
          <p className="site-footer__col-title text-caption">SOCIAL</p>
          <a href="#" className="text-body-sm">Instagram</a>
          <a href="#" className="text-body-sm">YouTube</a>
        </div>
      </div>

      <div className="site-footer__bottom text-caption">
        <p>© 2026 T&amp;L. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
