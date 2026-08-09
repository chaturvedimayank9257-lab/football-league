// lib/db/draft.ts
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { DraftSession } from '@/types'

export async function getDraftSession(): Promise<DraftSession | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('draft_session')
    .select('*')
    .single()
  if (error?.code === 'PGRST116') return null // no rows
  if (error) throw error
  return data
}

export async function upsertDraftSession(updates: Partial<DraftSession>): Promise<DraftSession> {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from('draft_session')
    .select('*')
    .single()

  if (existing) {
    const { data: updated, error } = await supabase
      .from('draft_session')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return updated as DraftSession
  }
  const { data: created, error } = await supabase
    .from('draft_session')
    .insert(updates)
    .select()
    .single()
  if (error) throw error
  return created as DraftSession
}

