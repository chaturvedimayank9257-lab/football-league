import { getDraftSession } from '@/lib/db/draft'
import { getAvailablePlayers } from '@/lib/db/players'
import { getTeams } from '@/lib/db/teams'
import { createServerClient } from '@/lib/supabase/server'
import DraftRoom from './DraftRoom'

export const dynamic = 'force-dynamic'

export default async function DraftPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [session, players, teams] = await Promise.all([
    getDraftSession(),
    getAvailablePlayers(),
    getTeams(),
  ])

  const myTeamId = user?.user_metadata?.team_id ?? null
  const isAdmin = user?.user_metadata?.role === 'admin'

  return (
    <DraftRoom
      initialSession={session}
      initialPlayers={players}
      initialTeams={teams}
      myTeamId={myTeamId}
      isAdmin={isAdmin}
    />
  )
}
