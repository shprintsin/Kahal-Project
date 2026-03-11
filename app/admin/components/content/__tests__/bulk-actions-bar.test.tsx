import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { BulkActionsBar } from "../bulk-actions-bar"

describe("BulkActionsBar", () => {
  it("shows selected count with plural", () => {
    render(<BulkActionsBar selectedCount={5} />)
    expect(screen.getByText("5 items selected")).toBeInTheDocument()
  })

  it("shows singular for 1 item", () => {
    render(<BulkActionsBar selectedCount={1} />)
    expect(screen.getByText("1 item selected")).toBeInTheDocument()
  })

  it("renders delete button when onDelete provided", () => {
    render(<BulkActionsBar selectedCount={2} onDelete={() => {}} />)
    expect(screen.getByText("Delete")).toBeInTheDocument()
  })

  it("calls onDelete when clicked", () => {
    const onDelete = vi.fn()
    render(<BulkActionsBar selectedCount={2} onDelete={onDelete} />)
    fireEvent.click(screen.getByText("Delete"))
    expect(onDelete).toHaveBeenCalled()
  })

  it("renders publish and archive when onStatusChange provided", () => {
    render(<BulkActionsBar selectedCount={2} onStatusChange={() => {}} />)
    expect(screen.getByText("Publish")).toBeInTheDocument()
    expect(screen.getByText("Archive")).toBeInTheDocument()
  })

  it("calls onStatusChange with correct status", () => {
    const onStatusChange = vi.fn()
    render(<BulkActionsBar selectedCount={2} onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText("Publish"))
    expect(onStatusChange).toHaveBeenCalledWith("published")
    fireEvent.click(screen.getByText("Archive"))
    expect(onStatusChange).toHaveBeenCalledWith("archived")
  })

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn()
    render(<BulkActionsBar selectedCount={2} onClose={onClose} />)
    const buttons = screen.getAllByRole("button")
    fireEvent.click(buttons[buttons.length - 1])
    expect(onClose).toHaveBeenCalled()
  })

  it("hides when selectedCount is 0", () => {
    const { container } = render(<BulkActionsBar selectedCount={0} />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain("pointer-events-none")
  })

  it("hides when visible is false", () => {
    const { container } = render(<BulkActionsBar selectedCount={5} visible={false} />)
    const bar = container.firstChild as HTMLElement
    expect(bar.className).toContain("pointer-events-none")
  })
})
