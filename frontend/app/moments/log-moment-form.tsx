"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { logMoment } from "./actions"

type Kin = { id: string; name: string }
type State = { status: "idle" } | { status: "success" } | { status: "error" }

export function LogMomentForm({ kin }: { kin: Kin[] }) {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: "idle" })
  const [isPending, startTransition] = useTransition()

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

      {state.status === "error" && (
        <p className="text-sm text-red-500">Something went wrong. Please refresh.</p>
      )}

      {kin.length === 0 && (
        <p className="text-sm text-[var(--color-muted)]">Add some kin above before logging time.</p>
      )}

      {kin.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            name="kin_id"
            required
            disabled={isPending}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base disabled:opacity-50"
          >
            {kin.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              name="duration_minutes"
              placeholder="Minutes"
              min="1"
              required
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Log
            </button>
          </div>

          {state.status === "success" && (
            <p className="text-sm text-[var(--color-accent)] font-medium">Logged!</p>
          )}
        </form>
      )}
    </div>
  )
}
