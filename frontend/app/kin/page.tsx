import { cookies } from "next/headers"
import Link from "next/link"
import { KinList } from "./kin-list"
import { fetchKin } from "../fetch-kin"

export default async function KinPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  const kin = session ? await fetchKin(session) : []

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <Link
          href="/"
          className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-8 block"
        >
          ← Kintime
        </Link>
        <h1 className="text-3xl font-bold mb-2">Your kin</h1>
        <KinList kin={kin} />
      </div>
    </main>
  )
}
