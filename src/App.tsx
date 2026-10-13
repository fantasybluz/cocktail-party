import { useEffect, useMemo, useState } from 'react'
import { Boom } from './components/Boom.tsx'
import { DrinkPicker } from './components/DrinkPicker.tsx'
import { Footer } from './components/Footer.tsx'
import { TabBar } from './components/TabBar.tsx'
import { GAME_LIST, TOOL_LIST, type GameId, type ToolId } from './data/games.ts'
import { BoxBomb } from './games/BoxBomb.tsx'
import { DrawGuess } from './games/DrawGuess.tsx'
import { DrinkingBoard } from './games/DrinkingBoard.tsx'
import { FateFinger } from './games/FateFinger.tsx'
import { GameMenu } from './games/GameMenu.tsx'
import { HeadsUp } from './games/HeadsUp.tsx'
import { HighLow } from './games/HighLow.tsx'
import { HotPotato } from './games/HotPotato.tsx'
import { KingsCup } from './games/KingsCup.tsx'
import { LiarsDice } from './games/LiarsDice.tsx'
import { MostLikely } from './games/MostLikely.tsx'
import { NeverHaveIEver } from './games/NeverHaveIEver.tsx'
import { NumberBomb } from './games/NumberBomb.tsx'
import { PenaltyWheel } from './games/PenaltyWheel.tsx'
import { drawTruthDare, type TruthDareCard } from './games/questions.ts'
import { TruthOrDare } from './games/TruthOrDare.tsx'
import { TwoTruths } from './games/TwoTruths.tsx'
import { WhoIsSpy } from './games/WhoIsSpy.tsx'
import { navigate, useHashRoute } from './lib/router.ts'
import { sound, vibrate } from './lib/sound.ts'
import { readStore, writeStore } from './lib/storage.ts'
import {
  PartyContext,
  type BoomOptions,
  type DrinkMeta,
  type LogEntry,
  type Party,
  type Player,
  type RecordOptions,
  type TruthDareType,
} from './party.ts'
import { HomeGuide } from './slot/HomeGuide.tsx'
import { SlotMachine } from './slot/SlotMachine.tsx'
import { PartySummary } from './tools/PartySummary.tsx'
import { Scoreboard } from './tools/Scoreboard.tsx'
import { Teams } from './tools/Teams.tsx'

type PageId = GameId | ToolId

const PAGES: { id: PageId; name: string }[] = [...GAME_LIST, ...TOOL_LIST]
const VIEWS = new Set<string>(['slot', 'guide', 'games', ...PAGES.map((page) => page.id)])

// 跟時間、手指有關的遊戲離開就卸載（停止計時）；其他遊戲切走再回來會保留進度
const UNMOUNT_WHEN_HIDDEN = new Set<PageId>(['wheel', 'hot-potato', 'fate-finger', 'heads-up', 'draw-guess', 'teams'])

const ROSTER_KEY = 'mix-slot-roster'
const LOG_KEY = 'mix-slot-log'
const ADULT_KEY = 'mix-slot-adult'

// 記一杯時預設記成「在哪一頁」
const PAGE_NAMES: Record<string, string> = {
  slot: '調酒拉霸機',
  guide: '在家玩指南',
  games: '喝酒遊戲',
  ...Object.fromEntries(PAGES.map((page) => [page.id, page.name])),
}

function loadRoster(): Player[] {
  const saved = readStore<unknown>(ROSTER_KEY, [])
  if (!Array.isArray(saved)) return []
  return saved
    .filter((p): p is Player => typeof p?.name === 'string' && typeof p?.drinks === 'number')
    .map((p) => ({ name: p.name, drinks: p.drinks, water: typeof p.water === 'number' ? p.water : 0 }))
}

function loadLog(): LogEntry[] {
  const saved = readStore<unknown>(LOG_KEY, [])
  if (!Array.isArray(saved)) return []
  return saved.filter(
    (e): e is LogEntry => typeof e?.name === 'string' && typeof e?.at === 'number' && typeof e?.kind === 'string',
  )
}

// 刪掉某個人最後一筆喝酒紀錄（復原、記分板 -1 用）
function removeLastDrink(log: LogEntry[], name: string): LogEntry[] {
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].name === name && log[i].kind !== 'water') return [...log.slice(0, i), ...log.slice(i + 1)]
  }
  return log
}

export default function App() {
  const route = useHashRoute()
  const view = VIEWS.has(route) ? route : 'slot'
  const [autoSpin, setAutoSpin] = useState(0)
  const [truthDare, setTruthDare] = useState<TruthDareCard | null>(null)
  const [roster, setRoster] = useState(loadRoster)
  const [log, setLog] = useState(loadLog)
  const [adult, setAdultState] = useState(() => readStore<boolean>(ADULT_KEY, false) === true)
  const [picking, setPicking] = useState<RecordOptions | null>(null)
  // 記下爆炸發生在哪一頁，換頁（包含按上一頁）就不再顯示
  const [boom, setBoom] = useState<(BoomOptions & { view: string }) | null>(null)
  const activeBoom = boom?.view === view ? boom : null

  const party = useMemo<Party>(
    () => ({
      loserSpin() {
        setAutoSpin((n) => n + 1)
        navigate('slot')
      },
      openTruthDare(type: TruthDareType) {
        setTruthDare(drawTruthDare(type, adult))
        navigate('truth-dare')
      },
      showBoom(options: BoomOptions) {
        setBoom({ ...options, view })
        sound.boom()
        vibrate([300, 80, 300])
      },
      roster,
      updateRoster(update) {
        setRoster(update)
      },
      changeDrinks(names: string[], delta: number, meta: DrinkMeta) {
        const at = Date.now()
        setRoster((list) =>
          list.map((player) => {
            if (!names.includes(player.name)) return player
            const drinks = Math.max(0, player.drinks + delta)
            return { ...player, drinks, water: Math.min(player.water, drinks) }
          }),
        )
        setLog((prev) =>
          delta > 0
            ? [...prev, ...names.map((name) => ({ name, at, ...meta }))]
            : names.reduce((acc, name) => removeLastDrink(acc, name), prev),
        )
      },
      logWater(name: string) {
        const at = Date.now()
        setRoster((list) => list.map((player) => (player.name === name ? { ...player, water: player.drinks } : player)))
        setLog((prev) => [...prev, { name, at, game: '記分板', kind: 'water' }])
      },
      log,
      resetParty(clearPlayers = false) {
        setRoster((list) => (clearPlayers ? [] : list.map((player) => ({ ...player, drinks: 0, water: 0 }))))
        setLog([])
      },
      recordDrink(options: RecordOptions = {}) {
        sound.unlock()
        setPicking({ game: PAGE_NAMES[view], ...options })
      },
      pageName: PAGE_NAMES[view],
      adult,
      setAdult(value: boolean) {
        setAdultState(value)
        writeStore(ADULT_KEY, value)
      },
    }),
    [view, roster, adult, log],
  )

  // 記分板名單和派對紀錄存在這支手機
  useEffect(() => {
    writeStore(ROSTER_KEY, roster)
  }, [roster])

  useEffect(() => {
    writeStore(LOG_KEY, log)
  }, [log])

  // 換頁時捲回最上面
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  // 爆炸時整個畫面抖一下
  useEffect(() => {
    if (!activeBoom) return
    const { body } = document
    body.classList.remove('is-shaking')
    void body.offsetWidth // 重新觸發動畫
    body.classList.add('is-shaking')
  }, [activeBoom])

  function renderPage(id: PageId) {
    switch (id) {
      case 'wheel':
        return <PenaltyWheel />
      case 'number-bomb':
        return <NumberBomb />
      case 'box-bomb':
        return <BoxBomb />
      case 'hot-potato':
        return <HotPotato />
      case 'kings-cup':
        return <KingsCup />
      case 'truth-dare':
        return (
          <TruthOrDare
            card={truthDare}
            adult={adult}
            onDraw={(type) => {
              sound.unlock()
              sound.blip(true)
              setTruthDare(drawTruthDare(type, adult))
            }}
          />
        )
      case 'never':
        return <NeverHaveIEver />
      case 'spy':
        return <WhoIsSpy />
      case 'fate-finger':
        return <FateFinger />
      case 'heads-up':
        return <HeadsUp />
      case 'draw-guess':
        return <DrawGuess />
      case 'liars-dice':
        return <LiarsDice />
      case 'high-low':
        return <HighLow />
      case 'board':
        return <DrinkingBoard />
      case 'most-likely':
        return <MostLikely />
      case 'two-truths':
        return <TwoTruths />
      case 'scoreboard':
        return <Scoreboard />
      case 'teams':
        return <Teams />
      case 'summary':
        return <PartySummary />
    }
  }

  return (
    <PartyContext value={party}>
      <main className="app">
        <section className="view" data-view="slot" hidden={view !== 'slot'}>
          <SlotMachine active={view === 'slot'} autoSpin={autoSpin} />
        </section>
        {view === 'guide' && (
          <section className="view" data-view="guide" aria-label="在家玩指南">
            <HomeGuide />
          </section>
        )}
        <section className="view" data-view="games" hidden={view !== 'games'}>
          <GameMenu />
        </section>
        {PAGES.map(({ id, name }) => {
          const active = view === id
          if (!active && UNMOUNT_WHEN_HIDDEN.has(id)) return null
          return (
            <section key={id} className="view" data-view={id} hidden={!active} aria-label={name}>
              {renderPage(id)}
            </section>
          )
        })}
        <Footer />
      </main>

      <TabBar active={view === 'slot' || view === 'guide' ? 'slot' : 'games'} />

      {activeBoom && (
        <Boom
          text={activeBoom.text}
          onAgain={() => {
            setBoom(null)
            activeBoom.onAgain()
          }}
          onLoser={() => {
            setBoom(null)
            party.loserSpin()
          }}
          onRecord={() => setPicking({ title: '誰喝一杯？', reason: activeBoom.text, kind: 'boom', game: PAGE_NAMES[view] })}
        />
      )}

      {picking && (
        <DrinkPicker
          roster={roster}
          title={picking.title}
          reason={picking.reason}
          onChange={(names, delta) =>
            party.changeDrinks(names, delta, { game: picking.game ?? PAGE_NAMES[view], kind: picking.kind ?? 'other' })
          }
          onAddPlayer={(name) => setRoster((list) => [...list, { name, drinks: 0, water: 0 }])}
          onClose={() => {
            setPicking(null)
            picking.onDone?.()
          }}
        />
      )}
    </PartyContext>
  )
}
