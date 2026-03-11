import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { GhostInput, GhostTextarea } from "../ghost-input"

describe("GhostInput", () => {
  it("renders an input element", () => {
    render(<GhostInput placeholder="Type here" />)
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument()
  })

  it("accepts and displays value", () => {
    render(<GhostInput defaultValue="hello" />)
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument()
  })

  it("calls onChange", () => {
    const onChange = vi.fn()
    render(<GhostInput onChange={onChange} />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "new" } })
    expect(onChange).toHaveBeenCalled()
  })

  it("forwards ref", () => {
    const ref = vi.fn()
    render(<GhostInput ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it("applies size classes", () => {
    const { container } = render(<GhostInput inputSize="title" />)
    const input = container.querySelector("input")
    expect(input?.className).toContain("text-4xl")
  })
})

describe("GhostTextarea", () => {
  it("renders a textarea element", () => {
    render(<GhostTextarea placeholder="Write here" />)
    expect(screen.getByPlaceholderText("Write here")).toBeInTheDocument()
  })

  it("accepts rows prop", () => {
    render(<GhostTextarea rows={5} placeholder="text" />)
    const textarea = screen.getByPlaceholderText("text")
    expect(textarea).toHaveAttribute("rows", "5")
  })

  it("forwards ref", () => {
    const ref = vi.fn()
    render(<GhostTextarea ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })
})
