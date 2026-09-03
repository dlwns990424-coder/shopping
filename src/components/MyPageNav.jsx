import { Link } from 'react-router-dom'
import './MyPageNav.css'

const TABS = [
  { id: 'settings', label: '계정 설정' },
  { id: 'orders', label: '주문 내역' },
  { id: 'recent', label: '최근 본 상품' },
]

function MyPageNav({ activeTab, onLogout }) {
  return (
    <nav className="mypage-nav">
      <ul className="mypage-nav__list">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <Link
              to={`/mypage?tab=${tab.id}`}
              className={`mypage-nav__link${activeTab === tab.id ? ' is-active' : ''}`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      <button type="button" className="mypage-nav__logout" onClick={onLogout}>
        로그아웃
      </button>
    </nav>
  )
}

export default MyPageNav
