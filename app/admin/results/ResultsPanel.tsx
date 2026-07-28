'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Team } from '@/types'

export default function ResultsPanel({
  matches,
  teamMap,
}: {
  matches: Match[]
  teamMap: Map<string, Team>
}) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, [string, string]>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  async function saveResult(matchId: string) {
    const [s1, s2] = scores[matchId] ?? ['', '']
    if (s1 === '' || s2 === '') return
    setSaving(matchId)
    await fetch('/api/admin/results', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: matchId, team1Score: parseInt(s1), team2Score: parseInt(s2) }),
    })
    setSaving(null)
    router.refresh()
  }

  async function generateKnockouts() {
    setGenerating(true)
    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_knockouts' }),
    })
    setGenerating(false)
    if (res.ok) router.refresh()
    else alert('Failed to generate knockouts — ensure all group matches are complete')
  }

  async function generateFixtures() {
    setGenerating(true)
    await fetch('/api/admin/fixtures', { method: 'POST' })
    setGenerating(false)
    router.refresh()
  }

  const groupMatches = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage !== 'group')
  const allGroupDone = groupMatches.length > 0 && groupMatches.every(m => m.status === 'completed')

  function MatchRow({ m }: { m: Match }) {
    const t1 = teamMap.get(m.team1_id)
    const t2 = teamMap.get(m.team2_id)
    if (!t1 || !t2) return null
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-800">
        <span className="w-32 text-right font-medium">{t1.name}</span>
        {m.status === 'completed' ? (
          <span className="text-gray-400 font-mono w-16 text-center">
            {m.team1_score} – {m.team2_score}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number" min={0}
              value={scores[m.id]?.[0] ?? ''}
              onChange={e => setScores(prev => ({ ...prev, [m.id]: [e.target.value, prev[m.id]?.[1] ?? ''] }))}
              className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
            />
            <span className="text-gray-500">–</span>
            <input
              type="number" min={0}
              value={scores[m.id]?.[1] ?? ''}
              onChange={e => setScores(prev => ({ ...prev, [m.id]: [prev[m.id]?.[0] ?? '', e.target.value] }))}
              className="w-14 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
            />
            <button
              onClick={() => saveResult(m.id)}
              disabled={saving === m.id}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded text-sm"
            >
              Save
            </button>
          </div>
        )}
        <span className="font-medium">{t2.name}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groupMatches.length === 0 ? (
        <button
          onClick={generateFixtures}
          disabled={generating}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          {generating ? 'Generating…' : 'Generate Group Fixtures'}
        </button>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">Group Stage</h2>
            {groupMatches.map(m => <MatchRow key={m.id} m={m} />)}
          </div>

          {allGroupDone && knockoutMatches.length === 0 && (
            <button
              onClick={generateKnockouts}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded"
            >
              {generating ? 'Generating…' : 'Generate Knockout Matches'}
            </button>
          )}

          {knockoutMatches.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Knockouts</h2>
              {knockoutMatches.map(m => <MatchRow key={m.id} m={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
