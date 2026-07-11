import { cookies } from "next/headers"
import Link from "next/link"
import { BalanceSection } from "./balance/balance-section"
import { QuickLogSection } from "./moments/log-moment-form"
import { UserChip } from "./user-chip"
import { WakeUpPoller } from "./wake-up-poller"

type KinBalance = { kin_id: string; name: string; deficit_minutes: number }
type Kin = { id: string; name: string }

function getEmailFromSession(token: string): string | null {
  try {
    const payloadB64 = token.split(".")[0]
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString())
    return payload.email ?? null
  } catch {
    return null
  }
}

async function fetchHomeData(
  session: string
): Promise<{ balance: KinBalance[]; kin: Kin[] } | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000)
  try {
    const [balanceRes, kinRes] = await Promise.all([
      fetch(`${process.env.BACKEND_URL}/users/me/balance`, {
        headers: { Authorization: `Bearer ${session}` },
        signal: controller.signal,
      }),
      fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
        headers: { Authorization: `Bearer ${session}` },
        signal: controller.signal,
      }),
    ])
    if (!balanceRes.ok || !kinRes.ok) return null
    const [balance, kin] = await Promise.all([balanceRes.json(), kinRes.json()])
    return { balance, kin }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-10 mt-10">
      <div>
        <div className="h-3 w-16 bg-stone-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-6 bg-stone-100 rounded" />
          <div className="h-6 bg-stone-100 rounded" />
        </div>
      </div>
      <div>
        <div className="h-3 w-16 bg-stone-200 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-stone-100 rounded" />
          <div className="h-8 bg-stone-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const email = session ? getEmailFromSession(session) : null
  const data = session ? await fetchHomeData(session) : null

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg font-bold tracking-widest uppercase">Kintime</p>
          {email && <UserChip username={email.split("@")[0]} />}
        </div>
        {data ? (
          <>
            <BalanceSection balance={data.balance} />
            <QuickLogSection kin={data.kin} />
            <div className="mt-10">
              <Link
                href="/kin"
                className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
              >
                Manage kin →
              </Link>
            </div>
          </>
        ) : (
          <>
            <Skeleton />
            {session && <WakeUpPoller />}
          </>
        )}
      </div>
    </main>
  )
}
