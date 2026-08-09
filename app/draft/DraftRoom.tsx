'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { DraftSession, Player, Team } from '@/types'

export default function DraftRoom({
  initialSession,
  initialRecentlySold,
  initialTeams,
  initialCurrentPlayer,
}: {
  initialSession: DraftSession | null
  initialRecentlySold: Player[]
  initialTeams: Team[]
  initialCurrentPlayer: Player | null
}) {
  const [session, setSession] = useState(initialSession)
  const [soldPlayers, setSoldPlayers] = useState<Player[]>(initialRecentlySold)
  const [teams, setTeams] = useState(initialTeams)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(initialCurrentPlayer)

  const supabase = createBrowserClient()

  useEffect(() => {
    const channel = supabase
      .channel('draft-room')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draft_session' }, payload => {
        setSession(payload.new as DraftSession)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players' }, async payload => {
        const updated = payload.new as Player
        if (updated.team_id) {
          // Player was sold — prepend to feed
          setSoldPlayers(prev => [updated, ...prev].slice(0, 10))
          // Clear current player if it was this one
          setCurrentPlayer(prev => (prev?.id === updated.id ? null : prev))
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, payload => {
        const updated = payload.new as Team
        setTeams(prev => prev.map(t => t.id === updated.id ? updated : t))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When session changes, fetch the current player if needed
  useEffect(() => {
    if (!session?.current_player_id) {
      setCurrentPlayer(null)
      return
    }
    // Fetch from public read
    supabase
      .from('players')
      .select('*')
      .eq('id', session.current_player_id)
      .single()
      .then(({ data }) => {
        if (data) setCurrentPlayer(data as Player)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.current_player_id])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Current auction */}
      <div className="bg-navy-light border border-navy-mid/50 rounded-2xl p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
        {!session || session.status === 'setup' ? (
          <p className="text-cream/30 text-lg">Auction has not started yet.</p>
        ) : session.status === 'completed' ? (
          <p className="text-gold text-2xl font-bold">Auction Complete!</p>
        ) : currentPlayer ? (
          <>
            <span className="inline-block bg-gold/20 text-gold text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5 animate-pulse">
              Live Auction
            </span>
            <h1 className="text-4xl font-bold text-cream mb-3">{currentPlayer.name}</h1>
            <p className="text-cream/40 text-lg">Base price: <span className="font-mono text-gold">&#8377;{currentPlayer.base_price}</span></p>
          </>
        ) : (
          <p className="text-cream/30 text-lg">
            {session.status === 'paused' ? 'Auction paused…' : 'Waiting for next player…'}
          </p>
        )}
      </div>

      {/* Team budgets */}
      {teams.length > 0 && (
        <div>
          <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em] mb-3">Team Purses</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {teams.map(t => (
              <div key={t.id} className="bg-navy-light border border-navy-mid/50 rounded-lg px-4 py-3 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                <div className="min-w-0">
                  <div className="text-xs text-cream/50 truncate">{t.name}</div>
                  <div className="font-mono font-bold text-gold text-lg">&#8377;{t.budget_remaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently sold */}
      {soldPlayers.length > 0 && (
        <div>
          <h2 className="font-bold text-xs text-gold/50 uppercase tracking-[0.2em] mb-3">Recently Sold</h2>
          <div className="space-y-2">
            {soldPlayers.map(p => {
              const team = teams.find(t => t.id === p.team_id)
              return (
                <div key={p.id} className="bg-navy-light border border-navy-mid/30 rounded-lg px-4 py-2.5 flex items-center justify-between">
                  <span className="text-cream font-medium">{p.name}</span>
                  <span className="text-sm text-cream/40">
                    {team && (
                      <span className="mr-2" style={{ color: team.color }}>{team.name}</span>
                    )}
                    <span className="font-mono text-gold/70">&#8377;{p.sold_price}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
