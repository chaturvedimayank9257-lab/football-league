export function generateSnakeOrder(teamIds: string[], totalPicks: number): string[] {
  const order: string[] = []
  let round = 0
  while (order.length < totalPicks) {
    const roundOrder = round % 2 === 0 ? [...teamIds] : [...teamIds].reverse()
    for (const id of roundOrder) {
      if (order.length >= totalPicks) break
      order.push(id)
    }
    round++
  }
  return order
}
