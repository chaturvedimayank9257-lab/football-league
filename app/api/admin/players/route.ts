// app/api/admin/players/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updatePlayer } from '@/lib/db/players'

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  await updatePlayer(id, data)
  return NextResponse.json({ ok: true })
}
