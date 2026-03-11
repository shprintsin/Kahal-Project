import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Section, RowSection, NoteCard, ContentCard, SidebarInfoCard, HighlightCard } from "../sections"

describe("Section", () => {
  it("renders children", () => {
    render(<Section>Section content</Section>)
    expect(screen.getByText("Section content")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<Section className="mt-4">C</Section>)
    expect(container.firstChild).toHaveClass("mt-4")
  })
})

describe("RowSection", () => {
  it("renders with flex-row", () => {
    const { container } = render(<RowSection>Row</RowSection>)
    expect(container.firstChild).toHaveClass("flex-row")
  })
})

describe("NoteCard", () => {
  it("renders children", () => {
    render(<NoteCard>Note text</NoteCard>)
    expect(screen.getByText("Note text")).toBeInTheDocument()
  })
})

describe("ContentCard", () => {
  it("renders children", () => {
    render(<ContentCard>Card content</ContentCard>)
    expect(screen.getByText("Card content")).toBeInTheDocument()
  })
})

describe("SidebarInfoCard", () => {
  it("renders with sticky positioning", () => {
    const { container } = render(<SidebarInfoCard>Info</SidebarInfoCard>)
    expect(container.firstChild).toHaveClass("sticky")
  })
})

describe("HighlightCard", () => {
  it("renders children", () => {
    render(<HighlightCard>Highlight</HighlightCard>)
    expect(screen.getByText("Highlight")).toBeInTheDocument()
  })
})
