'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Player } from '@/types'

export default function PlayerAdminTable({ players }: { players: Player[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState(100)
  const [adding, setAdding] = useState(false)

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

  async function addPlayer() {
    if (!newName.trim()) return
    setAdding(true)
    await fetch('/api/admin/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), base_price: newPrice }),
    })
    setNewName('')
    setNewPrice(100)
    setAdding(false)
    router.refresh()
  }

  async function removePlayer(id: string, name: string) {
    if (!confirm(`Remove ${name} from the player pool?`)) return
    setSaving(id)
    await fetch('/api/admin/players', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSaving(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Add player form */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">Player Name</label>
          <input
            placeholder="Enter name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
            className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
          />
        </div>
        <div className="w-28">
          <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">{'\u20B9'} Price</label>
          <input
            type="number"
            value={newPrice}
            onChange={e => setNewPrice(parseInt(e.target.value) || 0)}
            min={0}
            step={10}
            className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
          />
        </div>
        <button
          onClick={addPlayer}
          disabled={adding || !newName.trim()}
          className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-4 py-2 rounded transition uppercase tracking-wider text-xs shrink-0"
        >
          {adding ? 'Adding\u2026' : '+ Add'}
        </button>
      </div>

      {/* Player table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gold/50 border-b border-gold/20 text-xs uppercase tracking-wider">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Base Price ({'\u20B9'})</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Team</th>
              <th className="pb-3 w-10"></th>
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
                <td className="py-3 pr-4 text-cream/40">
                  {p.team_id ? <span className="text-gold">{'\u2713'} drafted</span> : '\u2014'}
                </td>
                <td className="py-3">
                  {!p.team_id && (
                    <button
                      onClick={() => removePlayer(p.id, p.name)}
                      disabled={saving === p.id}
                      className="text-cream/20 hover:text-red-400 transition text-lg leading-none"
                      title="Remove player"
                    >
                      {'\u00D7'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
