import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CategoryTile } from "../category-tile"

describe("CategoryTile", () => {
  it("renders title", () => {
    render(<CategoryTile href="/maps" icon={<span>M</span>} title="Maps" />)
    expect(screen.getByText("Maps")).toBeInTheDocument()
  })

  it("renders icon", () => {
    render(<CategoryTile href="/maps" icon={<span data-testid="icon">M</span>} title="Maps" />)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("links to correct href", () => {
    render(<CategoryTile href="/documents" icon={<span>D</span>} title="Docs" />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/documents")
  })
})
