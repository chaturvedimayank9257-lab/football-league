import { generateRoundRobin } from '@/lib/utils/round-robin'

describe('generateRoundRobin', () => {
  const teams = ['T1', 'T2', 'T3', 'T4']

  it('generates correct number of matches for 4 teams', () => {
    // C(4,2) = 6 matches
    const fixtures = generateRoundRobin(teams)
    expect(fixtures).toHaveLength(6)
  })

  it('each pair plays exactly once', () => {
    const fixtures = generateRoundRobin(teams)
    const pairs = fixtures.map(f => [f.team1Id, f.team2Id].sort().join('|')).sort()
    const expected = [
      'T1|T2', 'T1|T3', 'T1|T4', 'T2|T3', 'T2|T4', 'T3|T4'
    ]
    expect(pairs).toEqual(expected)
  })

  it('no team plays itself', () => {
    const fixtures = generateRoundRobin(teams)
    fixtures.forEach(f => expect(f.team1Id).not.toBe(f.team2Id))
  })

  it('assigns round numbers starting from 1', () => {
    const fixtures = generateRoundRobin(teams)
    const rounds = [...new Set(fixtures.map(f => f.round))].sort()
    expect(rounds[0]).toBe(1)
  })

  it('works for 5 teams (10 matches)', () => {
    const fiveTeams = ['T1', 'T2', 'T3', 'T4', 'T5']
    const fixtures = generateRoundRobin(fiveTeams)
    expect(fixtures).toHaveLength(10)
  })
})
