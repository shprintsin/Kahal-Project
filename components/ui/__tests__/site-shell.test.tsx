import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteShell, SiteMain } from "../site-shell"

vi.mock("@/app/components/layout/header/Header", () => ({
  default: ({ navigation }: any) => (
    <header data-testid="header">
      {navigation.map((n: any) => (
        <span key={n.label}>{n.label}</span>
      ))}
    </header>
  ),
}))

vi.mock("@/components/ui/site-footer", () => ({
  SiteFooter: ({ columns, copyrightText }: any) => (
    <footer data-testid="footer">
      <span>{copyrightText}</span>
      {columns?.map((c: any) => <span key={c.id}>{c.title?.default}</span>)}
    </footer>
  ),
}))

describe("SiteShell", () => {
  const nav = [{ label: "Home", href: "/", icon: null }]

  it("renders header with navigation", () => {
    render(<SiteShell navigation={nav}>Content</SiteShell>)
    expect(screen.getByTestId("header")).toBeInTheDocument()
    expect(screen.getByText("Home")).toBeInTheDocument()
  })

  it("renders children", () => {
    render(<SiteShell navigation={nav}>Page Content</SiteShell>)
    expect(screen.getByText("Page Content")).toBeInTheDocument()
  })

  it("renders footer", () => {
    render(<SiteShell navigation={nav}>C</SiteShell>)
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("does not set dir on shell div (direction managed by html element)", () => {
    const { container } = render(<SiteShell navigation={nav}>C</SiteShell>)
    expect(container.firstChild).not.toHaveAttribute("dir")
  })

  it("passes footer data", () => {
    const cols = [{ id: "1", type: "LINK_LIST" as const, title: { default: "Links", translations: {} }, items: [], order: 0 }]
    render(
      <SiteShell navigation={nav} footerColumns={cols} copyrightText="© Test">
        C
      </SiteShell>
    )
    expect(screen.getByText("© Test")).toBeInTheDocument()
    expect(screen.getByText("Links")).toBeInTheDocument()
  })
})

describe("SiteMain", () => {
  it("renders children in main element", () => {
    const { container } = render(<SiteMain>Content here</SiteMain>)
    expect(container.querySelector("main")).toBeInTheDocument()
    expect(screen.getByText("Content here")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(<SiteMain className="extra">C</SiteMain>)
    expect(container.querySelector("main")).toHaveClass("extra")
  })
})
