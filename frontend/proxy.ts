import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login", "/auth/callback"]

async function isValidSession(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".")
  if (lastDot === -1) return false

  const payloadB64 = token.slice(0, lastDot)
  const signature = token.slice(lastDot + 1)

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(process.env.SESSION_SECRET || ""),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    const sigBytes = new Uint8Array(
      (signature.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16))
    )

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      encoder.encode(payloadB64)
    )
    if (!valid) return false

    // base64url → base64 for atob
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))
    return new Date(payload.expires_at) > new Date()
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get("session")?.value
  if (!sessionCookie || !(await isValidSession(sessionCookie))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
