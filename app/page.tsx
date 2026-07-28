// app/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getMatches } from '@/lib/db/matches'
import { computeStandings } from '@/lib/utils/standings'
import StandingsTable from '@/components/StandingsTable'
import Link from 'next/link'
import type { CompletedMatch } from '@/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()])
  const groupMatches = matches.filter(m => m.stage === 'group')
  const completedMatches: CompletedMatch[] = groupMatches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id, team2Id: m.team2_id,
      team1Score: m.team1_score!, team2Score: m.team2_score!,
      status: 'completed',
    }))
  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  const upcoming = matches.find(m => m.status === 'scheduled')
  const teamMap = new Map(teams.map(t => [t.id, t]))

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-2">⚽ League 2026</h1>
      <p className="text-gray-400 mb-8">9th August 2026 · IPL Format</p>

      {upcoming && (
        <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 mb-8">
          <p className="text-xs text-green-400 uppercase font-semibold mb-2">Next Match</p>
          <p className="text-lg font-semibold">
            {teamMap.get(upcoming.team1_id)?.name} vs {teamMap.get(upcoming.team2_id)?.name}
          </p>
        </div>
      )}

      {standings.length > 0 && (
        <section>
          <div className="flex justify-between items-baseline mb-3">
            <h2 className="text-xl font-bold">Standings</h2>
            <Link href="/standings" className="text-sm text-green-400 hover:underline">View full →</Link>
          </div>
          <StandingsTable standings={standings} teams={teams} />
        </section>
      )}

      {teams.length === 0 && (
        <p className="text-gray-500">League setup in progress. Check back soon!</p>
      )}
    </main>
  )
}
