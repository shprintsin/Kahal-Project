import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { Prose } from "../prose"

describe("Prose", () => {
  it("renders html content", () => {
    const { container } = render(<Prose html="<p>Hello</p>" />)
    expect(container.querySelector("p")?.textContent).toBe("Hello")
  })

  it("sets dir=rtl by default", () => {
    const { container } = render(<Prose html="<p>Test</p>" />)
    expect(container.firstChild).toHaveAttribute("dir", "rtl")
  })

  it("accepts dir=ltr override", () => {
    const { container } = render(<Prose html="<p>Test</p>" dir="ltr" />)
    expect(container.firstChild).toHaveAttribute("dir", "ltr")
  })

  it("applies custom className", () => {
    const { container } = render(<Prose html="<p>Test</p>" className="extra" />)
    expect(container.firstChild).toHaveClass("extra")
  })

  it("applies prose base classes", () => {
    const { container } = render(<Prose html="<p>Test</p>" />)
    expect(container.firstChild).toHaveClass("prose")
  })
})
