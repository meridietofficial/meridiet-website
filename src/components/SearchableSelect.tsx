import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export type SelectOption = {
  value: string
  label: string
}

type Props = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  hasError?: boolean
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  hasError = false,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // auto-focus search input when dropdown opens
    setTimeout(() => inputRef.current?.focus(), 0)
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find(o => o.value === value)?.label ?? ''

  return (
    <div className={`ss-wrap${disabled ? ' ss-wrap--disabled' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className={`ss-trigger${open ? ' ss-trigger--open' : ''}${hasError ? ' ss-trigger--err' : ''}`}
        onClick={() => { if (!disabled) setOpen(p => !p) }}
      >
        <span className={selectedLabel ? 'ss-value' : 'ss-placeholder'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={14} className={`ss-chevron${open ? ' rotated' : ''}`} />
      </button>

      {open && (
        <div className="ss-dropdown">
          <div className="ss-search-wrap">
            <Search size={13} className="ss-search-icon" />
            <input
              ref={inputRef}
              className="ss-search-input"
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="ss-clear"
                onClick={() => setSearch('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="ss-list">
            {filtered.length > 0 ? (
              filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  className={`ss-option${o.value === value ? ' sel' : ''}`}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  {o.label}
                  {o.value === value && <span className="ss-option-check">✓</span>}
                </button>
              ))
            ) : (
              <p className="ss-empty">No results for "{search}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
