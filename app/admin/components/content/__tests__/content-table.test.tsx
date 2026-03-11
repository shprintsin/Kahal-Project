import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ContentTable } from "../content-table"
import type { ContentTableColumn } from "@/app/admin/types/content-system.types"

interface TestRow {
  id: string
  title: string
  status: string
}

const mockData: TestRow[] = [
  { id: "1", title: "First Post", status: "published" },
  { id: "2", title: "Second Post", status: "draft" },
  { id: "3", title: "Third Post", status: "archived" },
]

const columns: ContentTableColumn<TestRow>[] = [
  { id: "title", header: "Title", accessor: "title" },
  { id: "status", header: "Status", accessor: "status" },
]

describe("ContentTable", () => {
  it("renders column headers", () => {
    render(<ContentTable data={mockData} columns={columns} />)
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Status")).toBeInTheDocument()
  })

  it("renders row data", () => {
    render(<ContentTable data={mockData} columns={columns} />)
    expect(screen.getByText("First Post")).toBeInTheDocument()
    expect(screen.getByText("published")).toBeInTheDocument()
  })

  it("shows empty text when no data", () => {
    render(<ContentTable data={[]} columns={columns} emptyText="Nothing here" />)
    expect(screen.getByText("Nothing here")).toBeInTheDocument()
  })

  it("shows default empty text", () => {
    render(<ContentTable data={[]} columns={columns} />)
    expect(screen.getByText("No content found.")).toBeInTheDocument()
  })

  it("renders selection checkboxes when onSelectionChange provided", () => {
    render(
      <ContentTable
        data={mockData}
        columns={columns}
        selectedRows={[]}
        onSelectionChange={() => {}}
      />
    )
    expect(screen.getAllByRole("checkbox")).toHaveLength(4) // 1 header + 3 rows
  })

  it("does not render checkboxes without onSelectionChange", () => {
    render(<ContentTable data={mockData} columns={columns} />)
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("calls onRowClick when row is clicked", () => {
    const onRowClick = vi.fn()
    render(<ContentTable data={mockData} columns={columns} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText("published"))
    expect(onRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it("renders delete buttons when onRowDelete provided", () => {
    render(
      <ContentTable
        data={mockData}
        columns={columns}
        onRowDelete={() => {}}
      />
    )
    const deleteButtons = screen.getAllByRole("button")
    expect(deleteButtons).toHaveLength(3)
  })

  it("calls onRowDelete with correct id", () => {
    const onRowDelete = vi.fn()
    render(
      <ContentTable
        data={mockData}
        columns={columns}
        onRowDelete={onRowDelete}
      />
    )
    const deleteButtons = screen.getAllByRole("button")
    fireEvent.click(deleteButtons[0])
    expect(onRowDelete).toHaveBeenCalledWith("1")
  })

  it("uses accessor function when provided", () => {
    const fnColumns: ContentTableColumn<TestRow>[] = [
      { id: "computed", header: "Computed", accessor: (row) => `[${row.title}]` },
    ]
    render(<ContentTable data={mockData} columns={fnColumns} />)
    expect(screen.getByText("[First Post]")).toBeInTheDocument()
  })
})
