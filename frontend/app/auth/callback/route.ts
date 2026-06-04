import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // no-store: never cache — returning a cached session token to the wrong user would be a security bug
  const res = await fetch(
    `${process.env.BACKEND_URL}/auth/verify?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const { session } = await res.json()

  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set("session", session, {
    httpOnly: true,
    // lax: sent on top-level navigations (e.g. clicking the magic link), but not on
    // embedded cross-site requests — right balance for an auth cookie
    sameSite: "lax",
    // only send over HTTPS; disabled in local dev where the app runs on http://localhost
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: "/",
  })

  return response
}
