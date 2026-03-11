import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { LanguageToggle } from "../language-toggle"

describe("LanguageToggle", () => {
  it("renders default languages", () => {
    render(<LanguageToggle value="en" onChange={() => {}} />)
    expect(screen.getByText("EN")).toBeInTheDocument()
    expect(screen.getByText("PL")).toBeInTheDocument()
  })

  it("marks active language with aria-checked", () => {
    render(<LanguageToggle value="en" onChange={() => {}} />)
    const enButton = screen.getByRole("radio", { name: /EN/ })
    const plButton = screen.getByRole("radio", { name: /PL/ })
    expect(enButton).toHaveAttribute("aria-checked", "true")
    expect(plButton).toHaveAttribute("aria-checked", "false")
  })

  it("calls onChange when language clicked", () => {
    const onChange = vi.fn()
    render(<LanguageToggle value="en" onChange={onChange} />)
    fireEvent.click(screen.getByText("PL"))
    expect(onChange).toHaveBeenCalledWith("pl")
  })

  it("renders custom languages", () => {
    const langs = [
      { code: "he" as const, label: "HE", flag: "🇮🇱" },
      { code: "en" as const, label: "EN", flag: "🇺🇸" },
    ]
    render(<LanguageToggle languages={langs} value="he" onChange={() => {}} />)
    expect(screen.getByText("HE")).toBeInTheDocument()
    expect(screen.getByText("EN")).toBeInTheDocument()
  })

  it("renders as radiogroup", () => {
    render(<LanguageToggle value="en" onChange={() => {}} />)
    expect(screen.getByRole("radiogroup")).toBeInTheDocument()
  })

  it("renders separator between languages", () => {
    const { container } = render(<LanguageToggle value="en" onChange={() => {}} />)
    const separators = container.querySelectorAll("[aria-hidden='true']")
    expect(separators.length).toBeGreaterThanOrEqual(1)
  })
})
