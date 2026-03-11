import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ContentPageHeader } from "../content-page-header"

describe("ContentPageHeader", () => {
  it("renders title", () => {
    render(<ContentPageHeader title="Posts" />)
    expect(screen.getByText("Posts")).toBeInTheDocument()
  })

  it("renders subtitle", () => {
    render(<ContentPageHeader title="Posts" subtitle="12 posts" />)
    expect(screen.getByText("12 posts")).toBeInTheDocument()
  })

  it("renders search input with placeholder", () => {
    render(
      <ContentPageHeader
        title="T"
        searchPlaceholder="Search posts..."
        onSearchChange={() => {}}
      />
    )
    expect(screen.getByPlaceholderText("Search posts...")).toBeInTheDocument()
  })

  it("calls onSearchChange when typing", () => {
    const onChange = vi.fn()
    render(
      <ContentPageHeader
        title="T"
        searchValue=""
        onSearchChange={onChange}
      />
    )
    const input = screen.getByPlaceholderText("Search...")
    fireEvent.change(input, { target: { value: "test" } })
    expect(onChange).toHaveBeenCalledWith("test")
  })

  it("renders new button when onNewClick is provided", () => {
    const onClick = vi.fn()
    render(
      <ContentPageHeader
        title="T"
        onNewClick={onClick}
        newButtonLabel="New Post"
      />
    )
    const btn = screen.getByText("New Post")
    expect(btn).toBeInTheDocument()
    fireEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it("renders fast edit toggle", () => {
    const onToggle = vi.fn()
    render(
      <ContentPageHeader
        title="T"
        fastEditEnabled={false}
        onFastEditToggle={onToggle}
        showFastEditToggle={true}
      />
    )
    expect(screen.getByText("Fast Edit")).toBeInTheDocument()
  })
})
