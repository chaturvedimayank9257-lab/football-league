import { generateSnakeOrder } from '@/lib/utils/snake-draft'

describe('generateSnakeOrder', () => {
  const teams = ['T1', 'T2', 'T3', 'T4']

  it('produces round 1 in forward order', () => {
    const order = generateSnakeOrder(teams, 4)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4'])
  })

  it('produces round 2 in reverse order (snake)', () => {
    const order = generateSnakeOrder(teams, 8)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4', 'T4', 'T3', 'T2', 'T1'])
  })

  it('produces round 3 in forward order again', () => {
    const order = generateSnakeOrder(teams, 12)
    expect(order.slice(8)).toEqual(['T1', 'T2', 'T3', 'T4'])
  })

  it('handles totalPicks not divisible by team count', () => {
    const order = generateSnakeOrder(teams, 6)
    expect(order).toEqual(['T1', 'T2', 'T3', 'T4', 'T4', 'T3'])
    expect(order).toHaveLength(6)
  })

  it('each team gets equal picks when totalPicks is divisible', () => {
    const order = generateSnakeOrder(teams, 24)
    const counts = teams.map(t => order.filter(x => x === t).length)
    expect(counts).toEqual([6, 6, 6, 6])
  })
})
