import { describe, it, expect } from "vitest"
import { formatDateHe } from "../date"

describe("formatDateHe", () => {
  it("returns dash for null/undefined", () => {
    expect(formatDateHe(null)).toBe("-")
    expect(formatDateHe(undefined)).toBe("-")
  })

  it("returns dash for invalid date string", () => {
    expect(formatDateHe("not-a-date")).toBe("-")
  })

  it("formats a valid ISO string", () => {
    const result = formatDateHe("2024-01-15T00:00:00Z")
    expect(result).toBeTruthy()
    expect(result).not.toBe("-")
  })

  it("formats a Date object", () => {
    const result = formatDateHe(new Date("2024-06-01T12:00:00Z"))
    expect(result).toBeTruthy()
    expect(result).not.toBe("-")
  })

  it("formats a numeric timestamp", () => {
    const result = formatDateHe(1700000000000)
    expect(result).toBeTruthy()
    expect(result).not.toBe("-")
  })
})
