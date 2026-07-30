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
    const isCompleted = m.status === 'completed'
    return (
      <div className="flex items-center justify-between bg-navy-light border border-navy-mid/50 rounded-lg px-5 py-4 hover:border-gold/20 transition">
        <div className="flex items-center gap-3 flex-1">
          {t1 && <span className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: t1.color }} />}
          <span className="font-semibold text-cream">{t1?.name}</span>
        </div>
        <span className={`font-mono text-lg px-4 ${isCompleted ? 'text-gold font-bold' : 'text-cream/30'}`}>
          {isCompleted ? `${m.team1_score} \u2013 ${m.team2_score}` : 'vs'}
        </span>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className="font-semibold text-cream">{t2?.name}</span>
          {t2 && <span className="w-3 h-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: t2.color }} />}
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold mb-2">Fixtures</h1>
      <div className="gold-divider mb-8" />

      {groupMatches.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold text-gold/50 uppercase tracking-[0.2em] mb-4">Group Stage</h2>
          <div className="space-y-2">
            {groupMatches.map(m => <MatchCard key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {knockouts.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gold/50 uppercase tracking-[0.2em] mb-4">Knockouts</h2>
          <div className="space-y-3">
            {knockouts.map(m => (
              <div key={m.id}>
                <p className="text-[10px] text-gold/40 uppercase tracking-widest mb-1 pl-1">
                  {m.stage === 'semi' ? `Semi-final ${m.round}` : m.stage === 'final' ? 'Final' : '3rd Place'}
                </p>
                <MatchCard m={m} />
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <p className="text-cream/30 text-center py-12">Fixtures will appear here once the draft is complete.</p>
      )}
    </main>
  )
}
