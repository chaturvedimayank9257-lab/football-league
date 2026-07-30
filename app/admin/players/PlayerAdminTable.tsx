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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gold/50 border-b border-gold/20 text-xs uppercase tracking-wider">
            <th className="pb-3 pr-4">Name</th>
            <th className="pb-3 pr-4">Base Price ({'\u20B9'})</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Team</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p.id} className="border-b border-navy-mid/50 hover:bg-navy-light transition">
              <td className="py-3 pr-4 font-medium text-cream">{p.name}</td>
              <td className="py-3 pr-4">
                <input
                  type="number"
                  defaultValue={p.base_price}
                  min={0}
                  step={10}
                  onBlur={e => update(p.id, { base_price: parseInt(e.target.value) })}
                  className="w-20 bg-navy border border-navy-mid rounded px-2 py-1 text-cream focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
                />
              </td>
              <td className="py-3 pr-4">
                <button
                  onClick={() => update(p.id, {
                    status: p.status === 'confirmed' ? 'tentative' : 'confirmed'
                  })}
                  disabled={saving === p.id}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    p.status === 'confirmed'
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-navy border border-cream/20 text-cream/50'
                  }`}
                >
                  {p.status}
                </button>
              </td>
              <td className="py-3 text-cream/40">
                {p.team_id ? <span className="text-gold">{'\u2713'} drafted</span> : '\u2014'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
