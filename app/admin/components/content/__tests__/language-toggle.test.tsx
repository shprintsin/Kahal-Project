import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { LanguageToggle } from "../language-toggle"

describe("LanguageToggle", () => {
  it("renders default languages", () => {
    render(<LanguageToggle value="en" onChange={() => {}} />)
    expect(screen.getByText("EN")).toBeInTheDocument()
    expect(screen.getByText("HE")).toBeInTheDocument()
  })

  it("marks active language with aria-checked", () => {
    render(<LanguageToggle value="en" onChange={() => {}} />)
    const enButton = screen.getByRole("radio", { name: /EN/ })
    const heButton = screen.getByRole("radio", { name: /HE/ })
    expect(enButton).toHaveAttribute("aria-checked", "true")
    expect(heButton).toHaveAttribute("aria-checked", "false")
  })

  it("calls onChange when language clicked", () => {
    const onChange = vi.fn()
    render(<LanguageToggle value="en" onChange={onChange} />)
    fireEvent.click(screen.getByText("HE"))
    expect(onChange).toHaveBeenCalledWith("he")
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
