import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteCard, SiteCardHeader, SiteCardContent, SiteCardFooter } from "../site-card"

describe("SiteCard components", () => {
  it("SiteCard renders children in a div", () => {
    render(<SiteCard>Content</SiteCard>)
    expect(screen.getByText("Content")).toBeInTheDocument()
  })

  it("SiteCard has bg-white and shadow classes", () => {
    const { container } = render(<SiteCard>Test</SiteCard>)
    expect(container.firstChild).toHaveClass("bg-white", "shadow-sm")
  })

  it("SiteCardHeader renders as h3", () => {
    render(<SiteCardHeader>Title</SiteCardHeader>)
    expect(screen.getByText("Title").tagName).toBe("H3")
  })

  it("SiteCardContent renders as p", () => {
    render(<SiteCardContent>Body</SiteCardContent>)
    expect(screen.getByText("Body").tagName).toBe("P")
  })

  it("SiteCardFooter renders children", () => {
    render(<SiteCardFooter>Footer</SiteCardFooter>)
    expect(screen.getByText("Footer")).toBeInTheDocument()
  })

  it("accepts custom className", () => {
    const { container } = render(<SiteCard className="custom">Test</SiteCard>)
    expect(container.firstChild).toHaveClass("custom")
  })
})
