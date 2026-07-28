// app/teams/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getPlayers } from '@/lib/db/players'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getPlayers()])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>
      <div className="grid sm:grid-cols-2 gap-6">
        {teams.map(team => {
          const roster = players.filter(p => p.team_id === team.id)
          const captain = players.find(p => p.id === team.captain_id)
          return (
            <div key={team.id} className="bg-gray-900 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: team.color }} />
                <h2 className="text-xl font-bold">{team.name}</h2>
              </div>
              <ul className="space-y-2">
                {roster.map(p => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span className={p.id === team.captain_id ? 'font-semibold text-yellow-400' : ''}>
                      {p.name}{p.id === team.captain_id ? ' ©' : ''}
                    </span>
                    {p.sold_price != null && (
                      <span className="text-gray-400">₹{p.sold_price}</span>
                    )}
                  </li>
                ))}
                {roster.length === 0 && (
                  <li className="text-gray-500 text-sm">Draft not started</li>
                )}
              </ul>
              <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
                Budget remaining: ₹{team.budget_remaining}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
