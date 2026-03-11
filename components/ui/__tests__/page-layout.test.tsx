import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PageLayout, PageMain, HeroFooter, FooterLink } from "../page-layout"

describe("PageLayout", () => {
  it("renders children", () => {
    render(<PageLayout>Content</PageLayout>)
    expect(screen.getByText("Content")).toBeInTheDocument()
  })

  it("defaults to RTL direction", () => {
    const { container } = render(<PageLayout>C</PageLayout>)
    expect(container.firstChild).toHaveAttribute("dir", "rtl")
  })

  it("accepts LTR direction", () => {
    const { container } = render(<PageLayout dir="ltr">C</PageLayout>)
    expect(container.firstChild).toHaveAttribute("dir", "ltr")
  })
})

describe("PageMain", () => {
  it("renders children in main element", () => {
    render(<PageMain>Main content</PageMain>)
    expect(screen.getByRole("main")).toBeInTheDocument()
    expect(screen.getByText("Main content")).toBeInTheDocument()
  })
})

describe("HeroFooter", () => {
  it("renders children in footer", () => {
    render(<HeroFooter>Footer items</HeroFooter>)
    expect(screen.getByText("Footer items")).toBeInTheDocument()
  })
})

describe("FooterLink", () => {
  it("renders link with label", () => {
    render(<FooterLink href="/about" icon={<span>I</span>} label="About" />)
    expect(screen.getByText("About")).toBeInTheDocument()
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/about")
  })
})
