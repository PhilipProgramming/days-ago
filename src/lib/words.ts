const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const

const ORDINALS = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
] as const

export function spellCardinal(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 99) {
    throw new RangeError(`Cannot spell ${value} as a two-digit cardinal`)
  }

  if (value < 20) {
    return ONES[value]
  }

  const tens = Math.floor(value / 10)
  const ones = value % 10
  if (ones === 0) {
    return TENS[tens]
  }

  return `${TENS[tens]}-${ONES[ones]}`
}

export function spellOrdinal(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    throw new RangeError(`Cannot spell ${value} as a day ordinal`)
  }

  if (value < 20) {
    return ORDINALS[value]
  }

  if (value === 20) {
    return "twentieth"
  }

  if (value === 30) {
    return "thirtieth"
  }

  const tens = Math.floor(value / 10) * 10
  const ones = value % 10
  return `${spellCardinal(tens)}-${ORDINALS[ones]}`
}

export function spellYear(year: number): string {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new RangeError(`Cannot spell year ${year}`)
  }

  if (year === 2000) {
    return "two thousand"
  }

  const high = Math.floor(year / 100)
  const low = year % 100

  if (low === 0) {
    return `${spellCardinal(high)} hundred`
  }

  if (year >= 2001 && year <= 2009) {
    return `two thousand and ${spellCardinal(low)}`
  }

  if (year >= 2010 && year <= 2012) {
    return `two thousand ${spellCardinal(low)}`
  }

  const highWords = spellCardinal(high)
  if (low < 10) {
    return `${highWords} oh ${spellCardinal(low)}`
  }

  return `${highWords} ${spellCardinal(low)}`
}
