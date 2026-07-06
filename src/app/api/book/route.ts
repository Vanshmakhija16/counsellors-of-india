import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Direct booking is disabled. Use /api/booking/hold so paid sessions go through payment verification.' },
    { status: 410 },
  )
}
