// app/page.tsx
import { getTeams } from '@/lib/db/teams'
import { getMatches } from '@/lib/db/matches'
import { computeStandings } from '@/lib/utils/standings'
import StandingsTable from '@/components/StandingsTable'
import Link from 'next/link'
import Image from 'next/image'
import type { CompletedMatch } from '@/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [teams, matches] = await Promise.all([getTeams(), getMatches()])
  const groupMatches = matches.filter(m => m.stage === 'group')
  const completedMatches: CompletedMatch[] = groupMatches
    .filter(m => m.status === 'completed')
    .map(m => ({
      team1Id: m.team1_id, team2Id: m.team2_id,
      team1Score: m.team1_score!, team2Score: m.team2_score!,
      status: 'completed',
    }))
  const standings = computeStandings(teams.map(t => t.id), completedMatches)

  const upcoming = matches.find(m => m.status === 'scheduled')
  const teamMap = new Map(teams.map(t => [t.id, t]))

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero.png"
            alt="The pitch"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/70 to-navy" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 py-20 sm:py-28 text-center">
          <Image src="/logo.png" alt="BPL Crest" width={100} height={100} className="mx-auto mb-6 rounded" />
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gold tracking-tight mb-3">
            Barely Premier League
          </h1>
          <p className="text-cream/60 text-lg sm:text-xl mb-1">Where ambition exceeds ability</p>
          <p className="text-cream/40 text-sm tracking-widest uppercase">9th August 2026 · IPL Format</p>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href="/standings"
              className="bg-gold hover:bg-gold-light text-navy font-bold px-6 py-3 rounded-lg transition text-sm uppercase tracking-wider"
            >
              Standings
            </Link>
            <Link
              href="/draft"
              className="border-2 border-gold/50 hover:border-gold text-gold font-bold px-6 py-3 rounded-lg transition text-sm uppercase tracking-wider"
            >
              Draft Room
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Next Match */}
        {upcoming && (
          <div className="bg-navy-light border border-gold/20 rounded-xl p-6 mb-10">
            <p className="text-[10px] text-gold uppercase font-bold tracking-[0.2em] mb-3">Next Match</p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: teamMap.get(upcoming.team1_id)?.color }} />
                <span className="font-bold text-lg">{teamMap.get(upcoming.team1_id)?.name}</span>
              </div>
              <span className="text-gold/40 font-bold text-2xl">vs</span>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: teamMap.get(upcoming.team2_id)?.color }} />
                <span className="font-bold text-lg">{teamMap.get(upcoming.team2_id)?.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Standings */}
        {standings.length > 0 && (
          <section>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-xl font-bold text-gold">Standings</h2>
              <Link href="/standings" className="text-sm text-gold/60 hover:text-gold transition">
                View full &rarr;
              </Link>
            </div>
            <div className="gold-divider mb-4" />
            <StandingsTable standings={standings} teams={teams} />
          </section>
        )}

        {teams.length === 0 && (
          <p className="text-cream/40 text-center py-8">League setup in progress. Check back soon!</p>
        )}
      </div>
    </main>
  )
}
