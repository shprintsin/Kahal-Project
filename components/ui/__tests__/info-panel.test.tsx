import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { InfoPanel, DownloadLink, ExternalLinkItem, VersionBadge } from "../info-panel"

describe("InfoPanel", () => {
  it("renders title", () => {
    render(<InfoPanel title="Details">Content</InfoPanel>)
    expect(screen.getByText("Details")).toBeInTheDocument()
  })

  it("renders children", () => {
    render(<InfoPanel title="T">Child content</InfoPanel>)
    expect(screen.getByText("Child content")).toBeInTheDocument()
  })
})

describe("DownloadLink", () => {
  it("renders download link with name", () => {
    render(<DownloadLink href="/file.zip" name="Data File" />)
    const link = screen.getByText("Data File").closest("a")
    expect(link).toHaveAttribute("href", "/file.zip")
    expect(link).toHaveAttribute("download")
  })

  it("shows format when provided", () => {
    render(<DownloadLink href="/f" name="File" format="GeoJSON" />)
    expect(screen.getByText("GeoJSON")).toBeInTheDocument()
  })
})

describe("ExternalLinkItem", () => {
  it("renders external link", () => {
    render(<ExternalLinkItem href="https://example.com" title="Source" />)
    const link = screen.getByText("Source").closest("a")
    expect(link).toHaveAttribute("href", "https://example.com")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })
})

describe("VersionBadge", () => {
  it("renders version string", () => {
    render(<VersionBadge version="1.2.3" />)
    expect(screen.getByText("1.2.3")).toBeInTheDocument()
    expect(screen.getByText("גרסה")).toBeInTheDocument()
  })
})
