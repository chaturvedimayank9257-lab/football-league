import type { Standing, CompletedMatch } from '@/types'

export function computeStandings(teamIds: string[], matches: CompletedMatch[]): Standing[] {
  const map = new Map<string, Standing>()

  for (const teamId of teamIds) {
    map.set(teamId, {
      teamId, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    })
  }

  for (const match of matches) {
    if (match.status !== 'completed') continue
    const s1 = map.get(match.team1Id)!
    const s2 = map.get(match.team2Id)!

    s1.played++; s2.played++
    s1.goalsFor += match.team1Score; s1.goalsAgainst += match.team2Score
    s2.goalsFor += match.team2Score; s2.goalsAgainst += match.team1Score

    if (match.team1Score > match.team2Score) {
      s1.won++; s1.points += 3; s2.lost++
    } else if (match.team2Score > match.team1Score) {
      s2.won++; s2.points += 3; s1.lost++
    } else {
      s1.drawn++; s1.points++; s2.drawn++; s2.points++
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })
}
