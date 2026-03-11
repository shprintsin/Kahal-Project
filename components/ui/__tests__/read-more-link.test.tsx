import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ReadMoreLink, ViewLink } from "../read-more-link"

describe("ReadMoreLink", () => {
  it("renders default Hebrew text", () => {
    render(<ReadMoreLink href="/posts/1" />)
    expect(screen.getByText("קרא עוד")).toBeInTheDocument()
  })

  it("renders custom children", () => {
    render(<ReadMoreLink href="/x">View details</ReadMoreLink>)
    expect(screen.getByText("View details")).toBeInTheDocument()
  })

  it("links to correct href", () => {
    render(<ReadMoreLink href="/posts/1" />)
    const link = screen.getByText("קרא עוד").closest("a")
    expect(link).toHaveAttribute("href", "/posts/1")
  })
})

describe("ViewLink", () => {
  it("renders children and links", () => {
    render(<ViewLink href="/map/1">View map</ViewLink>)
    const link = screen.getByText("View map").closest("a")
    expect(link).toHaveAttribute("href", "/map/1")
  })

  it("renders custom icon", () => {
    render(
      <ViewLink href="/x" icon={<span data-testid="icon">→</span>}>
        Go
      </ViewLink>
    )
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })
})
