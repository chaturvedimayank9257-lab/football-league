import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import ResultsPanel from './ResultsPanel'

export const dynamic = 'force-dynamic'

export default async function AdminResultsPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()])
  const teamMap = new Map(teams.map(t => [t.id, t]))
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Match Results</h1>
      <ResultsPanel matches={matches} teamMap={teamMap} />
    </div>
  )
}
