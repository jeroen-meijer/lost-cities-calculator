/** Official Lost Cities scoring per expedition (Kosmos / Rio Grande rules). */

export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export type Rank = (typeof RANKS)[number]

export type ExpeditionSnapshot = {
  wagerMask: number
  /** Bit i (0..8) set if rank RANKS[i] is played. */
  rankMask: number
}

export function wagerCount(snapshot: ExpeditionSnapshot): number {
  let n = 0
  for (let i = 0; i < 3; i += 1) {
    if (snapshot.wagerMask & (1 << i)) n += 1
  }
  return n
}

export function activeRanks(snapshot: ExpeditionSnapshot): Rank[] {
  const out: Rank[] = []
  for (let i = 0; i < RANKS.length; i += 1) {
    if (snapshot.rankMask & (1 << i)) out.push(RANKS[i])
  }
  return out
}

export function cardCount(snapshot: ExpeditionSnapshot): number {
  return wagerCount(snapshot) + activeRanks(snapshot).length
}

/** Sum of numbered cards only (wagers do not add to the sum). */
export function numberedSum(snapshot: ExpeditionSnapshot): number {
  return activeRanks(snapshot).reduce((a, b) => a + b, 0)
}

/**
 * Empty expedition scores 0.
 * Otherwise: (sum_of_numbers − 20) × (1 + wager_count), then +20 if 8+ cards total.
 */
export function scoreExpedition(snapshot: ExpeditionSnapshot): number {
  const n = cardCount(snapshot)
  if (n === 0) return 0
  const w = wagerCount(snapshot)
  const sum = numberedSum(snapshot)
  let points = (sum - 20) * (1 + w)
  if (n >= 8) points += 20
  return points
}

/**
 * Returns the base score (without 8-card bonus) and bonus amount separately.
 * Useful for displaying the bonus breakdown in UI.
 */
export function scoreExpeditionBreakdown(snapshot: ExpeditionSnapshot): {
  baseScore: number
  bonus: number
  total: number
} {
  const n = cardCount(snapshot)
  if (n === 0) return { baseScore: 0, bonus: 0, total: 0 }
  const w = wagerCount(snapshot)
  const sum = numberedSum(snapshot)
  const baseScore = (sum - 20) * (1 + w)
  const bonus = n >= 8 ? 20 : 0
  return { baseScore, bonus, total: baseScore + bonus }
}

export function emptyExpedition(): ExpeditionSnapshot {
  return { wagerMask: 0, rankMask: 0 }
}

export function toggleWagerSlot(
  snapshot: ExpeditionSnapshot,
  slot: 0 | 1 | 2,
): ExpeditionSnapshot {
  const bit = 1 << slot
  return {
    ...snapshot,
    wagerMask: snapshot.wagerMask ^ bit,
  }
}

export function toggleRank(
  snapshot: ExpeditionSnapshot,
  rank: Rank,
): ExpeditionSnapshot {
  const idx = RANKS.indexOf(rank)
  if (idx < 0) return snapshot
  const bit = 1 << idx
  return {
    ...snapshot,
    rankMask: snapshot.rankMask ^ bit,
  }
}

export function rankIsActive(snapshot: ExpeditionSnapshot, rank: Rank): boolean {
  const idx = RANKS.indexOf(rank)
  if (idx < 0) return false
  return Boolean(snapshot.rankMask & (1 << idx))
}

export function wagerSlotIsActive(
  snapshot: ExpeditionSnapshot,
  slot: 0 | 1 | 2,
): boolean {
  return Boolean(snapshot.wagerMask & (1 << slot))
}
