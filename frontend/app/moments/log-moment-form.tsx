"use client"

import Link from "next/link"
import { QuickLogButton } from "./quick-log-button"

type Kin = { id: string; name: string }

const PRESETS = [
  { minutes: 15, label: "+15m" },
  { minutes: 30, label: "+30m" },
  { minutes: 60, label: "+1h" },
]

export function QuickLogSection({ kin }: { kin: Kin[] }) {
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

      <Link
        href="/log"
        className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors"
      >
        Log custom time →
      </Link>
    </div>
  )
}
