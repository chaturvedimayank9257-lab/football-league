import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Snake draft pick endpoint is no longer active. This league uses in-person auction.' },
    { status: 410 }
  )
}
