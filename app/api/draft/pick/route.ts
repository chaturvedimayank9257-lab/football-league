import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getDraftSession, advancePick } from '@/lib/db/draft'
import { draftPlayer } from '@/lib/db/players'
import { deductBudget, getTeams } from '@/lib/db/teams'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = user.user_metadata?.team_id
  const isAdmin = user.user_metadata?.role === 'admin'

  const session = await getDraftSession()
  if (!session || session.status !== 'active') {
    return NextResponse.json({ error: 'Draft not active' }, { status: 400 })
  }

  const activeTeamId = session.snake_order[session.current_pick_index]

  // Only the active captain (or admin) can pick
  if (!isAdmin && teamId !== activeTeamId) {
    return NextResponse.json({ error: 'Not your turn' }, { status: 403 })
  }

  const { playerId } = await request.json()

  // Get player base price
  const teams = await getTeams()
  const team = teams.find(t => t.id === activeTeamId)
  if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 400 })

  // Fetch player to get base_price
  const { data: player, error: playerErr } = await (await createServerClient())
    .from('players')
    .select('base_price, team_id')
    .eq('id', playerId)
    .single()

  if (playerErr || !player) return NextResponse.json({ error: 'Player not found' }, { status: 400 })
  if (player.team_id) return NextResponse.json({ error: 'Already drafted' }, { status: 400 })
  if (team.budget_remaining < player.base_price) {
    return NextResponse.json({ error: 'Insufficient budget' }, { status: 400 })
  }

  await draftPlayer(playerId, activeTeamId, player.base_price)
  await deductBudget(activeTeamId, player.base_price)

  // Advance to next pick (or complete if last pick)
  const nextIndex = session.current_pick_index + 1
  if (nextIndex >= session.snake_order.length) {
    const { upsertDraftSession } = await import('@/lib/db/draft')
    await upsertDraftSession({ status: 'completed', current_pick_index: nextIndex })
  } else {
    await advancePick()
  }

  return NextResponse.json({ ok: true })
}
