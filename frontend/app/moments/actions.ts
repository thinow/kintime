"use server"

import { cookies } from "next/headers"

export async function logMoment(kinId: string, durationMinutes: number): Promise<void> {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value ?? ""

  const res = await fetch(`${process.env.BACKEND_URL}/users/me/moments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify({ kin_id: kinId, duration_minutes: durationMinutes }),
  })

  if (!res.ok) throw new Error(`Failed to log moment: ${res.status}`)
}
