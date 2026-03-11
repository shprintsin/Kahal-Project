import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { DynamicIcon } from "../dynamic-icon"

describe("DynamicIcon", () => {
  it("renders Lucide icon by name", () => {
    const { container } = render(<DynamicIcon icon="Home" className="w-5 h-5" />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass("w-5", "h-5")
  })

  it("renders null for unknown icon", () => {
    const { container } = render(<DynamicIcon icon="NonExistentIcon12345" />)
    expect(container.innerHTML).toBe("")
  })

  it("renders FontAwesome fallback", () => {
    const { container } = render(<DynamicIcon icon="FaSearch" className="text-xl" />)
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })
})
