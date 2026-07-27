'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Player } from '@/types'

export default function PlayerAdminTable({ players }: { players: Player[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)

  async function update(id: string, data: Partial<Player>) {
    setSaving(id)
    await fetch('/api/admin/players', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    })
    setSaving(null)
    router.refresh()
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-400 border-b border-gray-800">
          <th className="pb-2 pr-4">Name</th>
          <th className="pb-2 pr-4">Base Price (₹)</th>
          <th className="pb-2 pr-4">Status</th>
          <th className="pb-2">Team</th>
        </tr>
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p.id} className="border-b border-gray-900 hover:bg-gray-900">
            <td className="py-2 pr-4 font-medium">{p.name}</td>
            <td className="py-2 pr-4">
              <input
                type="number"
                defaultValue={p.base_price}
                min={0}
                step={10}
                onBlur={e => update(p.id, { base_price: parseInt(e.target.value) })}
                className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white"
              />
            </td>
            <td className="py-2 pr-4">
              <button
                onClick={() => update(p.id, {
                  status: p.status === 'confirmed' ? 'tentative' : 'confirmed'
                })}
                disabled={saving === p.id}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  p.status === 'confirmed'
                    ? 'bg-green-900 text-green-300'
                    : 'bg-yellow-900 text-yellow-300'
                }`}
              >
                {p.status}
              </button>
            </td>
            <td className="py-2 text-gray-400">
              {p.team_id ? '✓ drafted' : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
