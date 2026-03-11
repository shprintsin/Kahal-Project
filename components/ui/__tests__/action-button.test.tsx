import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ActionButton, DownloadButton, CopyButton } from "../action-button"

describe("ActionButton", () => {
  it("renders as a button by default", () => {
    render(<ActionButton>Click</ActionButton>)
    expect(screen.getByText("Click").closest("button")).toBeTruthy()
  })

  it("renders as anchor when href is provided", () => {
    render(<ActionButton href="/test">Link</ActionButton>)
    const link = screen.getByText("Link").closest("a")
    expect(link).toHaveAttribute("href", "/test")
  })

  it("calls onClick handler", () => {
    const onClick = vi.fn()
    render(<ActionButton onClick={onClick}>Click</ActionButton>)
    fireEvent.click(screen.getByText("Click"))
    expect(onClick).toHaveBeenCalled()
  })

  it("renders icon at start position", () => {
    render(<ActionButton icon={<span data-testid="icon">★</span>}>Text</ActionButton>)
    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })
})

describe("DownloadButton", () => {
  it("renders as anchor with target blank", () => {
    render(<DownloadButton href="/file.pdf">Download</DownloadButton>)
    const link = screen.getByText("Download").closest("a")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })
})

describe("CopyButton", () => {
  it("calls onClick when clicked", () => {
    const onClick = vi.fn()
    render(<CopyButton onClick={onClick}>Copy</CopyButton>)
    fireEvent.click(screen.getByText("Copy"))
    expect(onClick).toHaveBeenCalled()
  })
})
