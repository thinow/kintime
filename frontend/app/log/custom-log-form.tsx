"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { logMoment } from "../moments/actions"

type Kin = { id: string; name: string }
type State = { status: "idle" } | { status: "success" } | { status: "error" }

export function CustomLogForm({ kin }: { kin: Kin[] }) {
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
      {state.status === "error" && (
        <p className="mt-2 text-sm text-red-500">Something went wrong. Please refresh.</p>
      )}
      {state.status === "success" && (
        <p className="mt-2 text-sm text-[var(--color-accent)] font-medium">Logged!</p>
      )}
    </form>
  )
}
