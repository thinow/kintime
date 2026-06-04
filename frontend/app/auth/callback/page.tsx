import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function AuthCallbackPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    redirect("/login")
  }

  // no-store: never cache — returning a cached session token to the wrong user would be a security bug
  const res = await fetch(
    `${process.env.BACKEND_URL}/auth/verify?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    redirect("/login")
  }

  const { session } = await res.json()

  const cookieStore = await cookies()
  cookieStore.set("session", session, {
    httpOnly: true,
    // lax: sent on top-level navigations (e.g. clicking the magic link), but not on
    // embedded cross-site requests — right balance for an auth cookie
    sameSite: "lax",
    // only send over HTTPS; disabled in local dev where the app runs on http://localhost
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: "/",
  })

  redirect("/")
}
