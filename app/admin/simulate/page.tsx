import { getConfirmedPlayers } from '@/lib/db/players'
import { getTeams } from '@/lib/db/teams'
import SimulationPanel from './SimulationPanel'

export const dynamic = 'force-dynamic'

export default async function SimulatePage() {
  const [players, teams] = await Promise.all([getConfirmedPlayers(), getTeams()])
  return (
    <div>
      <h1 className="text-2xl font-bold text-gold mb-2">Draft Simulation</h1>
      <p className="text-cream/40 text-sm mb-6">
        Compare snake draft vs auction draft outcomes. No data is saved &mdash; pure simulation.
      </p>
      <SimulationPanel players={players} teams={teams} />
    </div>
  )
}
