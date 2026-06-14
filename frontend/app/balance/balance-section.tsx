type KinBalance = { kin_id: string; name: string; deficit_minutes: number }

function formatDeficit(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m behind`
  if (m === 0) return `${h}h behind`
  return `${h}h ${m}m behind`
}

export function BalanceSection({ balance }: { balance: KinBalance[] }) {
  if (balance.length === 0) return null

  return (
    <div className="mt-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
        Balance
      </p>
      <ul className="space-y-1">
        {balance.map((k) => (
          <li key={k.kin_id} className="flex items-center justify-between py-2">
            <span className="font-medium">{k.name}</span>
            {k.deficit_minutes > 0 && (
              <span className="text-sm text-[var(--color-muted)]">{formatDeficit(k.deficit_minutes)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
