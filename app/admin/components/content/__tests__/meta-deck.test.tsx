import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MetaDeck } from "../meta-deck"

describe("MetaDeck", () => {
  it("renders toggle button", () => {
    render(<MetaDeck />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("shows preview text when collapsed and no content", () => {
    render(<MetaDeck />)
    expect(screen.getByText("Add excerpt & meta description...")).toBeInTheDocument()
  })

  it("shows excerpt as preview when collapsed", () => {
    render(<MetaDeck excerpt="My excerpt text" />)
    const matches = screen.getAllByText("My excerpt text")
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it("expands when toggle clicked", () => {
    render(<MetaDeck />)
    fireEvent.click(screen.getByRole("button"))
    expect(screen.getByText("Meta Information")).toBeInTheDocument()
    expect(screen.getByText("Excerpt")).toBeInTheDocument()
    expect(screen.getByText("Meta Description")).toBeInTheDocument()
  })

  it("starts expanded when defaultExpanded is true", () => {
    render(<MetaDeck defaultExpanded />)
    expect(screen.getByText("Meta Information")).toBeInTheDocument()
  })

  it("shows character count for description", () => {
    render(<MetaDeck defaultExpanded description="Hello" />)
    expect(screen.getByText("5/160 characters • Used for SEO")).toBeInTheDocument()
  })

  it("calls onExcerptChange when excerpt textarea changes", () => {
    const onExcerptChange = vi.fn()
    render(<MetaDeck defaultExpanded onExcerptChange={onExcerptChange} />)
    const textareas = screen.getAllByRole("textbox")
    fireEvent.change(textareas[0], { target: { value: "New excerpt" } })
    expect(onExcerptChange).toHaveBeenCalledWith("New excerpt")
  })
})
