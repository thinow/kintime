import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) {
    return new NextResponse(null, { status: 401 })
  }

  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
    headers: { Authorization: `Bearer ${session}` },
    cache: "no-store",
  })

  if (!res.ok) {
    return new NextResponse(null, { status: res.status })
  }

  return NextResponse.json(await res.json())
}
