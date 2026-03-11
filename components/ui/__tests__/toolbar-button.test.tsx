import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ToolbarButton, ViewModeToggle } from "../toolbar-button"

describe("ToolbarButton", () => {
  it("renders children", () => {
    render(<ToolbarButton>Click me</ToolbarButton>)
    expect(screen.getByText("Click me")).toBeInTheDocument()
  })

  it("calls onClick when clicked", () => {
    const onClick = vi.fn()
    render(<ToolbarButton onClick={onClick}>Btn</ToolbarButton>)
    fireEvent.click(screen.getByText("Btn"))
    expect(onClick).toHaveBeenCalled()
  })

  it("renders disabled state", () => {
    render(<ToolbarButton disabled>Btn</ToolbarButton>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("applies title attribute", () => {
    render(<ToolbarButton title="Zoom in">+</ToolbarButton>)
    expect(screen.getByTitle("Zoom in")).toBeInTheDocument()
  })
})

describe("ViewModeToggle", () => {
  const options = [
    { value: "grid", icon: "G", title: "Grid view" },
    { value: "list", icon: "L", title: "List view" },
  ]

  it("renders all options", () => {
    render(<ViewModeToggle options={options} activeValue="grid" onChange={() => {}} />)
    expect(screen.getByTitle("Grid view")).toBeInTheDocument()
    expect(screen.getByTitle("List view")).toBeInTheDocument()
  })

  it("calls onChange with option value", () => {
    const onChange = vi.fn()
    render(<ViewModeToggle options={options} activeValue="grid" onChange={onChange} />)
    fireEvent.click(screen.getByTitle("List view"))
    expect(onChange).toHaveBeenCalledWith("list")
  })
})
