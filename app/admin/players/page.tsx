// app/admin/players/page.tsx
import { getPlayers } from '@/lib/db/players'
import PlayerAdminTable from './PlayerAdminTable'

export const dynamic = 'force-dynamic'

export default async function AdminPlayersPage() {
  const players = await getPlayers()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Players ({players.length})</h1>
      <p className="text-gray-400 text-sm mb-6">
        Set base prices and confirm tentative players before the draft.
      </p>
      <PlayerAdminTable players={players} />
    </div>
  )
}
