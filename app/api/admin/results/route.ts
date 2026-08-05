import { NextRequest, NextResponse } from 'next/server'
import { updateMatchResult, getMatches, createKnockoutMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import { computeStandings } from '@/lib/utils/standings'
import type { CompletedMatch } from '@/types'

export async function PATCH(request: NextRequest) {
  const { id, team1Score, team2Score } = await request.json()
  if (!id) return NextResponse.json({ error: 'Match ID required' }, { status: 400 })
  if (team1Score == null || team2Score == null) {
    return NextResponse.json({ error: 'Both scores required' }, { status: 400 })
  }
  await updateMatchResult(id, team1Score, team2Score)
  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const { action } = await request.json()
  if (action !== 'generate_knockouts') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const [teams, matches] = await Promise.all([getTeams(), getMatches('group')])

  // Verify all group matches are completed
  const allDone = matches.length > 0 && matches.every(m => m.status === 'completed')
  if (!allDone) {
    return NextResponse.json({ error: 'Not all group matches are completed' }, { status: 400 })
  }

  const completedMatches: CompletedMatch[] = matches.map(m => ({
    team1Id: m.team1_id,
    team2Id: m.team2_id,
    team1Score: m.team1_score!,
    team2Score: m.team2_score!,
    status: 'completed',
  }))

  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  if (standings.length < 4) {
    return NextResponse.json({ error: 'Need at least 4 teams for knockouts' }, { status: 400 })
  }

  await createKnockoutMatches(standings)
  return NextResponse.json({ ok: true })
}
