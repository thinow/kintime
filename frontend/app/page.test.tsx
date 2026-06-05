import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import Page from "./page"

function makeSessionToken(email: string): string {
  const payload = {
    user_id: "00000000-0000-0000-0000-000000000001",
    email,
    expires_at: "2099-01-01T00:00:00Z",
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${payloadB64}.fakesig`
}

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}))

describe("Page", () => {
  it("shows the user's email when a valid session cookie is present", async () => {
    // given
    const { cookies } = await import("next/headers")
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === "session" ? { value: makeSessionToken("pat@example.com") } : undefined,
    } as never)

    // when
    const html = renderToStaticMarkup(await Page())

    // then
    expect(html).toContain("Hey! pat@example.com")
  })

  it("shows nothing when no session cookie is present", async () => {
    // given
    const { cookies } = await import("next/headers")
    vi.mocked(cookies).mockResolvedValue({
      get: () => undefined,
    } as never)

    // when
    const html = renderToStaticMarkup(await Page())

    // then
    expect(html).not.toContain("Hey!")
  })
})
