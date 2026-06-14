import { cookies } from "next/headers"
import { BalanceSection } from "./balance/balance-section"
import { KinSection } from "./kin/kin-section"
import { LogMomentForm } from "./moments/log-moment-form"

type KinBalance = { kin_id: string; name: string; deficit_minutes: number }

function getEmailFromSession(token: string): string | null {
  try {
    const payloadB64 = token.split(".")[0]
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    return payload.email ?? null
  } catch {
    return null
  }
}

async function fetchBalance(session: string): Promise<KinBalance[]> {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/users/me/balance`, {
      headers: { Authorization: `Bearer ${session}` },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const email = session ? getEmailFromSession(session) : null
  const balance = session ? await fetchBalance(session) : []

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-8">
          Kintime
        </p>
        <h1 className="text-3xl font-bold">Hey!</h1>
        {email && <p className="mt-1 text-[var(--color-muted)]">{email}</p>}
        <BalanceSection balance={balance} />
        <KinSection />
        <LogMomentForm />
      </div>
    </main>
  )
}
