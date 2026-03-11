import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { InlineField } from "../inline-field"

describe("InlineField", () => {
  it("renders label and value", () => {
    render(<InlineField label="Status" value="Published" />)
    expect(screen.getByText("Status")).toBeInTheDocument()
    expect(screen.getByText("Published")).toBeInTheDocument()
  })

  it("shows placeholder when value is empty", () => {
    render(<InlineField label="Category" value="" placeholder="None" />)
    expect(screen.getByText("None")).toBeInTheDocument()
  })

  it("enters edit mode on click for text type", () => {
    render(<InlineField label="Title" value="My Post" onChange={() => {}} />)
    fireEvent.click(screen.getByText("My Post"))
    expect(screen.getByDisplayValue("My Post")).toBeInTheDocument()
  })

  it("calls onChange on blur after editing", () => {
    const onChange = vi.fn()
    render(<InlineField label="Title" value="Old" onChange={onChange} />)
    fireEvent.click(screen.getByText("Old"))
    const input = screen.getByDisplayValue("Old")
    fireEvent.change(input, { target: { value: "New" } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith("New")
  })

  it("reverts on Escape key", () => {
    render(<InlineField label="Title" value="Original" onChange={() => {}} />)
    fireEvent.click(screen.getByText("Original"))
    const input = screen.getByDisplayValue("Original")
    fireEvent.change(input, { target: { value: "Changed" } })
    fireEvent.keyDown(input, { key: "Escape" })
    expect(screen.getByText("Original")).toBeInTheDocument()
  })

  it("does not enter edit mode when editable is false", () => {
    render(<InlineField label="ID" value="abc-123" editable={false} />)
    fireEvent.click(screen.getByText("abc-123"))
    expect(screen.queryByDisplayValue("abc-123")).not.toBeInTheDocument()
  })

  it("does not enter edit mode for readonly type", () => {
    render(<InlineField label="ID" value="abc" type="readonly" />)
    const button = screen.getByText("abc")
    expect(button).toBeDisabled()
  })
})
