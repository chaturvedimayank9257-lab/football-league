// lib/db/teams.ts
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Team } from '@/types'

export async function getTeams(): Promise<Team[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createTeam(data: Omit<Team, 'id' | 'created_at'>): Promise<Team> {
  const supabase = createAdminClient()
  const { data: team, error } = await supabase
    .from('teams')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return team
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('teams').update(data).eq('id', id)
  if (error) throw error
}

// Atomic budget deduction — uses raw SQL to prevent race conditions
export async function deductBudget(teamId: string, amount: number): Promise<void> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('deduct_budget', {
    p_team_id: teamId,
    p_amount: amount,
  })
  // Fallback if RPC doesn't exist yet: read-then-write
  if (error?.code === '42883') {
    // Function not found — use non-atomic fallback
    const { data: team, error: fetchError } = await supabase
      .from('teams')
      .select('budget_remaining')
      .eq('id', teamId)
      .single()
    if (fetchError) throw fetchError
    if (team.budget_remaining < amount) throw new Error('Insufficient budget')
    const { error: updateError } = await supabase
      .from('teams')
      .update({ budget_remaining: team.budget_remaining - amount })
      .eq('id', teamId)
    if (updateError) throw updateError
    return
  }
  if (error) throw error
}
