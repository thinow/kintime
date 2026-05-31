import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import Page from "./page"

describe("Page", () => {
  beforeEach(() => {
    process.env.BACKEND_URL = "http://localhost:8080"
  })

  it("renders the server timestamp from the health endpoint", async () => {
    // given
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: "ok", time: "2026-05-31T12:00:00Z" }),
    }))

    // when
    const html = renderToStaticMarkup(await Page())

    // then
    expect(html).toContain("2026-05-31T12:00:00Z")
  })
})
