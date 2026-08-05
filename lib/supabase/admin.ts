import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Service-role client that bypasses RLS. Use for all server-side writes.
// Never expose this to the browser.
// ponytail: typed as SupabaseClient<any> because no generated DB types exist
let adminClient: SupabaseClient | null = null

export function createAdminClient(): SupabaseClient {
  if (!adminClient) {
    // eslint-disable-next-line
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return adminClient
}
