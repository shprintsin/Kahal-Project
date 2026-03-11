import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FastEditCell } from "../fast-edit-cell"

describe("FastEditCell", () => {
  it("renders text in display mode", () => {
    render(<FastEditCell value="Hello" editMode={false} />)
    expect(screen.getByText("Hello")).toBeInTheDocument()
  })

  it("renders dash for empty value in display mode", () => {
    render(<FastEditCell value="" editMode={false} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })

  it("renders input in edit mode", () => {
    render(<FastEditCell value="test" editMode={true} />)
    const input = screen.getByDisplayValue("test")
    expect(input.tagName).toBe("INPUT")
  })

  it("renders select in edit mode with type select", () => {
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ]
    render(<FastEditCell value="a" editMode={true} type="select" options={options} />)
    expect(screen.getByDisplayValue("Alpha")).toBeInTheDocument()
  })

  it("shows label instead of value for select in display mode", () => {
    const options = [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ]
    render(<FastEditCell value="a" editMode={false} type="select" options={options} />)
    expect(screen.getByText("Alpha")).toBeInTheDocument()
  })

  it("calls onChange on blur when value changed", () => {
    const onChange = vi.fn()
    render(<FastEditCell value="old" editMode={true} onChange={onChange} />)
    const input = screen.getByDisplayValue("old")
    fireEvent.change(input, { target: { value: "new" } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith("new")
  })

  it("does not call onChange on blur when value unchanged", () => {
    const onChange = vi.fn()
    render(<FastEditCell value="same" editMode={true} onChange={onChange} />)
    const input = screen.getByDisplayValue("same")
    fireEvent.blur(input)
    expect(onChange).not.toHaveBeenCalled()
  })

  it("reverts on Escape key", () => {
    render(<FastEditCell value="original" editMode={true} />)
    const input = screen.getByDisplayValue("original")
    fireEvent.change(input, { target: { value: "modified" } })
    fireEvent.keyDown(input, { key: "Escape" })
    expect(input).toHaveValue("original")
  })
})
