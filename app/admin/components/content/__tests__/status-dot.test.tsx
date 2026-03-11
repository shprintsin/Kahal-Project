import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatusDot } from "../status-dot"

describe("StatusDot", () => {
  it("renders without label by default", () => {
    const { container } = render(<StatusDot status="draft" />)
    expect(container.querySelector(".rounded-full")).toBeInTheDocument()
    expect(screen.queryByText("Draft")).not.toBeInTheDocument()
  })

  it("shows label when showLabel is true", () => {
    render(<StatusDot status="published" showLabel />)
    expect(screen.getByText("Published")).toBeInTheDocument()
  })

  it("uses emerald color for published", () => {
    const { container } = render(<StatusDot status="published" />)
    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument()
  })

  it("uses slate color for draft", () => {
    const { container } = render(<StatusDot status="draft" />)
    expect(container.querySelector(".bg-slate-400")).toBeInTheDocument()
  })

  it("uses amber color for archived", () => {
    const { container } = render(<StatusDot status="archived" />)
    expect(container.querySelector(".bg-amber-500")).toBeInTheDocument()
  })

  it("uses rose color for changes_requested", () => {
    const { container } = render(<StatusDot status="changes_requested" />)
    expect(container.querySelector(".bg-rose-500")).toBeInTheDocument()
  })

  it("respects size prop", () => {
    const { container } = render(<StatusDot status="draft" size="lg" />)
    expect(container.querySelector(".w-2\\.5")).toBeInTheDocument()
  })

  it("falls back to draft for unknown status", () => {
    const { container } = render(<StatusDot status={"unknown" as any} />)
    expect(container.querySelector(".bg-slate-400")).toBeInTheDocument()
  })
})
