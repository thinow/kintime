import { KinList } from "./kin-list"

type Kin = { id: string; name: string }

async function fetchKin(session: string, attempt = 0): Promise<Kin[]> {
  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
    headers: { Authorization: `Bearer ${session}` },
    cache: "no-store",
  })
  if (res.status === 503 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 600))
    return fetchKin(session, attempt + 1)
  }
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export async function KinSection({ session }: { session: string }) {
  try {
    const kin = await fetchKin(session)
    return <KinList kin={kin} />
  } catch {
    return (
      <div className="mt-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
          Your kin
        </p>
        <p className="text-sm text-red-500">Couldn't load your kin. Please refresh.</p>
      </div>
    )
  }
}
