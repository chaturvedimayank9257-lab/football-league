'use client'
import { useState, useMemo } from 'react'
import type { Player, Team } from '@/types'

type SimPlayer = { id: string; name: string; price: number }
type SimTeam = { id: string; name: string; color: string; budget: number }
type Strategy = 'marquee' | 'balanced' | 'value' | 'random'
type DraftResult = { team: SimTeam; roster: SimPlayer[]; spent: number; remaining: number }

const STRATEGIES: { key: Strategy; label: string; desc: string }[] = [
  { key: 'marquee', label: 'Marquee First', desc: 'Picks most expensive available' },
  { key: 'balanced', label: 'Balanced', desc: 'Alternates expensive and cheap' },
  { key: 'value', label: 'Value Hunter', desc: 'Picks cheapest to maximize roster' },
  { key: 'random', label: 'Random', desc: 'Random picks' },
]

function snakeDraft(players: SimPlayer[], teams: SimTeam[], strategies: Record<string, Strategy>): DraftResult[] {
  const pool = [...players].sort((a, b) => b.price - a.price)
  const rosters: Record<string, SimPlayer[]> = {}
  const budgets: Record<string, number> = {}
  teams.forEach(t => { rosters[t.id] = []; budgets[t.id] = t.budget })

  // Generate snake order
  const order: string[] = []
  let round = 0
  while (order.length < pool.length) {
    const ids = teams.map(t => t.id)
    const roundOrder = round % 2 === 0 ? ids : [...ids].reverse()
    for (const id of roundOrder) {
      if (order.length >= pool.length) break
      order.push(id)
    }
    round++
  }

  const available = [...pool]

  for (const teamId of order) {
    if (available.length === 0) break
    const affordable = available.filter(p => p.price <= budgets[teamId])
    if (affordable.length === 0) continue

    const strategy = strategies[teamId] || 'balanced'
    let pick: SimPlayer

    if (strategy === 'marquee') {
      pick = affordable[0] // most expensive
    } else if (strategy === 'value') {
      pick = affordable[affordable.length - 1] // cheapest
    } else if (strategy === 'random') {
      pick = affordable[Math.floor(Math.random() * affordable.length)]
    } else {
      // balanced: alternate expensive/cheap based on roster size
      pick = rosters[teamId].length % 2 === 0 ? affordable[0] : affordable[affordable.length - 1]
    }

    rosters[teamId].push(pick)
    budgets[teamId] -= pick.price
    available.splice(available.indexOf(pick), 1)
  }

  return teams.map(t => ({
    team: t,
    roster: rosters[t.id],
    spent: t.budget - budgets[t.id],
    remaining: budgets[t.id],
  }))
}

function auctionDraft(players: SimPlayer[], teams: SimTeam[], aggressiveness: Record<string, number>): DraftResult[] {
  const pool = [...players].sort((a, b) => b.price - a.price)
  const rosters: Record<string, SimPlayer[]> = {}
  const budgets: Record<string, number> = {}
  teams.forEach(t => { rosters[t.id] = []; budgets[t.id] = t.budget })

  // Auction: each player is nominated, teams bid based on aggressiveness
  for (const player of pool) {
    // Find teams that can afford the base price
    const bidders = teams.filter(t => budgets[t.id] >= player.price)
    if (bidders.length === 0) continue

    let currentBid = player.price
    let winner = bidders[0]

    // Simulate bidding rounds
    let active = [...bidders]
    for (let round = 0; round < 20 && active.length > 1; round++) {
      const nextBid = currentBid + Math.max(10, Math.round(player.price * 0.1))
      const stillIn = active.filter(t => {
        const aggr = (aggressiveness[t.id] || 3) / 5
        const willingness = player.price * (1 + aggr * 1.5) // max bid = base * (1 + aggr * 1.5)
        return nextBid <= willingness && nextBid <= budgets[t.id]
      })
      if (stillIn.length === 0) break
      currentBid = nextBid
      active = stillIn
      winner = active[Math.floor(Math.random() * active.length)]
    }

    rosters[winner.id].push({ ...player, price: currentBid })
    budgets[winner.id] -= currentBid
  }

  return teams.map(t => ({
    team: t,
    roster: rosters[t.id],
    spent: t.budget - budgets[t.id],
    remaining: budgets[t.id],
  }))
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length)
}

export default function SimulationPanel({ players, teams }: { players: Player[]; teams: Team[] }) {
  const [tab, setTab] = useState<'snake' | 'auction'>('snake')
  const [budget, setBudget] = useState(1000)
  const [numTeams, setNumTeams] = useState(Math.max(teams.length, 4))
  const [prices, setPrices] = useState<Record<string, number>>(
    () => Object.fromEntries(players.map(p => [p.id, p.base_price]))
  )
  const [strategies, setStrategies] = useState<Record<string, Strategy>>({})
  const [aggressiveness, setAggressiveness] = useState<Record<string, number>>({})
  const [snakeResults, setSnakeResults] = useState<DraftResult[] | null>(null)
  const [auctionResults, setAuctionResults] = useState<DraftResult[] | null>(null)

  // Build sim teams
  const simTeams: SimTeam[] = useMemo(() => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7']
    const names = teams.length >= numTeams
      ? teams.slice(0, numTeams).map(t => ({ id: t.id, name: t.name, color: t.color }))
      : Array.from({ length: numTeams }, (_, i) =>
          teams[i]
            ? { id: teams[i].id, name: teams[i].name, color: teams[i].color }
            : { id: `sim-${i}`, name: `Team ${i + 1}`, color: colors[i % colors.length] }
        )
    return names.map(t => ({ ...t, budget }))
  }, [teams, numTeams, budget])

  const simPlayers: SimPlayer[] = useMemo(
    () => players.map(p => ({ id: p.id, name: p.name, price: prices[p.id] ?? p.base_price })),
    [players, prices]
  )

  function runSnake() {
    setSnakeResults(snakeDraft(simPlayers, simTeams, strategies))
  }

  function runAuction() {
    setAuctionResults(auctionDraft(simPlayers, simTeams, aggressiveness))
  }

  function ResultsView({ results, mode }: { results: DraftResult[]; mode: string }) {
    const totalValues = results.map(r => r.roster.reduce((s, p) => s + p.price, 0))
    const balance = stdDev(totalValues)
    const utilization = results.reduce((s, r) => s + r.spent, 0) / (results.length * budget) * 100

    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="bg-navy border border-navy-mid rounded-lg px-4 py-3 flex-1">
            <div className="text-cream/40 text-xs uppercase mb-1">Balance</div>
            <div className="text-gold font-bold">{balance.toFixed(0)} {'\u03C3'}</div>
            <div className="text-cream/30 text-xs">Lower = more equal teams</div>
          </div>
          <div className="bg-navy border border-navy-mid rounded-lg px-4 py-3 flex-1">
            <div className="text-cream/40 text-xs uppercase mb-1">Budget Used</div>
            <div className="text-gold font-bold">{utilization.toFixed(0)}%</div>
          </div>
          <div className="bg-navy border border-navy-mid rounded-lg px-4 py-3 flex-1">
            <div className="text-cream/40 text-xs uppercase mb-1">Avg Roster</div>
            <div className="text-gold font-bold">{(results.reduce((s, r) => s + r.roster.length, 0) / results.length).toFixed(1)}</div>
          </div>
        </div>

        {/* Team rosters */}
        <div className="grid sm:grid-cols-2 gap-4">
          {results.map(r => (
            <div key={r.team.id} className="bg-navy-light border border-navy-mid/50 rounded-lg overflow-hidden">
              <div className="h-1" style={{ backgroundColor: r.team.color }} />
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.team.color }} />
                    <span className="font-bold text-cream text-sm">{r.team.name}</span>
                  </div>
                  <span className="text-xs font-mono text-cream/40">
                    {'\u20B9'}{r.spent} spent &middot; {'\u20B9'}{r.remaining} left
                  </span>
                </div>
                <ul className="space-y-1">
                  {r.roster.map((p, i) => (
                    <li key={p.id} className="flex justify-between text-xs">
                      <span className="text-cream/70">{i + 1}. {p.name}</span>
                      <span className="text-gold/50 font-mono">{'\u20B9'}{p.price}</span>
                    </li>
                  ))}
                  {r.roster.length === 0 && (
                    <li className="text-cream/20 text-xs">No players</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Global config */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">Teams</label>
          <input
            type="number" min={2} max={8} value={numTeams}
            onChange={e => setNumTeams(parseInt(e.target.value) || 4)}
            className="w-20 bg-navy border border-navy-mid text-cream rounded px-3 py-2 focus:ring-1 focus:ring-gold/50 transition"
          />
        </div>
        <div>
          <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">Budget per team ({'\u20B9'})</label>
          <input
            type="number" min={100} step={100} value={budget}
            onChange={e => setBudget(parseInt(e.target.value) || 1000)}
            className="w-28 bg-navy border border-navy-mid text-cream rounded px-3 py-2 focus:ring-1 focus:ring-gold/50 transition"
          />
        </div>
      </div>

      {/* Player prices — editable */}
      <details className="bg-navy-light border border-navy-mid/50 rounded-lg">
        <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gold/60 uppercase tracking-wider">
          Player Prices ({simPlayers.length} players) &mdash; click to edit
        </summary>
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {simPlayers.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="text-xs text-cream/60 truncate flex-1">{p.name}</span>
              <input
                type="number" min={0} step={10}
                value={prices[p.id] ?? p.price}
                onChange={e => setPrices(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                className="w-16 bg-navy border border-navy-mid rounded px-1.5 py-1 text-xs text-cream text-center focus:ring-1 focus:ring-gold/50 transition"
              />
            </div>
          ))}
        </div>
      </details>

      {/* Tabs */}
      <div className="flex border-b border-gold/20">
        <button
          onClick={() => setTab('snake')}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition ${
            tab === 'snake' ? 'text-gold border-gold' : 'text-cream/40 border-transparent hover:text-cream/70'
          }`}
        >
          Snake Draft
        </button>
        <button
          onClick={() => setTab('auction')}
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition ${
            tab === 'auction' ? 'text-gold border-gold' : 'text-cream/40 border-transparent hover:text-cream/70'
          }`}
        >
          Auction Draft
        </button>
        {snakeResults && auctionResults && (
          <button
            onClick={() => setTab(tab)} // just a visual indicator
            className="ml-auto px-3 py-3 text-xs text-gold/40 uppercase tracking-wider"
          >
            Both simulated &mdash; scroll down to compare
          </button>
        )}
      </div>

      {/* Snake Draft Config + Run */}
      {tab === 'snake' && (
        <div className="space-y-4">
          <div className="text-sm text-cream/50 mb-2">
            Set a strategy per team. Snake order alternates direction each round.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {simTeams.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-navy-light border border-navy-mid/50 rounded-lg px-4 py-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-sm font-semibold text-cream flex-1">{t.name}</span>
                <select
                  value={strategies[t.id] || 'balanced'}
                  onChange={e => setStrategies(prev => ({ ...prev, [t.id]: e.target.value as Strategy }))}
                  className="bg-navy border border-navy-mid text-cream rounded px-2 py-1 text-xs focus:ring-1 focus:ring-gold/50 transition"
                >
                  {STRATEGIES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={runSnake}
            className="bg-gold hover:bg-gold-light text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            Run Snake Draft
          </button>
          {snakeResults && <ResultsView results={snakeResults} mode="snake" />}
        </div>
      )}

      {/* Auction Draft Config + Run */}
      {tab === 'auction' && (
        <div className="space-y-4">
          <div className="text-sm text-cream/50 mb-2">
            Set aggressiveness per team (1 = conservative, 5 = will overpay heavily). Players are auctioned from most expensive down.
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {simTeams.map(t => (
              <div key={t.id} className="flex items-center gap-3 bg-navy-light border border-navy-mid/50 rounded-lg px-4 py-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-sm font-semibold text-cream flex-1">{t.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={1} max={5} step={1}
                    value={aggressiveness[t.id] || 3}
                    onChange={e => setAggressiveness(prev => ({ ...prev, [t.id]: parseInt(e.target.value) }))}
                    className="w-20 accent-gold"
                  />
                  <span className="text-xs text-gold/60 font-mono w-4">{aggressiveness[t.id] || 3}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={runAuction}
            className="bg-gold hover:bg-gold-light text-navy font-bold px-5 py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            Run Auction Draft
          </button>
          {auctionResults && <ResultsView results={auctionResults} mode="auction" />}
        </div>
      )}

      {/* Comparison */}
      {snakeResults && auctionResults && (
        <div className="border-t border-gold/20 pt-6 mt-6">
          <h2 className="text-lg font-bold text-gold mb-4">Snake vs Auction Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gold/50 border-b border-gold/20 text-xs uppercase tracking-wider">
                  <th className="pb-3 pr-4">Metric</th>
                  <th className="pb-3 pr-4">Snake Draft</th>
                  <th className="pb-3">Auction Draft</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sValues = snakeResults.map(r => r.roster.reduce((s, p) => s + p.price, 0))
                  const aValues = auctionResults.map(r => r.roster.reduce((s, p) => s + p.price, 0))
                  const sUtil = snakeResults.reduce((s, r) => s + r.spent, 0) / (snakeResults.length * budget) * 100
                  const aUtil = auctionResults.reduce((s, r) => s + r.spent, 0) / (auctionResults.length * budget) * 100
                  const sRoster = snakeResults.reduce((s, r) => s + r.roster.length, 0) / snakeResults.length
                  const aRoster = auctionResults.reduce((s, r) => s + r.roster.length, 0) / auctionResults.length
                  const sBalance = stdDev(sValues)
                  const aBalance = stdDev(aValues)

                  const rows = [
                    ['Team Balance (\u03C3)', sBalance.toFixed(0), aBalance.toFixed(0), sBalance < aBalance],
                    ['Budget Utilization', `${sUtil.toFixed(0)}%`, `${aUtil.toFixed(0)}%`, sUtil > aUtil],
                    ['Avg Roster Size', sRoster.toFixed(1), aRoster.toFixed(1), sRoster > aRoster],
                    ['Price Inflation', 'None (fixed)', `${((aValues.reduce((a, b) => a + b, 0) / sValues.reduce((a, b) => a + b, 0) - 1) * 100).toFixed(0)}% over base`, true],
                  ]

                  return rows.map(([label, snake, auction, snakeWins]) => (
                    <tr key={label as string} className="border-b border-navy-mid/50">
                      <td className="py-3 pr-4 text-cream/60">{label}</td>
                      <td className={`py-3 pr-4 font-mono ${snakeWins ? 'text-gold font-bold' : 'text-cream/50'}`}>{snake}</td>
                      <td className={`py-3 font-mono ${!snakeWins ? 'text-gold font-bold' : 'text-cream/50'}`}>{auction}</td>
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-cream/30 mt-3">
            Gold = better on that metric. Lower balance \u03C3 = more equal teams. Run multiple times for auction (has randomness).
          </p>
        </div>
      )}
    </div>
  )
}
