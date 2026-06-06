"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

async function getSession(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get("session")?.value ?? ""
}

export async function addKin(formData: FormData): Promise<void> {
  const session = await getSession()
  const name = formData.get("name") as string

  await fetch(`${process.env.BACKEND_URL}/users/me/kin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
    body: JSON.stringify({ name }),
  })

  revalidatePath("/")
}

export async function renameKin(formData: FormData): Promise<void> {
  const session = await getSession()
  const id = formData.get("id") as string
  const name = formData.get("name") as string

  await fetch(`${process.env.BACKEND_URL}/users/me/kin/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` },
    body: JSON.stringify({ name }),
  })

  revalidatePath("/")
}

export async function deleteKin(formData: FormData): Promise<void> {
  const session = await getSession()
  const id = formData.get("id") as string

  await fetch(`${process.env.BACKEND_URL}/users/me/kin/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session}` },
  })

  revalidatePath("/")
}
