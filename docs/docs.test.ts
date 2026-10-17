import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { GAME_LIST, TOOL_LIST } from '../src/data/games.ts'

// 文件跟程式碼要一致：加了遊戲、localStorage 的 key，或連結指到不存在的檔案，這裡會失敗

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('文件連結', () => {
  it('相對連結都指得到檔案', () => {
    const files = [
      'README.md',
      'RELEASING.md',
      'CLAUDE.md',
      'CHANGELOG.md',
      ...readdirSync(resolve(root, 'docs'), { recursive: true })
        .map(String)
        .filter((file) => file.endsWith('.md'))
        .map((file) => `docs/${file}`),
    ]
    const broken: string[] = []
    for (const file of files) {
      const text = read(file).replace(/```[\s\S]*?```/g, '')
      for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue
        const path = resolve(dirname(resolve(root, file)), decodeURIComponent(target.split('#')[0]))
        if (!existsSync(path)) broken.push(`${file}: ${target}`)
      }
    }
    expect(broken).toEqual([])
  })
})

describe('README.md', () => {
  it('「喝酒遊戲」的表列出 GAME_LIST 的每一個遊戲', () => {
    const section = read('README.md').split('\n## 喝酒遊戲\n')[1].split('\n## ')[0]
    const rows = [...section.matchAll(/^\| ([^|]+?) \|/gm)].map((m) => m[1]).filter((name) => name !== '遊戲' && !/^-+$/.test(name))
    expect([...rows].sort()).toEqual(GAME_LIST.map((game) => game.name).sort())
  })

  it('提到每一個聚會工具', () => {
    const readme = read('README.md')
    for (const tool of TOOL_LIST) expect(readme, `README.md 沒有提到 ${tool.name}`).toContain(tool.name)
  })
})

describe('docs/architecture.md', () => {
  it('列出程式裡每一個 localStorage 的 key', () => {
    const sources = (readdirSync(resolve(root, 'src'), { recursive: true }) as string[])
      .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.test.ts'))
      .map((file) => read(`src/${file}`))
      .join('\n')
    const keys = [...new Set([...sources.matchAll(/_KEY = '([\w-]+)'/g)].map((m) => m[1]))]
    expect(keys.length).toBeGreaterThan(0)
    const doc = read('docs/architecture.md')
    for (const key of keys) expect(doc, `architecture.md 沒有提到 ${key}`).toContain(`\`${key}\``)
  })
})
