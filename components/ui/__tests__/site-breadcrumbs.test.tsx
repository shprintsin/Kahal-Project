import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SiteBreadcrumbs } from "../site-breadcrumbs"

describe("SiteBreadcrumbs", () => {
  it("renders breadcrumb items", () => {
    render(
      <SiteBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Posts", href: "/posts" },
          { label: "Current" },
        ]}
      />
    )
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(screen.getByText("Current")).toBeInTheDocument()
  })

  it("renders links for items with href", () => {
    render(
      <SiteBreadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Current" },
        ]}
      />
    )
    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/")
  })

  it("renders plain text for items without href", () => {
    render(
      <SiteBreadcrumbs
        items={[{ label: "Current" }]}
      />
    )
    const el = screen.getByText("Current")
    expect(el.tagName).toBe("SPAN")
    expect(el.closest("a")).toBeNull()
  })

  it("renders separators between items", () => {
    const { container } = render(
      <SiteBreadcrumbs
        items={[
          { label: "A", href: "/" },
          { label: "B" },
        ]}
      />
    )
    expect(container.textContent).toContain("/")
  })
})
