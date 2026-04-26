import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { DlField, DlGroup } from "../dl-field"

describe("DlField", () => {
  it("renders label and content", () => {
    render(<DlField label="Status">Active</DlField>)
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })

  it("has border by default", () => {
    const { container } = render(<DlField label="L">C</DlField>)
    expect(container.firstChild).toHaveClass("border-b")
  })

  it("removes border when border=false", () => {
    const { container } = render(<DlField label="L" border={false}>C</DlField>)
    expect(container.firstChild).not.toHaveClass("border-b")
  })
})

describe("DlGroup", () => {
  it("renders children in a dl element", () => {
    const { container } = render(
      <DlGroup>
        <DlField label="A">1</DlField>
      </DlGroup>
    )
    expect(container.querySelector("dl")).toBeInTheDocument()
  })

  it("applies logical text-start (resolves to RTL/LTR via dir)", () => {
    const { container } = render(<DlGroup>content</DlGroup>)
    expect(container.firstChild).toHaveClass("text-start")
  })
})
