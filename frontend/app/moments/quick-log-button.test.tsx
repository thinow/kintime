// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QuickLogButton } from "./quick-log-button"

const mockRefresh = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock("./actions", () => ({
  logMoment: vi.fn(),
}))

import { logMoment } from "./actions"

describe("QuickLogButton", () => {
  beforeEach(() => vi.clearAllMocks())

  it("calls logMoment with the correct kinId and minutes on click", async () => {
    // given
    vi.mocked(logMoment).mockResolvedValue(undefined)
    render(<QuickLogButton kinId="casey-id" minutes={30} label="+30m" />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "+30m" }))

    // then
    await waitFor(() => expect(logMoment).toHaveBeenCalledWith("casey-id", 30))
  })

  it("refreshes the page after logging", async () => {
    // given
    vi.mocked(logMoment).mockResolvedValue(undefined)
    render(<QuickLogButton kinId="casey-id" minutes={30} label="+30m" />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "+30m" }))

    // then
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
