// app/api/admin/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updatePlayer, createPlayer, deletePlayer } from '@/lib/db/players'

export async function POST(request: NextRequest) {
  const { name, base_price } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const player = await createPlayer(name, base_price ?? 100)
  return NextResponse.json(player)
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  await updatePlayer(id, data)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await deletePlayer(id)
  return NextResponse.json({ ok: true })
}
