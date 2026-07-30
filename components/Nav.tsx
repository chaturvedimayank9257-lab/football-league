'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/teams', label: 'Teams' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/standings', label: 'Standings' },
  { href: '/draft', label: 'Draft' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-navy-light border-b-2 border-gold/30 px-4 py-0">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16">
        {/* Logo + Wordmark */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="BPL Crest" width={40} height={40} className="rounded" />
          <div className="hidden sm:block leading-tight">
            <span className="text-gold font-bold text-sm tracking-widest uppercase">Barely Premier</span>
            <span className="block text-cream/60 text-[10px] tracking-[0.2em] uppercase">League · Est. 2026</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-5 text-sm font-semibold uppercase tracking-wider transition border-b-2 ${
                  active
                    ? 'text-gold border-gold'
                    : 'text-cream/60 border-transparent hover:text-gold-light hover:border-gold/40'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-cream/60 hover:text-gold p-2"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gold/20 pb-3">
          {links.map(l => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wider ${
                  active ? 'text-gold bg-navy/50' : 'text-cream/60 hover:text-gold'
                }`}
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
