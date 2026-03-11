import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Row, Col } from "../flex"

describe("Row", () => {
  it("renders children in flex-row", () => {
    const { container } = render(<Row>Items</Row>)
    expect(screen.getByText("Items")).toBeInTheDocument()
    expect(container.firstChild).toHaveClass("flex-row")
  })

  it("applies custom className", () => {
    const { container } = render(<Row className="gap-4">Items</Row>)
    expect(container.firstChild).toHaveClass("gap-4")
  })
})

describe("Col", () => {
  it("renders children in flex-col", () => {
    const { container } = render(<Col>Items</Col>)
    expect(screen.getByText("Items")).toBeInTheDocument()
    expect(container.firstChild).toHaveClass("flex-col")
  })
})
