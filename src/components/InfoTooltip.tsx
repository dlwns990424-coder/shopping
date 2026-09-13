import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  label: string
  children: ReactNode
}

// 터치 기기는 hover가 없어서 클릭으로 토글하고, 바깥을 클릭하면 닫는다(모바일 유니클로/W컨셉 패턴).
function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-4 border-none bg-transparent p-0 text-caption text-secondary"
        aria-expanded={open}
      >
        <span>{label}</span>
        <Info size={14} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-10 w-240 rounded-sm border border-line bg-surface p-12 text-caption leading-[1.5] text-secondary shadow-md">
          {children}
        </div>
      )}
    </div>
  )
}

export default InfoTooltip
