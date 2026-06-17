"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { logMoment } from "./actions"
import { QuickLogButton } from "./quick-log-button"

type Kin = { id: string; name: string }
type State = { status: "idle" } | { status: "success" } | { status: "error" }

const PRESETS = [
  { minutes: 15, label: "+15m" },
  { minutes: 30, label: "+30m" },
  { minutes: 60, label: "+1h" },
]

export function QuickLogSection({ kin }: { kin: Kin[] }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: "idle" })
  const [isPending, startTransition] = useTransition()

  if (kin.length === 0) {
    return (
      <div className="mt-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
          Log time
        </p>
        <p className="text-sm text-[var(--color-muted)]">Add some kin before logging time.</p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const kinId = formData.get("kin_id") as string
    const durationMinutes = Number(formData.get("duration_minutes"))

    startTransition(async () => {
      try {
        await logMoment(kinId, durationMinutes)
        form.reset()
        setState({ status: "success" })
        router.refresh()
      } catch {
        setState({ status: "error" })
      }
    })
  }

  return (
    <div className="mt-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
        Log time
      </p>

      <ul className="space-y-3 mb-6">
        {kin.map((k) => (
          <li key={k.id} className="flex items-center gap-2">
            <span className="flex-1 text-base font-medium text-[var(--color-fg)]">{k.name}</span>
            {PRESETS.map((p) => (
              <QuickLogButton key={p.minutes} kinId={k.id} minutes={p.minutes} label={p.label} />
            ))}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <select
          name="kin_id"
          required
          disabled={isPending}
          className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm disabled:opacity-50"
        >
          {kin.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="duration_minutes"
          placeholder="min"
          min="1"
          required
          disabled={isPending}
          className="w-16 px-3 py-2 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Log
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-2 text-sm text-red-500">Something went wrong. Please refresh.</p>
      )}
      {state.status === "success" && (
        <p className="mt-2 text-sm text-[var(--color-accent)] font-medium">Logged!</p>
      )}
    </div>
  )
}
