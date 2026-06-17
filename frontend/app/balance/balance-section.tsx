type KinBalance = { kin_id: string; name: string; deficit_minutes: number }

function formatDeficit(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m behind`
  if (m === 0) return `${h}h behind`
  return `${h}h ${m}m behind`
}

function barColor(minutes: number): string {
  return minutes < 30 ? "bg-amber-400" : "bg-red-500"
}

export function BalanceSection({ balance }: { balance: KinBalance[] }) {
  if (balance.length === 0) return null

  const maxDeficit = Math.max(...balance.map((k) => k.deficit_minutes))

  return (
    <div className="mt-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
        Balance
      </p>
      <ul className="space-y-3">
        {balance.map((k) => (
          <li key={k.kin_id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium">{k.name}</span>
              {k.deficit_minutes > 0 && (
                <span className="text-sm text-[var(--color-muted)]">{formatDeficit(k.deficit_minutes)}</span>
              )}
            </div>
            {k.deficit_minutes > 0 && maxDeficit > 0 && (
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor(k.deficit_minutes)}`}
                  style={{ width: `${(k.deficit_minutes / maxDeficit) * 100}%` }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
