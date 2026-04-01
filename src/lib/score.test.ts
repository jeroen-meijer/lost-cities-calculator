import { describe, expect, it } from 'vitest'

import {
  RANKS,
  type ExpeditionSnapshot,
  type Rank,
  cardCount,
  emptyExpedition,
  scoreExpedition,
  scoreExpeditionBreakdown,
  toggleRank,
  toggleWagerSlot,
  wagerCount,
} from './score'

/**
 * Build a snapshot: first `wagerCount` wager slots (0..2) are on; then listed ranks.
 */
function snapshot(wagerCount: 0 | 1 | 2 | 3, ranks: Rank[]): ExpeditionSnapshot {
  let wagerMask = 0
  for (let i = 0; i < wagerCount; i += 1) {
    wagerMask |= 1 << i
  }
  let rankMask = 0
  for (const r of ranks) {
    const idx = RANKS.indexOf(r)
    if (idx < 0) throw new Error(`Invalid rank: ${r}`)
    rankMask |= 1 << idx
  }
  return { wagerMask, rankMask }
}

describe('scoreExpedition — reference round (UI screenshot, April 2026)', () => {
  it('matches round total +104 when Blue uses two wagers (not three)', () => {
    // Yellow column in screenshot: 2, 5, 9, 10 — no wagers.
    const yellow = snapshot(0, [2, 5, 9, 10])
    expect(scoreExpedition(yellow)).toBe(6)

    // Purple: two X, 2, 4, 5, 9, 10.
    const purple = snapshot(2, [2, 4, 5, 9, 10])
    expect(scoreExpedition(purple)).toBe(30)

    // Blue: screenshot copy said three X; that would be (36−20)×4+20 = 84 with cards
    // 3,4,5,7,8,9. The on-screen +68 matches exactly two wagers + those six numbers
    // (8 cards): (36−20)×3+20 = 68.
    const blueTwoWagers = snapshot(2, [3, 4, 5, 7, 8, 9])
    expect(scoreExpedition(blueTwoWagers)).toBe(68)

    const blueThreeWagers = snapshot(3, [3, 4, 5, 7, 8, 9])
    expect(scoreExpedition(blueThreeWagers)).toBe(84)

    const orange = emptyExpedition()
    const green = emptyExpedition()
    const roundTotal =
      scoreExpedition(orange) +
      scoreExpedition(green) +
      scoreExpedition(blueTwoWagers) +
      scoreExpedition(yellow) +
      scoreExpedition(purple)

    expect(roundTotal).toBe(104)
  })
})

describe('scoreExpedition — empty and minimal', () => {
  it('empty expedition scores 0', () => {
    expect(scoreExpedition(emptyExpedition())).toBe(0)
  })

  it('only wagers: no numbers, multiplier still applies', () => {
    expect(scoreExpedition(snapshot(1, []))).toBe(-40)
    expect(scoreExpedition(snapshot(2, []))).toBe(-60)
    expect(scoreExpedition(snapshot(3, []))).toBe(-80)
  })

  it('single low number, no wagers', () => {
    expect(scoreExpedition(snapshot(0, [2]))).toBe(-18)
  })

  it('break-even at 20 points with no wagers', () => {
    expect(scoreExpedition(snapshot(0, [10]))).toBe(-10)
    expect(scoreExpedition(snapshot(0, [5, 7, 8]))).toBe(0)
  })
})

describe('scoreExpedition — eight-card bonus', () => {
  it('adds +20 only when total cards (wagers + numbers) ≥ 8', () => {
    const sevenCards = snapshot(0, [2, 3, 4, 5, 6, 7, 8])
    expect(cardCount(sevenCards)).toBe(7)
    expect(scoreExpedition(sevenCards)).toBe(2 + 3 + 4 + 5 + 6 + 7 + 8 - 20)

    const eightCards = snapshot(0, [2, 3, 4, 5, 6, 7, 8, 9])
    expect(cardCount(eightCards)).toBe(8)
    const base = 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 - 20
    expect(scoreExpedition(eightCards)).toBe(base + 20)
  })

  it('wagers count toward the 8-card threshold', () => {
    const sixNums = snapshot(2, [2, 3, 4, 5, 6, 7])
    expect(cardCount(sixNums)).toBe(8)
    const sum = 2 + 3 + 4 + 5 + 6 + 7
    expect(scoreExpedition(sixNums)).toBe((sum - 20) * 3 + 20)
  })

  it('seven total cards including wagers does not get the +20', () => {
    const snap = snapshot(2, [2, 3, 4, 5])
    expect(cardCount(snap)).toBe(6)
    expect(scoreExpedition(snap)).toBe((14 - 20) * 3)

    const seven = snapshot(1, [2, 3, 4, 5, 6, 7])
    expect(cardCount(seven)).toBe(7)
    const sum = 2 + 3 + 4 + 5 + 6 + 7
    expect(scoreExpedition(seven)).toBe((sum - 20) * 2)
  })
})

describe('scoreExpedition — full ladder (reference totals)', () => {
  const allRanks = [...RANKS]

  it('all 2–10, no wagers: 9 cards, bonus', () => {
    const sum = allRanks.reduce((a, b) => a + b, 0)
    expect(sum).toBe(54)
    const s = snapshot(0, allRanks)
    expect(scoreExpedition(s)).toBe((sum - 20) * 1 + 20)
    expect(scoreExpedition(s)).toBe(54)
  })

  it('all 2–10 plus three wagers: 12 cards, bonus', () => {
    const sum = allRanks.reduce((a, b) => a + b, 0)
    const s = snapshot(3, allRanks)
    expect(scoreExpedition(s)).toBe((sum - 20) * 4 + 20)
    expect(scoreExpedition(s)).toBe(156)
  })
})

describe('scoreExpeditionBreakdown', () => {
  it('empty expedition breaks down to zeros', () => {
    const breakdown = scoreExpeditionBreakdown(emptyExpedition())
    expect(breakdown).toEqual({ baseScore: 0, bonus: 0, total: 0 })
  })

  it('shows no bonus when cards < 8', () => {
    const sevenCards = snapshot(0, [2, 3, 4, 5, 6, 7, 8])
    const breakdown = scoreExpeditionBreakdown(sevenCards)
    expect(breakdown.bonus).toBe(0)
    expect(breakdown.total).toBe(breakdown.baseScore)
  })

  it('shows +20 bonus when cards >= 8', () => {
    const eightCards = snapshot(0, [2, 3, 4, 5, 6, 7, 8, 9])
    const breakdown = scoreExpeditionBreakdown(eightCards)
    expect(breakdown.bonus).toBe(20)
    expect(breakdown.baseScore).toBe(24)
    expect(breakdown.total).toBe(44)
  })

  it('breakdown total matches scoreExpedition', () => {
    const cases = [
      snapshot(0, [2, 3, 4, 5, 6, 7, 8, 9]),
      snapshot(2, [3, 4, 5, 7, 8, 9]),
      snapshot(1, [2, 3, 4, 5, 6, 7]),
      snapshot(3, [...RANKS]),
    ]
    for (const snap of cases) {
      const breakdown = scoreExpeditionBreakdown(snap)
      expect(breakdown.total).toBe(scoreExpedition(snap))
    }
  })
})

describe('toggle helpers', () => {
  it('toggleWagerSlot toggles bits 0..2', () => {
    let s = emptyExpedition()
    s = toggleWagerSlot(s, 0)
    expect(wagerCount(s)).toBe(1)
    s = toggleWagerSlot(s, 0)
    expect(wagerCount(s)).toBe(0)
    s = toggleWagerSlot(toggleWagerSlot(toggleWagerSlot(s, 0), 1), 2)
    expect(wagerCount(s)).toBe(3)
  })

  it('toggleRank toggles a single rank', () => {
    let s = emptyExpedition()
    s = toggleRank(s, 10)
    expect(scoreExpedition(s)).toBe(-10)
    s = toggleRank(s, 10)
    expect(scoreExpedition(s)).toBe(0)
  })
})
