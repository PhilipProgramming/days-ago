import { describe, expect, it } from "vitest"
import { spellCardinal, spellOrdinal, spellYear } from "./words"

describe("spellCardinal", () => {
  it("spells day numbers with hyphens only inside compounds", () => {
    expect(spellCardinal(1)).toBe("one")
    expect(spellCardinal(4)).toBe("four")
    expect(spellCardinal(12)).toBe("twelve")
    expect(spellCardinal(20)).toBe("twenty")
    expect(spellCardinal(24)).toBe("twenty-four")
    expect(spellCardinal(31)).toBe("thirty-one")
  })
})

describe("spellOrdinal", () => {
  it.each([
    [1, "first"],
    [2, "second"],
    [3, "third"],
    [4, "fourth"],
    [11, "eleventh"],
    [12, "twelfth"],
    [13, "thirteenth"],
    [21, "twenty-first"],
    [22, "twenty-second"],
    [23, "twenty-third"],
    [31, "thirty-first"],
  ])("spells %i as %s", (day, words) => {
    expect(spellOrdinal(day)).toBe(words)
  })
})

describe("spellYear", () => {
  it.each([
    [1000, "ten hundred"],
    [1800, "eighteen hundred"],
    [1899, "eighteen ninety-nine"],
    [1900, "nineteen hundred"],
    [1905, "nineteen oh five"],
    [1910, "nineteen ten"],
    [1999, "nineteen ninety-nine"],
    [2000, "two thousand"],
    [2001, "two thousand and one"],
    [2005, "two thousand and five"],
    [2009, "two thousand and nine"],
    [2010, "two thousand ten"],
    [2011, "two thousand eleven"],
    [2012, "two thousand twelve"],
    [2013, "twenty thirteen"],
    [2020, "twenty twenty"],
    [2026, "twenty twenty-six"],
    [2099, "twenty ninety-nine"],
    [2100, "twenty-one hundred"],
    [2101, "twenty-one oh one"],
    [2113, "twenty-one thirteen"],
  ])("spells %i as %s", (year, words) => {
    expect(spellYear(year)).toBe(words)
    expect(words).toBe(words.toLowerCase())
  })
})
