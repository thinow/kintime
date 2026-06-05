"use client"

import { useActionState } from "react"
import { requestToken } from "./actions"

const initialState = { status: "idle" as const }

export function LoginForm() {
  const [state, action, pending] = useActionState(requestToken, initialState)

  if (state.status === "success") {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Check your email for a login link.
      </p>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <input
        type="email"
        name="email"
        required
        placeholder="your@email.com"
        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base"
      />
      {state.status === "error" && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
      >
        {pending ? "Sending…" : "Send login link"}
      </button>
    </form>
  )
}
