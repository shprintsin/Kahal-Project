import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TagInput } from "../tag-input"

const mockTags = [
  { id: "1", slug: "history", name: "History", nameI18n: { en: "History", he: "היסטוריה" }, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", slug: "demography", name: "Demography", nameI18n: { en: "Demography" }, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", slug: "economy", name: "Economy", nameI18n: { en: "Economy" }, createdAt: new Date(), updatedAt: new Date() },
] as any

describe("TagInput", () => {
  it("renders input field", () => {
    render(
      <TagInput
        tags={mockTags}
        selectedTagIds={[]}
        onTagsChange={() => {}}
        onCreateTag={async () => mockTags[0]}
      />
    )
    expect(screen.getByPlaceholderText(/semicolon/i)).toBeInTheDocument()
  })

  it("shows selected tags as badges", () => {
    render(
      <TagInput
        tags={mockTags}
        selectedTagIds={["1", "2"]}
        onTagsChange={() => {}}
        onCreateTag={async () => mockTags[0]}
      />
    )
    expect(screen.getByText("History")).toBeInTheDocument()
    expect(screen.getByText("Demography")).toBeInTheDocument()
  })

  it("calls onTagsChange when removing a tag", () => {
    const onChange = vi.fn()
    render(
      <TagInput
        tags={mockTags}
        selectedTagIds={["1", "2"]}
        onTagsChange={onChange}
        onCreateTag={async () => mockTags[0]}
      />
    )
    const removeButtons = screen.getAllByRole("button")
    fireEvent.click(removeButtons[0])
    expect(onChange).toHaveBeenCalledWith(["2"])
  })

  it("shows suggestions when typing", () => {
    render(
      <TagInput
        tags={mockTags}
        selectedTagIds={[]}
        onTagsChange={() => {}}
        onCreateTag={async () => mockTags[0]}
      />
    )
    const input = screen.getByPlaceholderText(/semicolon/i)
    fireEvent.change(input, { target: { value: "hist" } })
    expect(screen.getByText("History")).toBeInTheDocument()
  })

  it("does not suggest already selected tags", () => {
    render(
      <TagInput
        tags={mockTags}
        selectedTagIds={["1"]}
        onTagsChange={() => {}}
        onCreateTag={async () => mockTags[0]}
      />
    )
    const input = screen.getByPlaceholderText(/semicolon/i)
    fireEvent.change(input, { target: { value: "hist" } })
    // History is already selected, so suggestions should not contain a second "History" in dropdown
    const historyElements = screen.getAllByText("History")
    expect(historyElements).toHaveLength(1) // Only the badge, not a suggestion
  })
})
