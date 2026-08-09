// types/index.ts

export type PlayerStatus = 'confirmed' | 'tentative'
export type DraftSessionStatus = 'setup' | 'active' | 'paused' | 'completed'
export type MatchStage = 'group' | 'semi' | 'third_place' | 'final'
export type MatchStatus = 'scheduled' | 'completed'

export interface Player {
  id: string
  name: string
  base_price: number
  status: PlayerStatus
  team_id: string | null
  sold_price: number | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  color: string
  captain_id: string | null
  budget_remaining: number
  created_at: string
}

export interface DraftSession {
  id: string
  status: DraftSessionStatus
  snake_order: string[]
  current_pick_index: number  // repurposed as "players sold" counter
  current_player_id: string | null
  starting_budget: number
  created_at: string
}

export interface Match {
  id: string
  team1_id: string
  team2_id: string
  team1_score: number | null
  team2_score: number | null
  stage: MatchStage
  round: number | null
  scheduled_at: string | null
  status: MatchStatus
  created_at: string
}

export interface Standing {
  teamId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface CompletedMatch {
  team1Id: string
  team2Id: string
  team1Score: number
  team2Score: number
  status: MatchStatus
}

export interface RoundFixture {
  team1Id: string
  team2Id: string
  round: number
}
