// app/admin/draft/page.tsx
import { getDraftSession } from '@/lib/db/draft'
import { getTeams } from '@/lib/db/teams'
import DraftControl from './DraftControl'

export const dynamic = 'force-dynamic'

export default async function AdminDraftPage() {
  const [session, teams] = await Promise.all([getDraftSession(), getTeams()])
  return (
    <div>
      <h1 className="text-2xl font-bold text-gold mb-4">Draft Control</h1>
      <DraftControl session={session} teams={teams} />
    </div>
  )
}
