import { cookies } from "next/headers"
import { KinSection } from "./kin/kin-section"

function getEmailFromSession(token: string): string | null {
  try {
    const payloadB64 = token.split(".")[0]
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    return payload.email ?? null
  } catch {
    return null
  }
}

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const email = session ? getEmailFromSession(session) : null

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-8">
          Kintime
        </p>
        <h1 className="text-3xl font-bold">Hey!</h1>
        {email && <p className="mt-1 text-[var(--color-muted)]">{email}</p>}
        <KinSection />
      </div>
    </main>
  )
}
