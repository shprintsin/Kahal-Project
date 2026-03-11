import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { TagPill, TagPillList } from "../tag-pill"

describe("TagPill", () => {
  it("renders children text", () => {
    render(<TagPill>Test Tag</TagPill>)
    expect(screen.getByText("Test Tag")).toBeInTheDocument()
  })

  it("renders as span by default", () => {
    render(<TagPill>Tag</TagPill>)
    const el = screen.getByText("Tag")
    expect(el.tagName).toBe("SPAN")
  })

  it("renders as anchor when href provided", () => {
    render(<TagPill href="/test">Link Tag</TagPill>)
    const el = screen.getByText("Link Tag")
    expect(el.tagName).toBe("A")
    expect(el).toHaveAttribute("href", "/test")
  })

  it("renders icon alongside text", () => {
    render(<TagPill icon={<span data-testid="icon">★</span>}>Tag</TagPill>)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
    expect(screen.getByText("Tag")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<TagPill className="custom-class">Tag</TagPill>)
    expect(screen.getByText("Tag")).toHaveClass("custom-class")
  })
})

describe("TagPillList", () => {
  it("renders children", () => {
    render(
      <TagPillList>
        <TagPill>A</TagPill>
        <TagPill>B</TagPill>
      </TagPillList>
    )
    expect(screen.getByText("A")).toBeInTheDocument()
    expect(screen.getByText("B")).toBeInTheDocument()
  })

  it("applies flex-wrap layout", () => {
    const { container } = render(
      <TagPillList>
        <TagPill>A</TagPill>
      </TagPillList>
    )
    expect(container.firstChild).toHaveClass("flex", "flex-wrap")
  })
})
