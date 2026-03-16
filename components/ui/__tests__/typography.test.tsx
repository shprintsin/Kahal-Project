import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  H3,
  HeroTitle,
  HeroSubtitle,
  PageTitle,
  PageSubtitle,
  SectionTitle,
  SectionSubTitle,
  SectionSubtitle,
  CardTitle,
  WidgetTitle,
  StatValue,
  BodyText,
  Excerpt,
  MetaText,
  SmallText,
  Label,
} from "../typography"

describe("Typography components", () => {
  it("HeroTitle renders as h1", () => {
    render(<HeroTitle>Hero</HeroTitle>)
    expect(screen.getByText("Hero").tagName).toBe("H1")
  })

  it("HeroSubtitle renders as p", () => {
    render(<HeroSubtitle>Sub</HeroSubtitle>)
    expect(screen.getByText("Sub").tagName).toBe("P")
  })

  it("PageTitle renders as h1", () => {
    render(<PageTitle>Title</PageTitle>)
    expect(screen.getByText("Title").tagName).toBe("H1")
  })

  it("PageSubtitle renders as p", () => {
    render(<PageSubtitle>Subtitle</PageSubtitle>)
    expect(screen.getByText("Subtitle").tagName).toBe("P")
  })

  it("SectionTitle renders as h2", () => {
    render(<SectionTitle>Section</SectionTitle>)
    expect(screen.getByText("Section").tagName).toBe("H2")
  })

  it("SectionSubTitle renders as h3", () => {
    render(<SectionSubTitle>Sub</SectionSubTitle>)
    expect(screen.getByText("Sub").tagName).toBe("H3")
  })

  it("SectionSubtitle is same as SectionSubTitle", () => {
    expect(SectionSubtitle).toBe(SectionSubTitle)
  })

  it("CardTitle renders as h2", () => {
    render(<CardTitle>Card</CardTitle>)
    expect(screen.getByText("Card").tagName).toBe("H2")
  })

  it("WidgetTitle renders as h3", () => {
    render(<WidgetTitle>Widget</WidgetTitle>)
    expect(screen.getByText("Widget").tagName).toBe("H3")
  })

  it("H3 is alias for WidgetTitle", () => {
    expect(H3).toBe(WidgetTitle)
  })

  it("StatValue renders as span", () => {
    render(<StatValue>42</StatValue>)
    expect(screen.getByText("42").tagName).toBe("SPAN")
  })

  it("BodyText renders as p", () => {
    render(<BodyText>Body</BodyText>)
    expect(screen.getByText("Body").tagName).toBe("P")
  })

  it("Excerpt renders as p", () => {
    render(<Excerpt>Excerpt text</Excerpt>)
    expect(screen.getByText("Excerpt text").tagName).toBe("P")
  })

  it("MetaText renders as span", () => {
    render(<MetaText>Meta</MetaText>)
    expect(screen.getByText("Meta").tagName).toBe("SPAN")
  })

  it("SmallText renders as span", () => {
    render(<SmallText>Small</SmallText>)
    expect(screen.getByText("Small").tagName).toBe("SPAN")
  })

  it("Label renders as span", () => {
    render(<Label>Label</Label>)
    expect(screen.getByText("Label").tagName).toBe("SPAN")
  })

  it("accepts custom className", () => {
    render(<H3 className="extra">Test</H3>)
    expect(screen.getByText("Test")).toHaveClass("extra")
  })
})
