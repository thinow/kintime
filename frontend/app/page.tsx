import { cookies } from "next/headers"
import { KinList } from "./kin/kin-list"

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

async function fetchKin(session: string): Promise<Kin[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
    headers: { Authorization: `Bearer ${session}` },
    cache: "no-store",
  })
  if (!res.ok) return []
  return res.json()
}

export default async function Page() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const email = session ? getEmailFromSession(session) : null
  const kin = session ? await fetchKin(session) : []

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-8">
          Kintime
        </p>
        <h1 className="text-3xl font-bold">Hey!</h1>
        {email && <p className="mt-1 text-[var(--color-muted)]">{email}</p>}
        <KinList kin={kin} />
      </div>
    </main>
  )
}
