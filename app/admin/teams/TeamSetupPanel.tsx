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
          <div key={team.id} className="flex items-center gap-3 bg-gray-900 rounded-lg p-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }} />
            <span className="font-semibold">{team.name}</span>
            <span className="text-gray-400 text-sm">
              Captain: {players.find(p => p.id === team.captain_id)?.name ?? '—'}
            </span>
            <span className="ml-auto text-green-400 text-sm">₹{team.budget_remaining} left</span>
          </div>
        ))}
      </div>

      {/* Create team form */}
      {teams.length < 5 && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">New Team</h2>
          <input
            placeholder="Team name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <select
            value={captainId}
            onChange={e => setCaptainId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
          >
            <option value="">Select captain…</option>
            {availableCaptains.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">Starting purse ₹</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(parseInt(e.target.value))}
              step={100}
              className="w-24 bg-gray-800 border border-gray-700 text-white rounded px-3 py-2"
            />
          </div>
          <button
            onClick={createTeam}
            disabled={creating || !name || !captainId}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded font-medium"
          >
            {creating ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      )}
    </div>
  )
}
