// app/api/admin/draft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDraftSession, upsertDraftSession } from '@/lib/db/draft'
import { getTeams, updateTeam, deductBudget } from '@/lib/db/teams'
import { getAvailablePlayers, draftPlayer } from '@/lib/db/players'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, starting_budget } = body

  if (action === 'start') {
    const [teams, players] = await Promise.all([getTeams(), getAvailablePlayers()])
    if (teams.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 teams to start draft' }, { status: 400 })
    }
    if (players.length === 0) {
      return NextResponse.json({ error: 'No confirmed players available' }, { status: 400 })
    }
    const budget = starting_budget ?? 1000
    await Promise.all(teams.map(t => updateTeam(t.id, { budget_remaining: budget })))
    const session = await upsertDraftSession({
      status: 'active',
      snake_order: [],
      current_pick_index: 0,
      current_player_id: null,
      starting_budget: budget,
    })
    return NextResponse.json(session)
  }

  if (action === 'pause') {
    const session = await upsertDraftSession({ status: 'paused' })
    return NextResponse.json(session)
  }

  if (action === 'resume') {
    const session = await upsertDraftSession({ status: 'active' })
    return NextResponse.json(session)
  }

  if (action === 'next_player') {
    const players = await getAvailablePlayers()
    if (players.length === 0) {
      const session = await upsertDraftSession({ status: 'completed', current_player_id: null })
      return NextResponse.json({ session, player: null })
    }
    const picked = players[Math.floor(Math.random() * players.length)]
    const session = await upsertDraftSession({ current_player_id: picked.id })
    return NextResponse.json({ session, player: picked })
  }

  if (action === 'assign_player') {
    const { playerId, teamId, soldPrice } = body
    if (!playerId || !teamId || typeof soldPrice !== 'number') {
      return NextResponse.json({ error: 'playerId, teamId, soldPrice required' }, { status: 400 })
    }
    const teams = await getTeams()
    const team = teams.find(t => t.id === teamId)
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 400 })
    if (team.budget_remaining < soldPrice) {
      return NextResponse.json({ error: 'Insufficient budget' }, { status: 400 })
    }
    const admin = createAdminClient()
    const { data: playerRow, error: playerErr } = await admin
      .from('players')
      .select('team_id')
      .eq('id', playerId)
      .single()
    if (playerErr || !playerRow) return NextResponse.json({ error: 'Player not found' }, { status: 400 })
    if ((playerRow as { team_id: string | null }).team_id) {
      return NextResponse.json({ error: 'Player already assigned' }, { status: 400 })
    }
    await draftPlayer(playerId, teamId, soldPrice)
    // Deduct budget and advance session — always clear current_player_id even on error
    const session = await getDraftSession()
    await upsertDraftSession({
      current_player_id: null,
      current_pick_index: (session?.current_pick_index ?? 0) + 1,
    })
    await deductBudget(teamId, soldPrice)
    return NextResponse.json({ ok: true })
  }

  if (action === 'skip_player') {
    const session = await upsertDraftSession({ current_player_id: null })
    return NextResponse.json(session)
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
