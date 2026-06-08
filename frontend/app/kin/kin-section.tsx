"use client"

import { useEffect, useState } from "react"
import { KinList } from "./kin-list"
import { KinSectionSkeleton } from "./kin-section-skeleton"

type Kin = { id: string; name: string }
type State = { status: "loading" } | { status: "ok"; kin: Kin[] } | { status: "error" }

async function fetchKin(attempt = 0): Promise<Kin[]> {
  const res = await fetch("/api/kin")
  if (res.status === 503 && attempt < 2) {
    await new Promise((r) => setTimeout(r, 600))
    return fetchKin(attempt + 1)
  }
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

export function KinSection() {
  const [state, setState] = useState<State>({ status: "loading" })

  useEffect(() => {
    fetchKin()
      .then((kin) => setState({ status: "ok", kin }))
      .catch(() => setState({ status: "error" }))
  }, [])

  if (state.status === "loading") return <KinSectionSkeleton />

  if (state.status === "error") {
    return (
      <div className="mt-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
          Your kin
        </p>
        <p className="text-sm text-red-500">Couldn't load your kin. Please refresh.</p>
      </div>
    )
  }

  return <KinList kin={state.kin} />
}
