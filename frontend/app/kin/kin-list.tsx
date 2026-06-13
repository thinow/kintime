"use client"

import { useTransition, useState } from "react"
import { addKin, deleteKin, renameKin } from "./actions"

type Kin = { id: string; name: string }

export function KinList({ kin: initialKin }: { kin: Kin[] }) {
  const [kin, setKin] = useState<Kin[]>(initialKin)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (new FormData(form).get("name") as string).trim()
    startTransition(async () => {
      const newKin = await addKin(name)
      setKin((prev) => [...prev, newKin])
      form.reset()
    })
  }

  function handleRename(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    startTransition(async () => {
      await renameKin(id, name)
      setKin((prev) => prev.map((k) => (k.id === id ? { ...k, name } : k)))
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteKin(id)
      setKin((prev) => prev.filter((k) => k.id !== id))
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
                  disabled={isPending}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-3 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  disabled={isPending}
                  className="px-3 py-2 rounded-xl border border-stone-200 text-[var(--color-muted)] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setEditingId(k.id)}
                  disabled={isPending}
                  className="flex-1 text-left text-base font-medium text-[var(--color-fg)] py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {k.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(k.id)}
                  disabled={isPending}
                  className="text-sm text-[var(--color-muted)] hover:text-red-500 transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          name="name"
          placeholder="Add a name…"
          required
          disabled={isPending}
          className="flex-1 px-4 py-3 rounded-xl border border-stone-200 bg-white text-[var(--color-fg)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-base disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-3 rounded-xl bg-[var(--color-accent)] text-white font-semibold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          Add
        </button>
      </form>
    </div>
  )
}
