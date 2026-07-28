// app/api/admin/captain/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { email, password, teamId } = await request.json()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'captain', team_id: teamId },
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user })
}
