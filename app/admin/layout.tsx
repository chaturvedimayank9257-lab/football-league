// app/admin/layout.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/teams', label: 'Teams' },
  { href: '/admin/draft', label: 'Draft' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/simulate', label: 'Simulate' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-1 mb-8 border-b border-gold/20">
        {tabs.map(t => {
          const active = pathname === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition border-b-2 -mb-px ${
                active
                  ? 'text-gold border-gold'
                  : 'text-cream/40 border-transparent hover:text-cream/70 hover:border-gold/30'
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
      {children}
    </div>
  )
}
