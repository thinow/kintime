// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickLogSection } from "./log-moment-form"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock("./actions", () => ({
  logMoment: vi.fn(),
}))

const CASEY = { id: "1", name: "Casey" }
const JAMIE = { id: "2", name: "Jamie" }

describe("QuickLogSection", () => {
  it("shows placeholder text when the kin list is empty", () => {
    // when
    render(<QuickLogSection kin={[]} />)

    // then
    expect(
      screen.getByText("Add some kin before logging time.")
    ).toBeInTheDocument()
  })

  it("renders one row per kin with three preset buttons", () => {
    // when
    render(<QuickLogSection kin={[CASEY, JAMIE]} />)

    // then
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)

    const caseyRow = items.find((li) => li.textContent?.includes("Casey"))!
    expect(within(caseyRow).getByRole("button", { name: "+15m" })).toBeInTheDocument()
    expect(within(caseyRow).getByRole("button", { name: "+30m" })).toBeInTheDocument()
    expect(within(caseyRow).getByRole("button", { name: "+1h" })).toBeInTheDocument()
  })

  it("renders the 'Log custom time →' link when kin are present", () => {
    // when
    render(<QuickLogSection kin={[CASEY]} />)

    // then
    expect(screen.getByRole("link", { name: /Log custom time/ })).toBeInTheDocument()
  })
})
