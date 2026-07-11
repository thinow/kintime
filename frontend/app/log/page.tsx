import { cookies } from "next/headers"
import Link from "next/link"
import { CustomLogForm } from "./custom-log-form"
import { fetchKin } from "../fetch-kin"

export default async function LogPage() {
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
        <h1 className="text-3xl font-bold mb-8">Log time</h1>
        {kin.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">Add some kin before logging time.</p>
        ) : (
          <CustomLogForm kin={kin} />
        )}
      </div>
    </main>
  )
}
