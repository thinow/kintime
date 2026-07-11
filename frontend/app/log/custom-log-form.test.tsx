// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CustomLogForm } from "./custom-log-form"

const mockRefresh = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

vi.mock("../moments/actions", () => ({
  logMoment: vi.fn(),
}))

import { logMoment } from "../moments/actions"

const CASEY = { id: "casey-id", name: "Casey" }
const JAMIE = { id: "jamie-id", name: "Jamie" }

describe("CustomLogForm", () => {
  beforeEach(() => vi.clearAllMocks())

  it("submit button is disabled when no duration is selected", () => {
    // when
    render(<CustomLogForm kin={[CASEY, JAMIE]} />)

    // then
    expect(screen.getByRole("button", { name: "Log" })).toBeDisabled()
  })

  it("submit button enables after selecting a duration", async () => {
    // given
    render(<CustomLogForm kin={[CASEY, JAMIE]} />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "30m" }))

    // then
    expect(screen.getByRole("button", { name: "Log" })).not.toBeDisabled()
  })

  it("calls logMoment with the correct kinId and minutes on submit", async () => {
    // given
    vi.mocked(logMoment).mockResolvedValue(undefined)
    render(<CustomLogForm kin={[CASEY, JAMIE]} />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "Casey" }))
    await userEvent.click(screen.getByRole("button", { name: "30m" }))
    await userEvent.click(screen.getByRole("button", { name: "Log" }))

    // then
    await waitFor(() => expect(logMoment).toHaveBeenCalledWith("casey-id", 30))
  })

  it("shows 'Logged!' after a successful submit", async () => {
    // given
    vi.mocked(logMoment).mockResolvedValue(undefined)
    render(<CustomLogForm kin={[CASEY]} />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "30m" }))
    await userEvent.click(screen.getByRole("button", { name: "Log" }))

    // then
    await waitFor(() => expect(screen.getByText("Logged!")).toBeInTheDocument())
  })

  it("shows the error message after a failed submit", async () => {
    // given
    vi.mocked(logMoment).mockRejectedValue(new Error("network error"))
    render(<CustomLogForm kin={[CASEY]} />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "30m" }))
    await userEvent.click(screen.getByRole("button", { name: "Log" }))

    // then
    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument()
    )
  })

  it("calls router.refresh() after a successful submit", async () => {
    // given
    vi.mocked(logMoment).mockResolvedValue(undefined)
    render(<CustomLogForm kin={[CASEY]} />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "30m" }))
    await userEvent.click(screen.getByRole("button", { name: "Log" }))

    // then
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
