import { useEffect, useRef, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileSidebarRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sidebarOpen) return

    const menuButton = menuButtonRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus())

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        return
      }

      if (e.key !== 'Tab') return

      const sidebar = mobileSidebarRef.current
      if (!sidebar) return

      const focusable = Array.from(
        sidebar.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey && (activeElement === first || !sidebar.contains(activeElement))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (activeElement === last || !sidebar.contains(activeElement))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      menuButton?.focus()
    }
  }, [sidebarOpen])

  const renderNavLinks = () => (
    <nav className="flex flex-col gap-16">
      <Link to="/admin" onClick={() => setSidebarOpen(false)}>
        대시보드
      </Link>
      <Link to="/admin/products" onClick={() => setSidebarOpen(false)}>
        상품관리
      </Link>
      <Link to="/admin/orders" onClick={() => setSidebarOpen(false)}>
        주문관리
      </Link>
      <Link to="/admin/members" onClick={() => setSidebarOpen(false)}>
        회원관리
      </Link>
      <Link to="/admin/sales" onClick={() => setSidebarOpen(false)}>
        매출관리
      </Link>
      <Link to="/admin/content" onClick={() => setSidebarOpen(false)}>
        콘텐츠 관리
      </Link>
    </nav>
  )

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <div className="flex h-56 shrink-0 items-center justify-between border-b border-line px-24 lg:hidden">
        <span className="text-sm font-bold">NOVERA ADMIN</span>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="메뉴 열기"
          aria-expanded={sidebarOpen}
          aria-controls="admin-mobile-sidebar"
          className="inline-flex h-32 w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </div>

      {sidebarOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={mobileSidebarRef}
        id="admin-mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="관리자 메뉴"
        aria-hidden={!sidebarOpen}
        inert={!sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 w-240 overflow-y-auto border-r border-line bg-surface p-24 transition-transform lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-24 flex items-center justify-between">
          <span className="text-sm font-bold">MENU</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="메뉴 닫기"
            className="inline-flex h-32 w-32 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-primary"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {renderNavLinks()}
      </aside>

      <aside className="hidden w-240 shrink-0 overflow-y-auto border-r border-line bg-surface p-24 lg:sticky lg:top-0 lg:block lg:h-svh">
        {renderNavLinks()}
      </aside>

      <main className="flex-1 p-24">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
