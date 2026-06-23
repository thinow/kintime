"use client"

import { useState } from "react"
import { signOut } from "./auth/actions"

export function UserChip({ username }: { username: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
      >
        {username}
      </button>
      {expanded && (
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </form>
      )}
    </div>
  )
}
