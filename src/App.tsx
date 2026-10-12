import { useEffect, useMemo, useState } from 'react'
import { Boom } from './components/Boom.tsx'
import { Footer } from './components/Footer.tsx'
import { TabBar } from './components/TabBar.tsx'
import { GAME_LIST, type GameId } from './data/games.ts'
import { BoxBomb } from './games/BoxBomb.tsx'
import { GameMenu } from './games/GameMenu.tsx'
import { HotPotato } from './games/HotPotato.tsx'
import { KingsCup } from './games/KingsCup.tsx'
import { NeverHaveIEver } from './games/NeverHaveIEver.tsx'
import { NumberBomb } from './games/NumberBomb.tsx'
import { PenaltyWheel } from './games/PenaltyWheel.tsx'
import { drawTruthDare, type TruthDareCard } from './games/questions.ts'
import { TruthOrDare } from './games/TruthOrDare.tsx'
import { WhoIsSpy } from './games/WhoIsSpy.tsx'
import { navigate, useHashRoute } from './lib/router.ts'
import { sound, vibrate } from './lib/sound.ts'
import { PartyContext, type BoomOptions, type Party, type TruthDareType } from './party.ts'
import { SlotMachine } from './slot/SlotMachine.tsx'

const VIEWS = new Set<string>(['slot', 'games', ...GAME_LIST.map((game) => game.id)])

// 跟時間有關的遊戲離開就卸載（停止計時）；其他遊戲切走再回來會保留進度
const UNMOUNT_WHEN_HIDDEN = new Set<GameId>(['wheel', 'hot-potato'])

export default function App() {
  const route = useHashRoute()
  const view = VIEWS.has(route) ? route : 'slot'
  const [autoSpin, setAutoSpin] = useState(0)
  const [truthDare, setTruthDare] = useState<TruthDareCard | null>(null)
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
        setTruthDare(drawTruthDare(type))
        navigate('truth-dare')
      },
      showBoom(options: BoomOptions) {
        setBoom({ ...options, view })
        sound.boom()
        vibrate([300, 80, 300])
      },
    }),
    [view],
  )

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

  function renderGame(id: GameId) {
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
            onDraw={(type) => {
              sound.unlock()
              sound.blip(true)
              setTruthDare(drawTruthDare(type))
            }}
          />
        )
      case 'never':
        return <NeverHaveIEver />
      case 'spy':
        return <WhoIsSpy />
    }
  }

  return (
    <PartyContext value={party}>
      <main className="app">
        <section className="view" data-view="slot" hidden={view !== 'slot'}>
          <SlotMachine active={view === 'slot'} autoSpin={autoSpin} />
        </section>
        <section className="view" data-view="games" hidden={view !== 'games'}>
          <GameMenu />
        </section>
        {GAME_LIST.map(({ id, name }) => {
          const active = view === id
          if (!active && UNMOUNT_WHEN_HIDDEN.has(id)) return null
          return (
            <section key={id} className="view" data-view={id} hidden={!active} aria-label={name}>
              {renderGame(id)}
            </section>
          )
        })}
        <Footer />
      </main>

      <TabBar active={view === 'slot' ? 'slot' : 'games'} />

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
        />
      )}
    </PartyContext>
  )
}
