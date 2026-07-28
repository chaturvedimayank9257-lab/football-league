// app/api/admin/draft/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { upsertDraftSession } from '@/lib/db/draft'
import { getTeams } from '@/lib/db/teams'
import { generateSnakeOrder } from '@/lib/utils/snake-draft'
import { getConfirmedPlayers } from '@/lib/db/players'

export async function POST(request: NextRequest) {
  const { action, starting_budget } = await request.json()

  if (action === 'start') {
    const [teams, players] = await Promise.all([getTeams(), getConfirmedPlayers()])
    const teamIds = teams.map(t => t.id)
    const snakeOrder = generateSnakeOrder(teamIds, players.length)
    const session = await upsertDraftSession({
      status: 'active',
      snake_order: snakeOrder,
      current_pick_index: 0,
      starting_budget: starting_budget ?? 1000,
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

  return NextResponse.json({ error: 'unknown action' }, { status: 400 })
}
