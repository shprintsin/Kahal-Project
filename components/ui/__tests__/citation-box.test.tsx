import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { CitationBox } from "../citation-box"

describe("CitationBox", () => {
  it("renders citation text in textarea", () => {
    render(<CitationBox text="Doe, J. (2024). Study." />)
    expect(screen.getByDisplayValue("Doe, J. (2024). Study.")).toBeInTheDocument()
  })

  it("renders copy button", () => {
    render(<CitationBox text="Citation text" />)
    expect(screen.getByText("העתק")).toBeInTheDocument()
  })

  it("textarea is readonly", () => {
    render(<CitationBox text="Citation" />)
    const textarea = screen.getByDisplayValue("Citation")
    expect(textarea).toHaveAttribute("readonly")
  })
})
