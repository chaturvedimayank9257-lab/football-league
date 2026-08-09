import { getDraftSession } from '@/lib/db/draft'
import { getTeams } from '@/lib/db/teams'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Player } from '@/types'
import DraftRoom from './DraftRoom'

export const dynamic = 'force-dynamic'

export default async function DraftPage() {
  const [session, teams] = await Promise.all([getDraftSession(), getTeams()])

  const admin = createAdminClient()

  // Recently sold players (up to 10, most recent first)
  const { data: soldData } = await admin
    .from('players')
    .select('*')
    .not('team_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(10)
  const recentlySold = (soldData ?? []) as Player[]

  // Player currently up for auction
  let currentPlayer: Player | null = null
  if (session?.current_player_id) {
    const { data } = await admin
      .from('players')
      .select('*')
      .eq('id', session.current_player_id)
      .single()
    currentPlayer = (data ?? null) as Player | null
  }

  return (
    <DraftRoom
      initialSession={session}
      initialRecentlySold={recentlySold}
      initialTeams={teams}
      initialCurrentPlayer={currentPlayer}
    />
  )
}
