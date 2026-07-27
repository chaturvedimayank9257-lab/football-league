import type { RoundFixture } from '@/types'

export function generateRoundRobin(teamIds: string[]): RoundFixture[] {
  const teams = [...teamIds]
  // Add dummy team for odd counts (shouldn't happen but guard anyway)
  if (teams.length % 2 !== 0) teams.push('__bye__')

  const rounds = teams.length - 1
  const matchesPerRound = teams.length / 2
  const fixtures: RoundFixture[] = []

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const team1 = teams[match]
      const team2 = teams[teams.length - 1 - match]
      if (team1 !== '__bye__' && team2 !== '__bye__') {
        fixtures.push({ team1Id: team1, team2Id: team2, round: round + 1 })
      }
    }
    // Rotate all teams except the first (standard round-robin rotation)
    const last = teams.pop()!
    teams.splice(1, 0, last)
  }

  return fixtures
}
