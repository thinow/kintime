"use client"

import { useTransition, useState } from "react"
import { addKin, deleteKin, renameKin } from "./actions"

type Kin = { id: string; name: string }

export function KinList({ kin }: { kin: Kin[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await renameKin(formData)
      setEditingId(null)
    })
  }

  return (
    <div className="mt-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-muted)] mb-4">
        Your kin
      </p>

      {kin.length === 0 && (
        <p className="text-sm text-[var(--color-muted)] mb-4">No kin yet — add someone below.</p>
      )}

      <ul className="space-y-2 mb-4">
        {kin.map((k) => (
          <li key={k.id}>
            {editingId === k.id ? (
              <form onSubmit={handleRename} className="flex gap-2">
                <input type="hidden" name="id" value={k.id} />
                <input
                  name="name"
                  defaultValue={k.name}
                  autoFocus
                  required
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-[var(--color-muted)] text-sm"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(k.id)}
                  className="flex-1 text-left text-base font-medium text-[var(--color-fg)] py-2"
                >
                  {k.name}
                </button>
                <form action={deleteKin}>
                  <input type="hidden" name="id" value={k.id} />
                  <button
                    type="submit"
                    className="text-sm text-[var(--color-muted)] hover:text-red-500 transition-colors py-2"
                  >
                    Remove
                  </button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form action={addKin} className="flex gap-2">
        <input
          name="name"
          placeholder="Add a name…"
          required
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base"
        />
        <button
          type="submit"
          className="px-4 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold active:scale-95 transition-transform"
        >
          Add
        </button>
      </form>
    </div>
  )
}
