import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FloatingLabelInput } from "../floating-label-input"

describe("FloatingLabelInput", () => {
  it("renders label text", () => {
    render(<FloatingLabelInput label="Email" value="" onChange={() => {}} />)
    expect(screen.getByText("Email")).toBeInTheDocument()
  })

  it("renders input with value", () => {
    render(<FloatingLabelInput label="Name" value="John" onChange={() => {}} />)
    expect(screen.getByDisplayValue("John")).toBeInTheDocument()
  })

  it("calls onChange when typing", () => {
    const onChange = vi.fn()
    render(<FloatingLabelInput label="Name" value="" onChange={onChange} />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "test" } })
    expect(onChange).toHaveBeenCalledWith("test")
  })

  it("shows required asterisk", () => {
    render(<FloatingLabelInput label="Email" value="" onChange={() => {}} required />)
    expect(screen.getByText("*")).toBeInTheDocument()
  })

  it("shows error message", () => {
    render(<FloatingLabelInput label="Email" value="" onChange={() => {}} error="Required field" />)
    expect(screen.getByText("Required field")).toBeInTheDocument()
  })

  it("shows placeholder only when focused or has value", () => {
    const { rerender } = render(
      <FloatingLabelInput label="Name" value="" onChange={() => {}} placeholder="Enter name" />
    )
    const input = screen.getByRole("textbox")
    expect(input).not.toHaveAttribute("placeholder", "Enter name")

    fireEvent.focus(input)
    expect(input).toHaveAttribute("placeholder", "Enter name")
  })
})
