// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LoginForm } from "./login-form"

vi.mock("./actions", () => ({
  requestToken: vi.fn(),
}))

import { requestToken } from "./actions"

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks())

  it("shows 'Check your email' after successful action", async () => {
    // given
    vi.mocked(requestToken).mockResolvedValue({ status: "success" })
    render(<LoginForm />)

    // when
    await userEvent.type(screen.getByRole("textbox"), "pat@example.com")
    await userEvent.click(screen.getByRole("button", { name: "Send login link" }))

    // then
    await waitFor(() =>
      expect(screen.getByText(/Check your email/)).toBeInTheDocument()
    )
  })

  it("shows the error message when action returns an error", async () => {
    // given
    vi.mocked(requestToken).mockResolvedValue({
      status: "error",
      message: "Something went wrong. Please try again.",
    })
    render(<LoginForm />)

    // when
    await userEvent.type(screen.getByRole("textbox"), "pat@example.com")
    await userEvent.click(screen.getByRole("button", { name: "Send login link" }))

    // then
    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument()
    )
  })

  it("disables the submit button and shows 'Sending…' while pending", async () => {
    // given — action never resolves so we can observe the in-flight state
    vi.mocked(requestToken).mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)

    // when — fire the click without awaiting so the pending state is visible
    await userEvent.type(screen.getByRole("textbox"), "pat@example.com")
    userEvent.click(screen.getByRole("button", { name: "Send login link" }))

    // then
    await waitFor(() => {
      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent("Sending…")
    })
  })
})
