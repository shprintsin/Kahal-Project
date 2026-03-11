import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MetaRow, MetaItem } from "../metadata"

describe("MetaRow", () => {
  it("renders children with dot separators", () => {
    render(
      <MetaRow>
        <span>Item 1</span>
        <span>Item 2</span>
      </MetaRow>
    )
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.getByText("Item 2")).toBeInTheDocument()
    expect(screen.getByText("•")).toBeInTheDocument()
  })

  it("does not add separator after last item", () => {
    render(
      <MetaRow>
        <span>Only</span>
      </MetaRow>
    )
    expect(screen.queryByText("•")).not.toBeInTheDocument()
  })
})

describe("MetaItem", () => {
  it("renders text content", () => {
    render(<MetaItem>Author Name</MetaItem>)
    expect(screen.getByText("Author Name")).toBeInTheDocument()
  })

  it("renders as link when href provided", () => {
    render(<MetaItem href="/author">Author</MetaItem>)
    const link = screen.getByText("Author").closest("a")
    expect(link).toHaveAttribute("href", "/author")
  })

  it("renders without link when no href", () => {
    render(<MetaItem>Plain</MetaItem>)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
