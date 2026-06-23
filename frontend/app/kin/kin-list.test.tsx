// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { KinList } from "./kin-list"

vi.mock("./actions", () => ({
  addKin: vi.fn(),
  renameKin: vi.fn(),
  deleteKin: vi.fn(),
}))

import { addKin, deleteKin, renameKin } from "./actions"

const CASEY  = { id: "1", name: "Casey" }
const JAMIE  = { id: "2", name: "Jamie" }
const MORGAN = { id: "3", name: "Morgan" }

describe("KinList", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("add", () => {
    it("shows the new kin after submitting the form", async () => {
      // given
      vi.mocked(addKin).mockResolvedValue(MORGAN)
      render(<KinList kin={[CASEY, JAMIE]} />)

      // when
      await userEvent.type(screen.getByPlaceholderText("Add a name…"), "Morgan")
      await userEvent.click(screen.getByRole("button", { name: "Add" }))

      // then
      await waitFor(() => expect(screen.getByText("Morgan")).toBeInTheDocument())
    })

    it("inserts the new kin in alphabetical order", async () => {
      // given
      vi.mocked(addKin).mockResolvedValue(MORGAN)
      render(<KinList kin={[CASEY, JAMIE]} />)

      // when
      await userEvent.type(screen.getByPlaceholderText("Add a name…"), "Morgan")
      await userEvent.click(screen.getByRole("button", { name: "Add" }))

      // then
      await waitFor(() => {
        const items = screen.getAllByRole("listitem")
        expect(items[0]).toHaveTextContent("Casey")
        expect(items[1]).toHaveTextContent("Jamie")
        expect(items[2]).toHaveTextContent("Morgan")
      })
    })
  })

  describe("rename", () => {
    it("updates the displayed name after saving", async () => {
      // given
      vi.mocked(renameKin).mockResolvedValue(undefined)
      render(<KinList kin={[CASEY]} />)

      // when — click the name to enter edit mode, then save with a new name
      await userEvent.click(screen.getByText("Casey"))
      const input = screen.getByDisplayValue("Casey") // distinguishes edit input from "Add a name…"
      await userEvent.clear(input)
      await userEvent.type(input, "Zara")
      await userEvent.click(screen.getByRole("button", { name: "Save" }))

      // then
      await waitFor(() => {
        expect(screen.getByText("Zara")).toBeInTheDocument()
        expect(screen.queryByText("Casey")).not.toBeInTheDocument()
      })
    })

    it("re-sorts the list after renaming", async () => {
      // given — rename Casey to Zara; Zara should move after Jamie
      vi.mocked(renameKin).mockResolvedValue(undefined)
      render(<KinList kin={[CASEY, JAMIE]} />)

      // when
      const caseyItem = screen.getByText("Casey").closest("li")!
      await userEvent.click(within(caseyItem).getByText("Casey"))
      const input = screen.getByDisplayValue("Casey")
      await userEvent.clear(input)
      await userEvent.type(input, "Zara")
      await userEvent.click(screen.getByRole("button", { name: "Save" }))

      // then
      await waitFor(() => {
        const items = screen.getAllByRole("listitem")
        expect(items[0]).toHaveTextContent("Jamie")
        expect(items[1]).toHaveTextContent("Zara")
      })
    })
  })

  describe("delete", () => {
    it("removes the kin after confirming", async () => {
      // given
      vi.mocked(deleteKin).mockResolvedValue(undefined)
      render(<KinList kin={[CASEY, JAMIE]} />)

      // when — click Remove on Casey's row, then confirm within the same row
      const caseyItem = screen.getByText("Casey").closest("li")!
      await userEvent.click(within(caseyItem).getByText("Remove"))
      await userEvent.click(within(caseyItem).getByRole("button", { name: "Remove" }))

      // then
      await waitFor(() => {
        expect(screen.queryByText("Casey")).not.toBeInTheDocument()
        expect(screen.getByText("Jamie")).toBeInTheDocument()
      })
    })
  })
})
