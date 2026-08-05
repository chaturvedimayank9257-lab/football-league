// app/api/admin/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updatePlayer, createPlayer, deletePlayer } from '@/lib/db/players'
import { getTeams } from '@/lib/db/teams'

export async function POST(request: NextRequest) {
  const { name, base_price } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const player = await createPlayer(name.trim(), base_price ?? 50)
  return NextResponse.json(player)
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  await updatePlayer(id, data)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  // Prevent deleting a player who is a team captain
  const teams = await getTeams()
  const isCaptain = teams.some(t => t.captain_id === id)
  if (isCaptain) {
    return NextResponse.json({ error: 'Cannot delete a team captain' }, { status: 400 })
  }

  await deletePlayer(id)
  return NextResponse.json({ ok: true })
}
