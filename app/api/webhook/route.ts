import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Best-effort parse; ignore body content for now.
    await request.json().catch(() => ({}))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
