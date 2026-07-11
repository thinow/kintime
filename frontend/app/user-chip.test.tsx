// @vitest-environment jsdom
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { UserChip } from "./user-chip"

vi.mock("./auth/actions", () => ({
  signOut: vi.fn(),
}))

describe("UserChip", () => {
  beforeEach(() => vi.clearAllMocks())

  it("shows the username", () => {
    // when
    render(<UserChip username="pat" />)

    // then
    expect(screen.getByText("pat")).toBeInTheDocument()
  })

  it("does not show the sign-out button initially", () => {
    // when
    render(<UserChip username="pat" />)

    // then
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument()
  })

  it("shows the sign-out button after clicking the username", async () => {
    // given
    render(<UserChip username="pat" />)

    // when
    await userEvent.click(screen.getByRole("button", { name: "pat" }))

    // then
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument()
  })

  it("hides the sign-out button again after a second click", async () => {
    // given
    render(<UserChip username="pat" />)
    await userEvent.click(screen.getByRole("button", { name: "pat" }))

    // when
    await userEvent.click(screen.getByRole("button", { name: "pat" }))

    // then
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument()
  })
})
