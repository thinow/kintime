"use server"

import { cookies } from "next/headers"

type Kin = { id: string; name: string }

async function getSession(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get("session")?.value ?? ""
}

export async function addKin(name: string): Promise<Kin> {
  const session = await getSession()
  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to add kin: ${res.status}`)
  return res.json()
}

export async function renameKin(id: string, name: string): Promise<void> {
  const session = await getSession()
  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to rename kin: ${res.status}`)
}

export async function deleteKin(id: string): Promise<void> {
  const session = await getSession()
  const res = await fetch(`${process.env.BACKEND_URL}/users/me/kin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session}` },
  })
  if (!res.ok) throw new Error(`Failed to delete kin: ${res.status}`)
}
