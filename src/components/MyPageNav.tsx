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
      <ul className="-mx-20 m-0 grid list-none grid-cols-3 border-b border-line p-0 md:mx-0 lg:flex lg:flex-col lg:gap-4 lg:border-b-0">
        {TABS.map((tab) => (
          <li key={tab.id} className="min-w-0">
            <Link
              to={`/mypage?tab=${tab.id}`}
              className={`flex h-48 w-full items-center justify-center border-b px-8 text-center text-sm font-medium no-underline transition-colors hover:text-primary lg:h-auto lg:justify-start lg:rounded-sm lg:border-b-0 lg:px-16 lg:py-12 lg:text-left lg:text-base lg:active:scale-95 ${
                activeTab === tab.id
                  ? 'border-primary text-primary lg:bg-surface-muted'
                  : 'border-transparent text-secondary'
              }`}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="hidden cursor-pointer self-start border-none bg-transparent px-16 text-sm text-secondary transition-colors active:scale-95 hover:text-point lg:block"
        onClick={onLogout}
      >
        로그아웃
      </button>
    </nav>
  )
}

export default MyPageNav
