// app/standings/page.tsx
import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'
import { computeStandings } from '@/lib/utils/standings'
import StandingsTable from '@/components/StandingsTable'
import type { CompletedMatch } from '@/types'

export const dynamic = 'force-dynamic'

export default async function StandingsPage() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches('group')])

  const completedMatches: CompletedMatch[] = matches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id,
      team2Id: m.team2_id,
      team1Score: m.team1_score!,
      team2Score: m.team2_score!,
      status: 'completed',
    }))

  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Standings</h1>
      {teams.length === 0 ? (
        <p className="text-gray-400">Standings will appear once teams are set up.</p>
      ) : (
        <StandingsTable standings={standings} teams={teams} />
      )}
    </main>
  )
}
