import { NextResponse } from "next/server"

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/health`, {
      signal: controller.signal,
    })
    if (!res.ok) return NextResponse.json({ status: "error" }, { status: 503 })
    return NextResponse.json({ status: "ok" })
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
