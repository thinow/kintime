"use client"

import { useActionState } from "react"
import { requestToken } from "./actions"

const initialState = { status: "idle" as const }

export function LoginForm() {
  const [state, action, pending] = useActionState(requestToken, initialState)

  if (state.status === "success") {
    return <p>Check your email for a login link.</p>
  }

  return (
    <form action={action}>
      <input type="email" name="email" required placeholder="your@email.com" />
      {state.status === "error" && <p>{state.message}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send login link"}
      </button>
    </form>
  )
}
