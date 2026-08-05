// lib/db/matches.ts
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Match, MatchStage, RoundFixture } from '@/types'

export async function getMatches(stage?: MatchStage): Promise<Match[]> {
  const supabase = await createServerClient()
  let query = supabase.from('matches').select('*').order('round').order('created_at')
  if (stage) query = query.eq('stage', stage)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createGroupMatches(fixtures: RoundFixture[]): Promise<void> {
  const supabase = createAdminClient()
  const rows = fixtures.map(f => ({
    team1_id: f.team1Id,
    team2_id: f.team2Id,
    round: f.round,
    stage: 'group' as MatchStage,
  }))
  const { error } = await supabase.from('matches').insert(rows)
  if (error) throw error
}

export async function updateMatchResult(
  id: string,
  team1Score: number,
  team2Score: number
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('matches')
    .update({ team1_score: team1Score, team2_score: team2Score, status: 'completed' })
    .eq('id', id)
  if (error) throw error
}

export async function createKnockoutMatches(
  standings: { teamId: string }[]
): Promise<void> {
  if (standings.length < 4) {
    throw new Error(`Need at least 4 teams for knockouts, got ${standings.length}`)
  }
  const supabase = createAdminClient()
  const semis = [
    { team1_id: standings[0].teamId, team2_id: standings[3].teamId, stage: 'semi' as MatchStage, round: 1 },
    { team1_id: standings[1].teamId, team2_id: standings[2].teamId, stage: 'semi' as MatchStage, round: 2 },
  ]
  const { error } = await supabase.from('matches').insert(semis)
  if (error) throw error
}
