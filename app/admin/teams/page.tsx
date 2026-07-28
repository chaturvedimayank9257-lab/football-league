// app/admin/teams/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getConfirmedPlayers } from '@/lib/db/players'
import TeamSetupPanel from './TeamSetupPanel'

export const dynamic = 'force-dynamic'

export default async function AdminTeamsPage() {
  const [teams, players] = await Promise.all([getTeams(), getConfirmedPlayers()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Teams</h1>
      <TeamSetupPanel teams={teams} players={players} />
    </div>
  )
}
