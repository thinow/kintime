"use server"

type ActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string }

export async function requestToken(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get("email")

  const res = await fetch(`${process.env.BACKEND_URL}/auth/request-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  if (res.ok) return { status: "success" }
  if (res.status === 422) return { status: "error", message: "Please enter a valid email address." }
  return { status: "error", message: "Something went wrong. Please try again." }
}
