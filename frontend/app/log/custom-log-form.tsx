"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { logMoment } from "../moments/actions"

type Kin = { id: string; name: string }
type State = { status: "idle" } | { status: "success" } | { status: "error" }

const DURATIONS = [
  { minutes: 15,  label: "15m" },
  { minutes: 30,  label: "30m" },
  { minutes: 45,  label: "45m" },
  { minutes: 60,  label: "1h" },
  { minutes: 90,  label: "1h30" },
  { minutes: 120, label: "2h" },
]

export function CustomLogForm({ kin }: { kin: Kin[] }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: "idle" })
  const [selectedKinId, setSelectedKinId] = useState(kin[0]?.id ?? "")
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedMinutes) return

    startTransition(async () => {
      try {
        await logMoment(selectedKinId, selectedMinutes)
        setSelectedMinutes(null)
        setState({ status: "success" })
        router.refresh()
      } catch {
        setState({ status: "error" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-3">
          Who
        </p>
        <div className="flex flex-wrap gap-2">
          {kin.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setSelectedKinId(k.id)}
              disabled={isPending}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                selectedKinId === k.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-stone-200 text-[var(--color-fg)] hover:border-stone-300"
              }`}
            >
              {k.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-3">
          How long
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.minutes}
              type="button"
              onClick={() => setSelectedMinutes(d.minutes)}
              disabled={isPending}
              className={`py-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                selectedMinutes === d.minutes
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-stone-200 text-[var(--color-fg)] hover:border-stone-300"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !selectedMinutes}
        className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? "Logging…" : "Log"}
      </button>

      {state.status === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-[var(--color-accent)] font-medium">Logged!</p>
      )}
    </form>
  )
}
