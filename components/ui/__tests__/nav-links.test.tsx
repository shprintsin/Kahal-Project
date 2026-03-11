import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SeeMoreButton, ReadMore } from "../nav-links"

describe("SeeMoreButton", () => {
  it("renders children text", () => {
    render(<SeeMoreButton>View All</SeeMoreButton>)
    expect(screen.getByText("View All")).toBeInTheDocument()
  })

  it("renders with default href", () => {
    const { container } = render(<SeeMoreButton>More</SeeMoreButton>)
    const link = container.querySelector("a")
    expect(link).toHaveAttribute("href", "#")
  })

  it("renders with custom href", () => {
    const { container } = render(<SeeMoreButton href="/posts">More</SeeMoreButton>)
    const link = container.querySelector("a")
    expect(link).toHaveAttribute("href", "/posts")
  })
})

describe("ReadMore", () => {
  it("renders children text", () => {
    render(<ReadMore>Read more</ReadMore>)
    expect(screen.getByText("Read more")).toBeInTheDocument()
  })

  it("renders with custom href", () => {
    const { container } = render(<ReadMore href="/article/1">Continue</ReadMore>)
    const link = container.querySelector("a")
    expect(link).toHaveAttribute("href", "/article/1")
  })
})
