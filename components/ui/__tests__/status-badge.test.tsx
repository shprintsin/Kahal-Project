import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { StatusBadge, StatusBadgeLarge, MaturityBadge, PublishStatusBadge } from "../status-badge"

describe("StatusBadge", () => {
  it("renders children", () => {
    render(<StatusBadge>Active</StatusBadge>)
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("applies variant classes", () => {
    const { container } = render(<StatusBadge variant="green">OK</StatusBadge>)
    expect(container.firstChild).toHaveClass("bg-green-100")
  })

  it("defaults to blue variant", () => {
    const { container } = render(<StatusBadge>Test</StatusBadge>)
    expect(container.firstChild).toHaveClass("bg-blue-100")
  })

  it("accepts custom className", () => {
    const { container } = render(<StatusBadge className="custom">Test</StatusBadge>)
    expect(container.firstChild).toHaveClass("custom")
  })
})

describe("StatusBadgeLarge", () => {
  it("renders with rounded-full class", () => {
    const { container } = render(<StatusBadgeLarge>Large</StatusBadgeLarge>)
    expect(container.firstChild).toHaveClass("rounded-full")
  })
})

describe("MaturityBadge", () => {
  it("renders verified label in Hebrew", () => {
    render(<MaturityBadge maturity="verified" />)
    expect(screen.getByText("מאומת")).toBeInTheDocument()
  })

  it("renders provisional label", () => {
    render(<MaturityBadge maturity="provisional" />)
    expect(screen.getByText("זמני")).toBeInTheDocument()
  })

  it("falls back to raw for unknown maturity", () => {
    render(<MaturityBadge maturity="unknown" />)
    expect(screen.getByText("גולמי")).toBeInTheDocument()
  })
})

describe("PublishStatusBadge", () => {
  it("renders published label", () => {
    render(<PublishStatusBadge status="published" />)
    expect(screen.getByText("פורסם")).toBeInTheDocument()
  })

  it("renders draft label", () => {
    render(<PublishStatusBadge status="draft" />)
    expect(screen.getByText("טיוטה")).toBeInTheDocument()
  })

  it("falls back to draft for unknown status", () => {
    render(<PublishStatusBadge status="unknown" />)
    expect(screen.getByText("טיוטה")).toBeInTheDocument()
  })
})
