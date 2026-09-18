import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface SortOption {
  value: string
  label: string
}

interface SortDropdownProps {
  value: string
  options: SortOption[]
  onChange: (value: string) => void
  ariaLabel: string
}

function SortDropdown({ value, options, onChange, ariaLabel }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative w-[112px] sm:w-[120px] lg:w-[128px]">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-32 w-full items-center justify-between rounded-sm border border-line bg-surface px-10 text-caption text-primary transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-[34px] sm:px-12 sm:text-body-sm lg:h-36"
      >
        <span>{selected?.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={`text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-20 mt-4 w-full overflow-hidden rounded-sm border border-line bg-surface py-2 shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={`flex h-32 w-full items-center justify-between px-10 text-left text-caption transition-colors hover:bg-surface-muted sm:h-36 sm:px-12 sm:text-body-sm ${
                  active ? 'font-medium text-primary' : 'text-secondary'
                }`}
              >
                <span>{option.label}</span>
                {active && <Check size={13} strokeWidth={1.5} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SortDropdown
