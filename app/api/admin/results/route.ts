import { NextRequest, NextResponse } from 'next/server'
import { updateMatchResult, getMatches, createKnockoutMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import { computeStandings } from '@/lib/utils/standings'
import type { CompletedMatch } from '@/types'

export async function PATCH(request: NextRequest) {
  const { id, team1Score, team2Score } = await request.json()
  await updateMatchResult(id, team1Score, team2Score)
  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const { action } = await request.json()
  if (action !== 'generate_knockouts') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const [teams, matches] = await Promise.all([getTeams(), getMatches('group')])
  const completedMatches: CompletedMatch[] = matches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      team1Score: m.team1_score!,
      team2Score: m.team2_score!,
      status: 'completed',
    }))

  const standings = computeStandings(teams.map(t => t.id), completedMatches)
  await createKnockoutMatches(standings)
  return NextResponse.json({ ok: true })
}
