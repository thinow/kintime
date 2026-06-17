"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { logMoment } from "./actions"

export function QuickLogButton({ kinId, minutes, label }: { kinId: string; minutes: number; label: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await logMoment(kinId, minutes)
          router.refresh()
        })
      }
      disabled={isPending}
      className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-medium text-[var(--color-fg)] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isPending ? "…" : label}
    </button>
  )
}
