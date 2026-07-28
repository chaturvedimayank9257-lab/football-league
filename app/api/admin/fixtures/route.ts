import { NextResponse } from 'next/server'
import { getTeams } from '@/lib/db/teams'
import { createGroupMatches, getMatches } from '@/lib/db/matches'
import { generateRoundRobin } from '@/lib/utils/round-robin'

export async function POST() {
  const existing = await getMatches('group')
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Fixtures already generated' }, { status: 400 })
  }
  const teams = await getTeams()
  const fixtures = generateRoundRobin(teams.map(t => t.id))
  await createGroupMatches(fixtures)
  return NextResponse.json({ count: fixtures.length })
}
