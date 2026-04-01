import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  RANKS,
  type ExpeditionSnapshot,
  cardCount,
  emptyExpedition,
  rankIsActive,
  scoreExpedition,
  scoreExpeditionBreakdown,
  toggleRank,
  toggleWagerSlot,
  wagerSlotIsActive,
} from '@/lib/score'

type ExpeditionId = 'orange' | 'green' | 'blue' | 'yellow' | 'purple'

type ExpeditionTheme = {
  id: ExpeditionId
  label: string
  accentClass: string
  activeClass: string
  /** Pill / tab ring when this color is active (mobile) */
  tabRingClass: string
}

const EXPEDITIONS: ExpeditionTheme[] = [
  {
    id: 'orange',
    label: 'Orange',
    accentClass: 'border-orange-500/50 text-orange-300',
    activeClass:
      'bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(234,88,12,0.4)]',
    tabRingClass: 'ring-orange-500/70',
  },
  {
    id: 'green',
    label: 'Green',
    accentClass: 'border-emerald-500/50 text-emerald-300',
    activeClass:
      'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(22,163,74,0.35)]',
    tabRingClass: 'ring-emerald-500/70',
  },
  {
    id: 'blue',
    label: 'Blue',
    accentClass: 'border-sky-500/50 text-sky-300',
    activeClass: 'bg-sky-600 border-sky-400 text-white shadow-[0_0_20px_rgba(2,132,199,0.35)]',
    tabRingClass: 'ring-sky-500/70',
  },
  {
    id: 'yellow',
    label: 'Yellow',
    accentClass: 'border-yellow-400/55 text-yellow-200',
    activeClass:
      'bg-yellow-500 border-yellow-300 text-slate-950 shadow-[0_0_22px_rgba(234,179,8,0.5)]',
    tabRingClass: 'ring-yellow-400/80',
  },
  {
    id: 'purple',
    label: 'Purple',
    accentClass: 'border-violet-500/50 text-violet-300',
    activeClass:
      'bg-violet-600 border-violet-400 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]',
    tabRingClass: 'ring-violet-500/70',
  },
]

function initialBoard(): Record<ExpeditionId, ExpeditionSnapshot> {
  return Object.fromEntries(
    EXPEDITIONS.map((e) => [e.id, emptyExpedition()]),
  ) as Record<ExpeditionId, ExpeditionSnapshot>
}

function ScoreFigure({ value }: { value: number }) {
  const negative = value < 0
  return (
    <span
      className={cn(
        'text-xl font-semibold tabular-nums tracking-tight md:text-2xl',
        negative ? 'text-rose-400' : 'text-emerald-300',
      )}
      aria-label={negative ? `${value} points` : `${value} points`}
    >
      {value > 0 ? `+${value}` : value}
    </span>
  )
}

type ExpeditionPanelProps = {
  exp: ExpeditionTheme
  snap: ExpeditionSnapshot
  onSetSnap: (next: ExpeditionSnapshot) => void
  /** Larger tap targets and spacing on phones */
  compact?: boolean
}

function ExpeditionPanel({ exp, snap, onSetSnap, compact }: ExpeditionPanelProps) {
  const colScore = scoreExpedition(snap)
  const breakdown = scoreExpeditionBreakdown(snap)
  const nCards = cardCount(snap)
  const gap = compact ? 'gap-2' : 'gap-1.5'
  const btnH = compact ? 'min-h-12 py-3 md:min-h-10 md:py-0' : 'h-10'
  const text = compact ? 'text-base md:text-sm' : 'text-sm'

  return (
    <section
      className="flex min-w-0 flex-col rounded-2xl border border-slate-700/80 bg-slate-900/40 p-3 shadow-lg shadow-black/20 backdrop-blur-sm md:p-3"
      aria-label={`${exp.label} expedition`}
    >
      <h2 className="mb-3 border-b border-slate-700/80 pb-2 text-center text-sm font-semibold uppercase tracking-wider text-slate-300 md:mb-3">
        {exp.label}
      </h2>

      <div className={cn('flex flex-1 flex-col', gap)}>
        {([0, 1, 2] as const).map((slot) => {
          const on = wagerSlotIsActive(snap, slot)
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={on}
              onClick={() => onSetSnap(toggleWagerSlot(snap, slot))}
              className={cn(
                btnH,
                'rounded-xl border font-semibold transition active:scale-[0.98] md:rounded-lg',
                text,
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
                'touch-manipulation',
                on
                  ? exp.activeClass
                  : cn('bg-slate-950/40 active:bg-slate-800/80', exp.accentClass),
              )}
            >
              X
            </button>
          )
        })}

        {RANKS.map((rank) => {
          const on = rankIsActive(snap, rank)
          return (
            <button
              key={rank}
              type="button"
              aria-pressed={on}
              onClick={() => onSetSnap(toggleRank(snap, rank))}
              className={cn(
                btnH,
                'rounded-xl border font-semibold transition active:scale-[0.98] md:rounded-lg',
                text,
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400',
                'touch-manipulation',
                on
                  ? exp.activeClass
                  : cn('bg-slate-950/40 active:bg-slate-800/80', exp.accentClass),
              )}
            >
              {rank}
            </button>
          )
        })}
      </div>

      <footer className="mt-4 border-t border-slate-700/80 pt-3 text-center">
        <p className="text-[0.65rem] uppercase tracking-widest text-slate-500">
          Column · {nCards} card{nCards === 1 ? '' : 's'}
        </p>
        <div className="mt-1 flex justify-center">
          <ScoreFigure value={colScore} />
        </div>
        {breakdown.bonus > 0 && (
          <p className="mt-2 text-[0.65rem] text-emerald-400 font-semibold">+{breakdown.bonus} bonus</p>
        )}
      </footer>
    </section>
  )
}

export default function App() {
  const [board, setBoard] = useState(initialBoard)
  const [mobileIndex, setMobileIndex] = useState(0)

  const columnScores = useMemo(
    () =>
      EXPEDITIONS.map((e) => ({
        id: e.id,
        score: scoreExpedition(board[e.id]),
      })),
    [board],
  )

  const total = useMemo(
    () => columnScores.reduce((s, c) => s + c.score, 0),
    [columnScores],
  )

  const setExpedition = (id: ExpeditionId, next: ExpeditionSnapshot) => {
    setBoard((b) => ({ ...b, [id]: next }))
  }

  const activeExp = EXPEDITIONS[mobileIndex]

  const goPrev = () => {
    setMobileIndex((i) => (i <= 0 ? EXPEDITIONS.length - 1 : i - 1))
  }

  const goNext = () => {
    setMobileIndex((i) => (i >= EXPEDITIONS.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="app-shell flex min-h-dvh flex-col">
      <header className="shrink-0 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 md:px-6 md:pb-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
          <div className="min-w-0 text-left">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-500 md:text-xs">
              Reiner Knizia · Kosmos
            </p>
            <h1 className="mt-0.5 text-balance font-semibold text-2xl tracking-tight text-slate-100 md:mt-1 md:text-4xl">
              Lost Cities score calculator
            </h1>
            <p className="mt-2 hidden max-w-2xl text-pretty text-sm leading-relaxed text-slate-400 md:block">
              Toggle the cards you played in each expedition. Investment cards (X) multiply{' '}
              <span className="whitespace-nowrap">(sum − 20) × (1 + wagers)</span>. Eight or
              more cards in a column adds +20 after that. Empty columns score 0.
            </p>
            <details className="mt-2 md:hidden">
              <summary className="cursor-pointer text-sm text-sky-400/90 underline decoration-sky-400/40 underline-offset-2 [&::-webkit-details-marker]:hidden">
                How scoring works
              </summary>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-400">
                Toggle cards for each expedition. Each{' '}
                <strong className="text-slate-300">X</strong> is a wager: column score is{' '}
                <span className="whitespace-nowrap">(sum − 20) × (1 + wagers)</span>. Add{' '}
                <strong className="text-slate-300">+20</strong> if that column has 8+ cards.
                Empty colors score 0.
              </p>
            </details>
          </div>
          <button
            type="button"
            onClick={() => setBoard(initialBoard())}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-600/80 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm transition active:scale-[0.98] hover:border-slate-500 hover:bg-slate-800 md:min-h-0 touch-manipulation"
          >
            <RotateCcw className="size-4 opacity-80" aria-hidden />
            Reset
          </button>
        </div>
      </header>

      {/* Mobile: one expedition + swipe / tabs */}
      <div className="flex min-h-0 flex-1 flex-col px-4 md:hidden">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/60 text-slate-200 touch-manipulation active:bg-slate-800"
            aria-label="Previous expedition"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="scrollbar-pad flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto py-0.5 [-webkit-overflow-scrolling:touch]">
            {EXPEDITIONS.map((e, i) => {
              const on = i === mobileIndex
              const sub = columnScores.find((c) => c.id === e.id)?.score ?? 0
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setMobileIndex(i)}
                  className={cn(
                    'shrink-0 snap-center rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition touch-manipulation',
                    'border border-slate-600/90 bg-slate-900/80 ring-2 ring-transparent',
                    on
                      ? cn('text-white', e.tabRingClass, e.accentClass, 'border-current/40')
                      : 'text-slate-400',
                  )}
                  aria-current={on ? 'true' : undefined}
                >
                  {e.label}
                  <span className="ml-1 tabular-nums opacity-90">
                    ({sub > 0 ? `+${sub}` : sub})
                  </span>
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-800/60 text-slate-200 touch-manipulation active:bg-slate-800"
            aria-label="Next expedition"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
          <ExpeditionPanel
            exp={activeExp}
            snap={board[activeExp.id]}
            onSetSnap={(next) => setExpedition(activeExp.id, next)}
            compact
          />
        </div>
      </div>

      {/* Desktop: five columns */}
      <div className="hidden min-h-0 flex-1 flex-col gap-6 px-4 pb-6 md:flex md:px-6">
        <div className="mx-auto grid min-w-0 max-w-6xl flex-1 grid-cols-5 gap-3">
          {EXPEDITIONS.map((exp) => (
            <ExpeditionPanel
              key={exp.id}
              exp={exp}
              snap={board[exp.id]}
              onSetSnap={(next) => setExpedition(exp.id, next)}
            />
          ))}
        </div>
      </div>

      <footer className="total-bar sticky bottom-0 z-20 border-t border-slate-700/80 bg-slate-950/95 px-4 py-3 text-center shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md md:relative md:border-t-0 md:bg-transparent md:py-4 md:shadow-none">
        <div className="mx-auto max-w-6xl md:rounded-2xl md:border md:border-slate-600/80 md:bg-slate-900/90 md:px-6 md:py-5 md:shadow-xl md:shadow-black/30">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-slate-500 md:text-[0.7rem]">
            Round total
          </p>
          <div className="mt-0.5 flex justify-center md:mt-2">
            <span
              className={cn(
                'font-semibold tabular-nums tracking-tight',
                'text-3xl md:text-5xl',
                total < 0 ? 'text-rose-400' : 'text-slate-50',
              )}
            >
              {total > 0 ? `+${total}` : total}
            </span>
          </div>
          <p className="mt-1 hidden text-center text-xs text-slate-500 md:block">
            Column totals:{' '}
            {columnScores.map((c, i) => (
              <span key={c.id}>
                {i > 0 ? ' · ' : ''}
                {EXPEDITIONS.find((e) => e.id === c.id)?.label}: {c.score > 0 ? `+${c.score}` : c.score}
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  )
}
