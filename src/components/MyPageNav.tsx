import { Link } from 'react-router-dom'

const TABS = [
  { id: 'orders', label: '주문 내역' },
  { id: 'recent', label: '최근 본 상품' },
  { id: 'settings', label: '계정 설정' },
] as const

interface MyPageNavProps {
  activeTab: string
  onLogout: () => void
}

function MyPageNav({ activeTab, onLogout }: MyPageNavProps) {
  return (
    <nav className="flex flex-col gap-32">
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <Link
              to={`/mypage?tab=${tab.id}`}
              className={`block rounded-sm px-16 py-12 text-sm font-medium no-underline transition-colors active:scale-95 hover:text-primary ${
                activeTab === tab.id ? 'bg-surface-muted text-primary' : 'text-secondary'
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="cursor-pointer self-start border-none bg-transparent px-16 text-xs text-secondary transition-colors active:scale-95 hover:text-point"
        onClick={onLogout}
      >
        로그아웃
      </button>
    </nav>
  )
}

export default MyPageNav
