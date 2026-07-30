// app/teams/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getPlayers } from '@/lib/db/players'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()])

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gold mb-2">Teams</h1>
      <div className="gold-divider mb-8" />

      <div className="grid sm:grid-cols-2 gap-6">
        {teams.map(team => {
          const roster = players.filter(p => p.team_id === team.id)
          const captain = players.find(p => p.id === team.captain_id)
          return (
            <div
              key={team.id}
              className="bg-navy-light rounded-xl overflow-hidden border border-navy-mid/50"
            >
              {/* Team color stripe */}
              <div className="h-1.5" style={{ backgroundColor: team.color }} />

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-5 h-5 rounded-full ring-2 ring-white/20"
                    style={{ backgroundColor: team.color }}
                  />
                  <h2 className="text-xl font-bold text-cream">{team.name}</h2>
                </div>

                <ul className="space-y-2">
                  {roster.map(p => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className={p.id === team.captain_id
                        ? 'font-semibold text-gold'
                        : 'text-cream/70'
                      }>
                        {p.name}{p.id === team.captain_id ? ' ©' : ''}
                      </span>
                      {p.sold_price != null && (
                        <span className="text-cream/40 font-mono text-xs">{'\u20B9'}{p.sold_price}</span>
                      )}
                    </li>
                  ))}
                  {roster.length === 0 && (
                    <li className="text-cream/30 text-sm">Draft not started</li>
                  )}
                </ul>

                <div className="mt-4 pt-3 border-t border-navy-mid/50 flex justify-between text-xs text-cream/40">
                  <span>Budget remaining</span>
                  <span className="font-mono text-gold/70">{'\u20B9'}{team.budget_remaining}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
