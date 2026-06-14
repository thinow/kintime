import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { BalanceSection } from "./balance-section"

const CASEY_ID = "00000000-0000-0000-0000-000000000001"
const JAMIE_ID = "00000000-0000-0000-0000-000000000002"
const MORGAN_ID = "00000000-0000-0000-0000-000000000003"

describe("BalanceSection", () => {
  it("renders nothing when the balance list is empty", () => {
    const html = renderToStaticMarkup(<BalanceSection balance={[]} />)
    expect(html).toBe("")
  })

  it("shows the leader's name without a deficit label", () => {
    const html = renderToStaticMarkup(
      <BalanceSection balance={[{ kin_id: CASEY_ID, name: "Casey", deficit_minutes: 0 }]} />
    )
    expect(html).toContain("Casey")
    expect(html).not.toContain("behind")
  })

  it("formats a minutes-only deficit", () => {
    const html = renderToStaticMarkup(
      <BalanceSection balance={[{ kin_id: JAMIE_ID, name: "Jamie", deficit_minutes: 45 }]} />
    )
    expect(html).toContain("45m behind")
  })

  it("formats an hours-only deficit", () => {
    const html = renderToStaticMarkup(
      <BalanceSection balance={[{ kin_id: JAMIE_ID, name: "Jamie", deficit_minutes: 120 }]} />
    )
    expect(html).toContain("2h behind")
  })

  it("formats a mixed hours and minutes deficit", () => {
    const html = renderToStaticMarkup(
      <BalanceSection balance={[{ kin_id: JAMIE_ID, name: "Jamie", deficit_minutes: 90 }]} />
    )
    expect(html).toContain("1h 30m behind")
  })

  it("renders all three kin with correct deficits", () => {
    const balance = [
      { kin_id: CASEY_ID,  name: "Casey",  deficit_minutes: 0 },
      { kin_id: JAMIE_ID,  name: "Jamie",  deficit_minutes: 30 },
      { kin_id: MORGAN_ID, name: "Morgan", deficit_minutes: 60 },
    ]
    const html = renderToStaticMarkup(<BalanceSection balance={balance} />)
    expect(html).toContain("Casey")
    expect(html).toContain("Jamie")
    expect(html).toContain("Morgan")
    expect(html).toContain("30m behind")
    expect(html).toContain("1h behind")
  })
})
