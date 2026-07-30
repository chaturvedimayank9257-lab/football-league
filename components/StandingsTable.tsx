// components/StandingsTable.tsx
import type { Standing, Team } from '@/types'

export default function StandingsTable({
  standings,
  teams,
}: {
  standings: Standing[]
  teams: Team[]
}) {
  const teamMap = new Map(teams.map(t => [t.id, t]))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gold/50 border-b border-gold/20 text-xs uppercase tracking-wider">
            <th className="pb-3 pr-3">#</th>
            <th className="pb-3 pr-6">Team</th>
            <th className="pb-3 pr-4 text-center">P</th>
            <th className="pb-3 pr-4 text-center">W</th>
            <th className="pb-3 pr-4 text-center">D</th>
            <th className="pb-3 pr-4 text-center">L</th>
            <th className="pb-3 pr-4 text-center">GF</th>
            <th className="pb-3 pr-4 text-center">GA</th>
            <th className="pb-3 pr-4 text-center">GD</th>
            <th className="pb-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const team = teamMap.get(s.teamId)
            const isTop = i < 2
            return (
              <tr
                key={s.teamId}
                className={`border-b border-navy-mid/50 transition hover:bg-navy-light ${
                  isTop ? 'standings-top' : ''
                }`}
              >
                <td className={`py-3 pr-3 font-bold ${isTop ? 'text-gold' : 'text-cream/40'}`}>
                  {i + 1}
                </td>
                <td className="py-3 pr-6 flex items-center gap-2">
                  {team && (
                    <span
                      className="w-3 h-3 rounded-full inline-block ring-1 ring-white/20"
                      style={{ backgroundColor: team.color }}
                    />
                  )}
                  <span className={isTop ? 'font-semibold text-cream' : ''}>
                    {team?.name ?? s.teamId}
                  </span>
                </td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.played}</td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.won}</td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.drawn}</td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.lost}</td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.goalsFor}</td>
                <td className="py-3 pr-4 text-center text-cream/60">{s.goalsAgainst}</td>
                <td className="py-3 pr-4 text-center text-cream/50">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="py-3 text-center font-bold text-gold">{s.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
