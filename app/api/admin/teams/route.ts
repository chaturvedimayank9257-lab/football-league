// app/api/admin/teams/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createTeam, updateTeam } from '@/lib/db/teams'

export async function POST(request: NextRequest) {
  const data = await request.json()
  const team = await createTeam(data)
  return NextResponse.json(team)
}

export async function PATCH(request: NextRequest) {
  const { id, ...data } = await request.json()
  await updateTeam(id, data)
  return NextResponse.json({ ok: true })
}
