// lib/db/players.ts
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Player } from '@/types'

export async function getPlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getConfirmedPlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'confirmed')
    .order('base_price', { ascending: false })
  if (error) throw error
  return data
}

export async function getAvailablePlayers(): Promise<Player[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('status', 'confirmed')
    .is('team_id', null)
    .order('base_price', { ascending: false })
  if (error) throw error
  return data
}

export async function createPlayer(name: string, basePrice: number): Promise<Player> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('players')
    .insert({ name, base_price: basePrice, status: 'confirmed' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlayer(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

export async function updatePlayer(id: string, data: Partial<Player>): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('players').update(data).eq('id', id)
  if (error) throw error
}

export async function draftPlayer(playerId: string, teamId: string, soldPrice: number): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('players')
    .update({ team_id: teamId, sold_price: soldPrice })
    .eq('id', playerId)
  if (error) throw error
}
