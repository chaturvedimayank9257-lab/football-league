// app/admin/layout.tsx
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-4 mb-6 text-sm border-b border-gray-800 pb-4">
        <Link href="/admin/players" className="text-gray-300 hover:text-white">Players</Link>
        <Link href="/admin/teams" className="text-gray-300 hover:text-white">Teams</Link>
        <Link href="/admin/draft" className="text-gray-300 hover:text-white">Draft</Link>
        <Link href="/admin/results" className="text-gray-300 hover:text-white">Results</Link>
      </div>
      {children}
    </div>
  )
}
