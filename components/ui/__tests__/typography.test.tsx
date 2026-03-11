import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { H3, PageTitle, PageSubtitle, SectionTitle, SectionSubTitle } from "../typography"

describe("Typography components", () => {
  it("H3 renders as h3", () => {
    render(<H3>Heading</H3>)
    const el = screen.getByText("Heading")
    expect(el.tagName).toBe("H3")
  })

  it("PageTitle renders as h1", () => {
    render(<PageTitle>Title</PageTitle>)
    const el = screen.getByText("Title")
    expect(el.tagName).toBe("H1")
  })

  it("PageSubtitle renders as p", () => {
    render(<PageSubtitle>Subtitle</PageSubtitle>)
    const el = screen.getByText("Subtitle")
    expect(el.tagName).toBe("P")
  })

  it("SectionTitle renders as h2", () => {
    render(<SectionTitle>Section</SectionTitle>)
    const el = screen.getByText("Section")
    expect(el.tagName).toBe("H2")
  })

  it("SectionSubTitle renders as h2", () => {
    render(<SectionSubTitle>Sub</SectionSubTitle>)
    const el = screen.getByText("Sub")
    expect(el.tagName).toBe("H2")
  })

  it("accepts custom className", () => {
    render(<H3 className="extra">Test</H3>)
    const el = screen.getByText("Test")
    expect(el).toHaveClass("extra")
  })
})
