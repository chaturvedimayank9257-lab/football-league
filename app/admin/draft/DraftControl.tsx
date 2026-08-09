'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftSession, Player, Team } from '@/types'

export default function DraftControl({
  session,
  teams,
}: {
  session: DraftSession | null
  teams: Team[]
}) {
  const router = useRouter()
  const [budget, setBudget] = useState(1000)
  const [loading, setLoading] = useState(false)

  // Auction modal state
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState('')
  const [bidPrice, setBidPrice] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

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

  async function nextPlayer() {
    setLoading(true)
    const res = await fetch('/api/admin/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'next_player' }),
    })
    const json = await res.json()
    setLoading(false)
    router.refresh()
    if (json.player) {
      setCurrentPlayer(json.player)
      setBidPrice(json.player.base_price)
      setSelectedTeam('')
      setModalError('')
      setModalOpen(true)
    }
  }

  async function confirmSale() {
    if (!currentPlayer || !selectedTeam) return
    setSubmitting(true)
    setModalError('')
    const res = await fetch('/api/admin/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'assign_player',
        playerId: currentPlayer.id,
        teamId: selectedTeam,
        soldPrice: bidPrice,
      }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      setModalError(json.error ?? 'Something went wrong')
    } else {
      setModalOpen(false)
      setCurrentPlayer(null)
      router.refresh()
    }
  }

  async function skipPlayer() {
    setSubmitting(true)
    await fetch('/api/admin/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'skip_player' }),
    })
    setSubmitting(false)
    setModalOpen(false)
    setCurrentPlayer(null)
    router.refresh()
  }

  const isActive = session?.status === 'active'
  const hasPlayerUp = !!session?.current_player_id

  return (
    <div className="space-y-8">
      {/* Team purses */}
      {teams.length > 0 && (
        <div className="bg-navy-light border border-navy-mid/50 rounded-lg p-5">
          <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em] mb-4">Team Purses</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {teams.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-navy rounded-lg px-4 py-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <div className="min-w-0">
                  <div className="text-xs text-cream/50 truncate">{t.name}</div>
                  <div className="font-mono font-bold text-gold">&#8377;{t.budget_remaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft session control */}
      <div className="bg-navy-light border border-navy-mid/50 rounded-lg p-5 space-y-4">
        <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em]">Auction Session</h2>
        <p className="text-sm text-cream/60">
          Status: <span className="text-gold font-mono font-bold">{session?.status ?? 'not started'}</span>
          {session && ` \u2022 Players sold: ${session.current_pick_index}`}
        </p>

        {!session || session.status === 'setup' ? (
          <>
            <div className="flex items-center gap-3">
              <label className="text-xs text-cream/40 uppercase tracking-wider">Starting purse &#8377;</label>
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
              Start Auction
            </button>
          </>
        ) : session.status === 'active' ? (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={nextPlayer}
              disabled={loading || hasPlayerUp}
              className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
            >
              {loading ? 'Loading…' : 'Next Player'}
            </button>
            <button
              onClick={() => draftAction('pause')}
              disabled={loading}
              className="bg-navy border-2 border-gold/50 hover:border-gold disabled:opacity-50 text-gold font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
            >
              Pause
            </button>
          </div>
        ) : session.status === 'paused' ? (
          <button
            onClick={() => draftAction('resume')}
            disabled={loading}
            className="bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            Resume Auction
          </button>
        ) : (
          <p className="text-gold font-semibold">Auction complete!</p>
        )}
      </div>

      {/* Auction modal */}
      {modalOpen && currentPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-navy border border-navy-mid rounded-2xl p-8 w-full max-w-md mx-4 space-y-6">
            <div className="text-center">
              <span className="inline-block bg-gold/20 text-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 animate-pulse">
                Up for Auction
              </span>
              <h2 className="text-3xl font-bold text-cream">{currentPlayer.name}</h2>
              <p className="text-cream/40 mt-1">Base price: <span className="font-mono text-gold/70">&#8377;{currentPlayer.base_price}</span></p>
            </div>

            <div className="space-y-3">
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="w-full bg-navy-light border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition"
              >
                <option value="">Select winning team…</option>
                {teams.map(t => (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={t.budget_remaining < bidPrice}
                  >
                    {t.name} (&#8377;{t.budget_remaining}){t.budget_remaining < bidPrice ? ' — insufficient' : ''}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <label className="text-xs text-cream/40 uppercase tracking-wider whitespace-nowrap">Final Bid &#8377;</label>
                <input
                  type="number"
                  value={bidPrice}
                  onChange={e => setBidPrice(parseInt(e.target.value) || 0)}
                  min={0}
                  className="flex-1 bg-navy-light border border-navy-mid text-cream rounded px-3 py-2.5 focus:ring-1 focus:ring-gold/50 focus:border-gold/50 transition font-mono"
                />
              </div>

              {modalError && <p className="text-red-400 text-sm">{modalError}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmSale}
                disabled={submitting || !selectedTeam || bidPrice <= 0}
                className="flex-1 bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
              >
                {submitting ? 'Confirming…' : 'Confirm Sale'}
              </button>
              <button
                onClick={skipPlayer}
                disabled={submitting}
                className="bg-navy border border-navy-mid/50 hover:border-gold/30 disabled:opacity-50 text-cream/50 font-bold px-4 py-2.5 rounded-lg transition text-sm"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
