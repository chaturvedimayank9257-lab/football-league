import { computeStandings } from '@/lib/utils/standings'
import type { CompletedMatch } from '@/types'

const teams = ['T1', 'T2', 'T3', 'T4']

describe('computeStandings', () => {
  it('starts all teams at zero with no matches', () => {
    const standings = computeStandings(teams, [])
    expect(standings).toHaveLength(4)
    standings.forEach(s => {
      expect(s.points).toBe(0)
      expect(s.played).toBe(0)
    })
  })

  it('awards 3 points to winner and 0 to loser', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 2, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    const t2 = standings.find(s => s.teamId === 'T2')!
    expect(t1.points).toBe(3)
    expect(t1.won).toBe(1)
    expect(t2.points).toBe(0)
    expect(t2.lost).toBe(1)
  })

  it('awards 1 point each for a draw', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 1, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    const t2 = standings.find(s => s.teamId === 'T2')!
    expect(t1.points).toBe(1)
    expect(t1.drawn).toBe(1)
    expect(t2.points).toBe(1)
  })

  it('sorts by points descending, then goal difference', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 3, team2Score: 0, status: 'completed' },
      { team1Id: 'T3', team2Id: 'T4', team1Score: 1, team2Score: 0, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    expect(standings[0].teamId).toBe('T1') // 3pts, GD+3
    expect(standings[1].teamId).toBe('T3') // 3pts, GD+1
  })

  it('correctly computes goal difference', () => {
    const matches: CompletedMatch[] = [
      { team1Id: 'T1', team2Id: 'T2', team1Score: 4, team2Score: 1, status: 'completed' },
    ]
    const standings = computeStandings(teams, matches)
    const t1 = standings.find(s => s.teamId === 'T1')!
    expect(t1.goalsFor).toBe(4)
    expect(t1.goalsAgainst).toBe(1)
    expect(t1.goalDifference).toBe(3)
  })
})
