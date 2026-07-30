'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Team, Player } from '@/types'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']

export default function TeamSetupPanel({
  teams,
  players,
}: {
  teams: Team[]
  players: Player[]
}) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[teams.length % COLORS.length])
  const [captainId, setCaptainId] = useState('')
  const [budget, setBudget] = useState(1000)
  const [creating, setCreating] = useState(false)

  async function createTeam() {
    if (!name || !captainId) return
    setCreating(true)
    await fetch('/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, captain_id: captainId, budget_remaining: budget }),
    })
    setName('')
    setCaptainId('')
    setCreating(false)
    router.refresh()
  }

  const assignedCaptainIds = new Set(teams.map(t => t.captain_id).filter(Boolean))
  const availableCaptains = players.filter(p => !assignedCaptainIds.has(p.id) && !p.team_id)

  return (
    <div className="space-y-6">
      {/* Existing teams */}
      <div className="space-y-3">
        {teams.map(team => (
          <div key={team.id} className="flex items-center gap-3 bg-navy-light border border-navy-mid/50 rounded-lg p-4">
            <div className="w-4 h-4 rounded-full ring-1 ring-white/20" style={{ backgroundColor: team.color }} />
            <span className="font-bold text-cream">{team.name}</span>
            <span className="text-cream/40 text-sm">
              Captain: {players.find(p => p.id === team.captain_id)?.name ?? '\u2014'}
            </span>
            <span className="ml-auto text-gold/70 text-sm font-mono">{'\u20B9'}{team.budget_remaining}</span>
          </div>
        ))}
      </div>

      {/* Create team form */}
      {teams.length < 5 && (
        <div className="bg-navy-light border border-navy-mid/50 rounded-lg p-5 space-y-4">
          <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em]">New Team</h2>
          <input
            placeholder="Team name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition ${color === c ? 'border-gold scale-110' : 'border-transparent hover:border-cream/30'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <select
            value={captainId}
            onChange={e => setCaptainId(e.target.value)}
            className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
          >
            <option value="">Select captain&hellip;</option>
            {availableCaptains.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <label className="text-xs text-cream/40 uppercase tracking-wider">Starting purse {'\u20B9'}</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value))}
              step={100}
              className="w-24 bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
            />
          </div>
          <button
            onClick={createTeam}
            disabled={creating || !name || !captainId}
            className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            {creating ? 'Creating\u2026' : 'Create Team'}
          </button>
        </div>
      )}
    </div>
  )
}
