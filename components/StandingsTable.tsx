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
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-6">Team</th>
            <th className="pb-2 pr-4 text-center">P</th>
            <th className="pb-2 pr-4 text-center">W</th>
            <th className="pb-2 pr-4 text-center">D</th>
            <th className="pb-2 pr-4 text-center">L</th>
            <th className="pb-2 pr-4 text-center">GF</th>
            <th className="pb-2 pr-4 text-center">GA</th>
            <th className="pb-2 pr-4 text-center">GD</th>
            <th className="pb-2 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const team = teamMap.get(s.teamId)
            return (
              <tr key={s.teamId} className="border-b border-gray-900">
                <td className="py-2 pr-3 text-gray-500">{i + 1}</td>
                <td className="py-2 pr-6 flex items-center gap-2">
                  {team && (
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: team.color }} />
                  )}
                  {team?.name ?? s.teamId}
                </td>
                <td className="py-2 pr-4 text-center">{s.played}</td>
                <td className="py-2 pr-4 text-center">{s.won}</td>
                <td className="py-2 pr-4 text-center">{s.drawn}</td>
                <td className="py-2 pr-4 text-center">{s.lost}</td>
                <td className="py-2 pr-4 text-center">{s.goalsFor}</td>
                <td className="py-2 pr-4 text-center">{s.goalsAgainst}</td>
                <td className="py-2 pr-4 text-center text-gray-400">{s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}</td>
                <td className="py-2 text-center font-bold text-white">{s.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
