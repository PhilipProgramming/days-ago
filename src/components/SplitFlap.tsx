import { useLayoutEffect, useRef } from "react"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import {
  FLAP_BOTTOM_DELAY_MS,
  FLAP_BOTTOM_MS,
  FLAP_TOP_MS,
  cardIndexAt,
  cycleSteps,
  padSlots,
} from "../lib/splitFlap"

const TOP_FRAMES: Keyframe[] = [
  { transform: "rotateX(0deg)", backgroundColor: "#fdfdfd" },
  { transform: "rotateX(-90deg)", backgroundColor: "#e4e4e4" },
]

const BOTTOM_FRAMES: Keyframe[] = [
  { transform: "rotateX(90deg)", backgroundColor: "#e4e4e4" },
  { transform: "rotateX(0deg)", backgroundColor: "#f7f7f7" },
]

const TOP_TIMING: KeyframeAnimationOptions = {
  duration: FLAP_TOP_MS,
  easing: "cubic-bezier(0.4, 0, 0.85, 0.35)",
  fill: "both",
}

const BOTTOM_TIMING: KeyframeAnimationOptions = {
  duration: FLAP_BOTTOM_MS,
  delay: FLAP_BOTTOM_DELAY_MS,
  easing: "cubic-bezier(0.2, 0.65, 0.3, 1)",
  fill: "both",
}

type SplitFlapProps = {
  text: string
  capacity: number
  revision: string
  row?: number
}

type FlapNodes = {
  topFace: HTMLElement
  bottomFace: HTMLElement
  topLeaf: HTMLElement
  bottomLeaf: HTMLElement
  topLeafGlyph: HTMLElement
  bottomLeafGlyph: HTMLElement
}

function sameSlots(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((glyph, index) => glyph === right[index])
}

function readCells(row: HTMLElement): FlapNodes[] {
  return [...row.querySelectorAll<HTMLElement>(".flap-cell")].map((cell) => {
    const glyphs = cell.querySelectorAll<HTMLElement>(".flap-glyph")
    const leaves = cell.querySelectorAll<HTMLElement>(".flap-leaf")
    return {
      topFace: glyphs[0],
      bottomFace: glyphs[1],
      topLeafGlyph: glyphs[2],
      bottomLeafGlyph: glyphs[3],
      topLeaf: leaves[0],
      bottomLeaf: leaves[1],
    }
  })
}

function settleCell(cell: FlapNodes, glyph: string) {
  cell.topFace.textContent = glyph
  cell.bottomFace.textContent = glyph
  cell.topLeaf.classList.remove("is-flipping")
  cell.bottomLeaf.classList.remove("is-flipping")
  for (const animation of cell.topLeaf.getAnimations()) {
    animation.cancel()
  }
  for (const animation of cell.bottomLeaf.getAnimations()) {
    animation.cancel()
  }
}

function playCard(cell: FlapNodes, from: string, to: string, running: Animation[]) {
  for (const animation of running) {
    animation.cancel()
  }
  cell.topFace.textContent = to
  cell.bottomFace.textContent = from
  cell.topLeafGlyph.textContent = from
  cell.bottomLeafGlyph.textContent = to
  cell.topLeaf.classList.add("is-flipping")
  cell.bottomLeaf.classList.add("is-flipping")
  running[0] = cell.topLeaf.animate(TOP_FRAMES, TOP_TIMING)
  running[1] = cell.bottomLeaf.animate(BOTTOM_FRAMES, BOTTOM_TIMING)
}

function FlapCell() {
  return (
    <span className="flap-cell">
      <span className="flap-face flap-face-top">
        <span className="flap-glyph" />
      </span>
      <span className="flap-face flap-face-bottom">
        <span className="flap-glyph flap-glyph-lower" />
      </span>
      <span className="flap-leaf flap-leaf-top">
        <span className="flap-glyph" />
      </span>
      <span className="flap-leaf flap-leaf-bottom">
        <span className="flap-glyph flap-glyph-lower" />
      </span>
      <span className="flap-seam" />
    </span>
  )
}

export function SplitFlap({ text, capacity, revision, row = 0 }: SplitFlapProps) {
  const reduced = usePrefersReducedMotion()
  const rowRef = useRef<HTMLSpanElement>(null)
  const shownRef = useRef(padSlots(text, capacity))
  const revisionRef = useRef(revision)
  const frameRef = useRef(0)
  const generation = useRef(0)

  useLayoutEffect(() => {
    const rowElement = rowRef.current
    if (!rowElement) {
      return
    }

    const id = ++generation.current
    const revisionChanged = revisionRef.current !== revision
    revisionRef.current = revision
    cancelAnimationFrame(frameRef.current)
    const cells = readCells(rowElement)
    const target = padSlots(text, capacity)
    const source = shownRef.current.length === capacity ? shownRef.current.slice() : padSlots("", capacity)

    const paint = (glyphs: string[]) => {
      cells.forEach((cell, index) => settleCell(cell, glyphs[index] ?? ""))
    }

    if (reduced || (!revisionChanged && sameSlots(source, target))) {
      shownRef.current = target
      paint(target)
      return
    }

    const sequences = source.map((glyph, index) => cycleSteps(glyph, target[index] ?? "", index))
    const cardIndexes = source.map(() => -1)
    const running = source.map(() => [] as Animation[])
    const origin = performance.now()
    let elapsed = 0
    let lastNow = origin
    let active = true

    const tick = (now: number) => {
      if (!active || generation.current !== id) {
        return
      }

      const delta = Math.min(48, Math.max(0, now - lastNow))
      lastNow = Math.max(lastNow, now)
      elapsed += delta

      let pending = false

      for (let index = 0; index < sequences.length; index += 1) {
        const steps = sequences[index]
        const card = cardIndexAt(elapsed, row, index)

        if (card === null) {
          pending = true
          continue
        }

        if (card >= steps.length) {
          if (cardIndexes[index] !== steps.length) {
            const glyph = steps[steps.length - 1] ?? ""
            shownRef.current[index] = glyph
            settleCell(cells[index], glyph)
            cardIndexes[index] = steps.length
          }
          continue
        }

        pending = true
        if (card === cardIndexes[index]) {
          continue
        }

        if (card > 0) {
          shownRef.current[index] = steps[card - 1] ?? source[index]
        }

        const from = card === 0 ? source[index] : (steps[card - 1] ?? source[index])
        const to = steps[card] ?? ""
        playCard(cells[index], from, to, running[index])
        cardIndexes[index] = card
      }

      if (pending) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    tick(origin)

    return () => {
      active = false
      cancelAnimationFrame(frameRef.current)
      for (const animations of running) {
        for (const animation of animations) {
          animation.cancel()
        }
      }
      paint(shownRef.current)
    }
  }, [capacity, reduced, revision, row, text])

  return (
    <span className="flap-row" ref={rowRef} aria-hidden="true">
      {Array.from({ length: capacity }, (_, index) => (
        <FlapCell key={index} />
      ))}
    </span>
  )
}
