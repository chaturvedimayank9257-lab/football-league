'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftSession, Team } from '@/types'

export default function DraftControl({
  session,
  teams,
}: {
  session: DraftSession | null
  teams: Team[]
}) {
  const router = useRouter()
  const [budget, setBudget] = useState(1000)
  const [captainEmail, setCaptainEmail] = useState('')
  const [captainPass, setCaptainPass] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function draftAction(action: string) {
    setLoading(true)
    await fetch('/api/admin/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, starting_budget: budget }),
    })
    setLoading(false)
    router.refresh()
  }

  async function createCaptain() {
    setLoading(true)
    const res = await fetch('/api/admin/captain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: captainEmail, password: captainPass, teamId: selectedTeam }),
    })
    const json = await res.json()
    setMsg(json.error ?? `Captain account created: ${captainEmail}`)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Captain account creation */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-400 text-sm uppercase">Create Captain Login</h2>
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        >
          <option value="">Select team…</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          placeholder="Captain email"
          value={captainEmail}
          onChange={e => setCaptainEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={captainPass}
          onChange={e => setCaptainPass(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        />
        <button
          onClick={createCaptain}
          disabled={loading || !captainEmail || !captainPass || !selectedTeam}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          Create Account
        </button>
        {msg && <p className="text-sm text-green-400">{msg}</p>}
      </div>

      {/* Draft start/pause/resume */}
      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-400 text-sm uppercase">Draft Session</h2>
        <p className="text-sm">
          Status: <span className="text-green-400 font-mono">{session?.status ?? 'not started'}</span>
          {session && ` | Pick ${session.current_pick_index + 1} of ${session.snake_order.length}`}
        </p>
        {!session || session.status === 'setup' ? (
          <>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-400">Starting purse ₹</label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(parseInt(e.target.value))}
                step={100}
                className="w-24 bg-gray-800 border border-gray-700 rounded px-3 py-2"
              />
            </div>
            <button
              onClick={() => draftAction('start')}
              disabled={loading || teams.length < 2}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              Start Draft
            </button>
          </>
        ) : session.status === 'active' ? (
          <button
            onClick={() => draftAction('pause')}
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Pause Draft
          </button>
        ) : session.status === 'paused' ? (
          <button
            onClick={() => draftAction('resume')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            Resume Draft
          </button>
        ) : (
          <p className="text-green-400">Draft complete!</p>
        )}
      </div>
    </div>
  )
}
