import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "../empty-state"

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="No items found" />)
    expect(screen.getByText("No items found")).toBeInTheDocument()
  })

  it("renders icon when provided", () => {
    render(<EmptyState message="Empty" icon={<span data-testid="icon">📭</span>} />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("does not render icon when not provided", () => {
    const { container } = render(<EmptyState message="Empty" />)
    expect(container.querySelector("[data-testid='icon']")).not.toBeInTheDocument()
  })

  it("accepts custom className", () => {
    const { container } = render(<EmptyState message="Test" className="custom" />)
    expect(container.firstChild).toHaveClass("custom")
  })
})
