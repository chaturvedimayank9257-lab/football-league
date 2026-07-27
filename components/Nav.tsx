import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-green-400 font-bold text-lg tracking-tight">
          ⚽ League 2026
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/teams" className="text-gray-300 hover:text-white transition">Teams</Link>
          <Link href="/fixtures" className="text-gray-300 hover:text-white transition">Fixtures</Link>
          <Link href="/standings" className="text-gray-300 hover:text-white transition">Standings</Link>
          <Link href="/draft" className="text-green-400 hover:text-green-300 transition">Draft</Link>
        </div>
      </div>
    </nav>
  )
}
