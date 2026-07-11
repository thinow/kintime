export type Kin = { id: string; name: string }

export async function fetchKin(session: string): Promise<Kin[]> {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
      headers: { Authorization: `Bearer ${session}` },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
