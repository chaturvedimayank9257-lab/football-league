'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { DraftSession, Player, Team } from '@/types'

export default function DraftRoom({
  initialSession,
  initialPlayers,
  initialTeams,
  myTeamId,
  isAdmin,
}: {
  initialSession: DraftSession | null
  initialPlayers: Player[]
  initialTeams: Team[]
  myTeamId: string | null
  isAdmin: boolean
}) {
  const [session, setSession] = useState(initialSession)
  const [players, setPlayers] = useState(initialPlayers)
  const [teams, setTeams] = useState(initialTeams)
  const [picking, setPicking] = useState<string | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    // Subscribe to realtime changes on draft_session and players tables
    const channel = supabase
      .channel('draft-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_session' }, payload => {
        setSession(payload.new as DraftSession)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, payload => {
        const updated = payload.new as Player
        setPlayers(prev => prev.filter(p => p.id !== updated.id))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, payload => {
        const updated = payload.new as Team
        setTeams(prev => prev.map(t => t.id === updated.id ? updated : t))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // supabase is a stable singleton — no need in deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pickPlayer(playerId: string) {
    setPicking(playerId)
    const res = await fetch('/api/draft/pick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    })
    if (!res.ok) {
      const { error } = await res.json()
      alert(error)
    }
    setPicking(null)
  }

  if (!session) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 text-lg">Draft has not started yet. Check back soon!</p>
      </div>
    )
  }

  const activeTeamId = session.status === 'active'
    ? session.snake_order[session.current_pick_index]
    : null
  const activeTeam = teams.find(t => t.id === activeTeamId)
  const isMyTurn = myTeamId === activeTeamId || isAdmin

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Draft</h1>
          {session.status === 'active' && activeTeam && (
            <p className="text-gray-400 mt-1">
              Pick {session.current_pick_index + 1}/{session.snake_order.length} —
              <span className="font-semibold" style={{ color: activeTeam.color }}>
                {' '}{activeTeam.name}&apos;s turn
              </span>
            </p>
          )}
          {session.status === 'paused' && (
            <p className="text-yellow-400 mt-1">Draft is paused</p>
          )}
          {session.status === 'completed' && (
            <p className="text-green-400 mt-1">Draft complete!</p>
          )}
        </div>

        {/* Team budgets */}
        <div className="flex gap-4 text-sm">
          {teams.map(t => (
            <div key={t.id} className="text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: t.color }} />
              <div className="font-mono text-xs">₹{t.budget_remaining}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Player pool */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => pickPlayer(p.id)}
            disabled={!isMyTurn || session.status !== 'active' || picking === p.id}
            className={`bg-gray-900 border rounded-lg p-3 text-left transition ${
              isMyTurn && session.status === 'active'
                ? 'border-gray-700 hover:border-green-500 hover:bg-gray-800 cursor-pointer'
                : 'border-gray-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="font-medium text-sm">{p.name}</div>
            <div className="text-gray-400 text-xs mt-1">₹{p.base_price}</div>
            {picking === p.id && (
              <div className="text-green-400 text-xs mt-1">Picking…</div>
            )}
          </button>
        ))}
        {players.length === 0 && session.status !== 'completed' && (
          <p className="col-span-full text-gray-400 text-center py-8">All players drafted!</p>
        )}
      </div>
    </div>
  )
}
