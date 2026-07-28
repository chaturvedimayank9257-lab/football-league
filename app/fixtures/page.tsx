// app/fixtures/page.tsx
import { getMatches } from '@/lib/db/matches'
import { getTeams } from '@/lib/db/teams'

export const dynamic = 'force-dynamic'

export default async function FixturesPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()])
  const teamMap = new Map(teams.map(t => [t.id, t]))

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockouts = matches.filter(m => m.stage !== 'group')

  function MatchCard({ m }: { m: typeof matches[0] }) {
    const t1 = teamMap.get(m.team1_id)
    const t2 = teamMap.get(m.team2_id)
    return (
      <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          {t1 && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t1.color }} />}
          <span className="font-medium">{t1?.name}</span>
        </div>
        <span className="text-gray-400 font-mono text-lg px-4">
          {m.status === 'completed' ? `${m.team1_score} – ${m.team2_score}` : 'vs'}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{t2?.name}</span>
          {t2 && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t2.color }} />}
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fixtures</h1>

      {groupMatches.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-400 mb-3">Group Stage</h2>
          <div className="space-y-2">
            {groupMatches.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {knockouts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-400 mb-3">Knockouts</h2>
          <div className="space-y-2">
            {knockouts.map(m => (
              <div key={m.id}>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  {m.stage === 'semi' ? `Semi-final ${m.round}` : m.stage === 'final' ? 'Final' : '3rd Place'}
                </p>
                <MatchCard m={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-gray-400">Fixtures will appear here once the draft is complete.</p>
      )}
    </main>
  )
}
