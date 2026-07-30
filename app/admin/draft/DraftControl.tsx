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
      <div className="bg-navy-light border border-navy-mid/50 rounded-lg p-5 space-y-4">
        <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em]">Create Captain Login</h2>
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
        >
          <option value="">Select team&hellip;</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          placeholder="Captain email"
          value={captainEmail}
          onChange={e => setCaptainEmail(e.target.value)}
          className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={captainPass}
          onChange={e => setCaptainPass(e.target.value)}
          className="w-full bg-navy border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
        />
        <button
          onClick={createCaptain}
          disabled={loading || !captainEmail || !captainPass || !selectedTeam}
          className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
        >
          Create Account
        </button>
        {msg && <p className="text-sm text-gold/70">{msg}</p>}
      </div>

      {/* Draft start/pause/resume */}
      <div className="bg-navy-light border border-navy-mid/50 rounded-lg p-5 space-y-4">
        <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em]">Draft Session</h2>
        <p className="text-sm text-cream/60">
          Status: <span className="text-gold font-mono font-bold">{session?.status ?? 'not started'}</span>
          {session && ` \u2022 Pick ${session.current_pick_index + 1} of ${session.snake_order.length}`}
        </p>
        {!session || session.status === 'setup' ? (
          <>
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
              onClick={() => draftAction('start')}
              disabled={loading || teams.length < 2}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
            >
              Start Draft
            </button>
          </>
        ) : session.status === 'active' ? (
          <button
            onClick={() => draftAction('pause')}
            disabled={loading}
            className="bg-navy border-2 border-gold/50 hover:border-gold disabled:opacity-50 text-gold font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            Pause Draft
          </button>
        ) : session.status === 'paused' ? (
          <button
            onClick={() => draftAction('resume')}
            disabled={loading}
            className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            Resume Draft
          </button>
        ) : (
          <p className="text-gold font-semibold">Draft complete!</p>
        )}
      </div>
    </div>
  )
}
