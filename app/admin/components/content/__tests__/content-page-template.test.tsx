import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ContentPageTemplate, ContentPageSection } from "../content-page-template"

describe("ContentPageTemplate", () => {
  it("renders children", () => {
    render(<ContentPageTemplate>Page content</ContentPageTemplate>)
    expect(screen.getByText("Page content")).toBeInTheDocument()
  })

  it("applies max width class", () => {
    const { container } = render(<ContentPageTemplate maxWidth="sm">C</ContentPageTemplate>)
    expect(container.firstChild).toHaveClass("max-w-screen-sm")
  })

  it("defaults to 6xl max width", () => {
    const { container } = render(<ContentPageTemplate>C</ContentPageTemplate>)
    expect(container.firstChild).toHaveClass("max-w-[1920px]")
  })
})

describe("ContentPageSection", () => {
  it("renders children", () => {
    render(<ContentPageSection>Section content</ContentPageSection>)
    expect(screen.getByText("Section content")).toBeInTheDocument()
  })

  it("renders title when provided", () => {
    render(<ContentPageSection title="Settings">Content</ContentPageSection>)
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("renders description when provided", () => {
    render(<ContentPageSection description="Configure here">Content</ContentPageSection>)
    expect(screen.getByText("Configure here")).toBeInTheDocument()
  })

  it("does not render header when no title or description", () => {
    const { container } = render(<ContentPageSection>Just content</ContentPageSection>)
    expect(container.querySelector("h2")).not.toBeInTheDocument()
  })
})
