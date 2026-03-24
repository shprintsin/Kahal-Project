import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CitationBox } from "../citation-box"

describe("CitationBox", () => {
  it("renders copy button with aria-label", () => {
    render(<CitationBox text="Doe, J. (2024). Study." />)
    expect(screen.getByLabelText("Copy citation")).toBeInTheDocument()
  })

  it("sets citation text as button title", () => {
    render(<CitationBox text="Citation text" />)
    expect(screen.getByTitle("Citation text")).toBeInTheDocument()
  })

  it("shows tooltip text", () => {
    render(<CitationBox text="Citation" />)
    expect(screen.getByText("Copy citation")).toBeInTheDocument()
  })
})
