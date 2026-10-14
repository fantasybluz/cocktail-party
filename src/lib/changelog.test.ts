import { describe, expect, it } from 'vitest'
import raw from '../../CHANGELOG.md?raw'
import { parseChangelog, splitBold, UNRELEASED } from './changelog.ts'

describe('更新紀錄', () => {
  it('讀出標題和項目，略過說明文字，縮排的換行接回同一項', () => {
    const text = ['# 更新紀錄', '', '說明', '', '## 未發佈', '', '發版時改標題。', '', '## 1.1.0', '', '- 新增 **A**', '- 修正 B', '  的問題', '', '## 1.0.0', '', '- 第一版'].join('\n')
    expect(parseChangelog(text)).toEqual([
      { version: '未發佈', items: [] },
      { version: '1.1.0', items: ['新增 **A**', '修正 B的問題'] },
      { version: '1.0.0', items: ['第一版'] },
    ])
  })

  it('VERSION 跟 CHANGELOG 最新發佈的一版一致', () => {
    const released = parseChangelog(raw).filter((section) => section.version !== UNRELEASED)
    expect(released[0].version).toBe(__APP_VERSION__)
    expect(released[0].items.length).toBeGreaterThan(0)
  })

  it('每一版的版號都是 x.y.z、由新到舊', () => {
    const versions = parseChangelog(raw)
      .map((section) => section.version)
      .filter((version) => version !== UNRELEASED)
    versions.forEach((version) => expect(version).toMatch(/^\d+\.\d+\.\d+$/))
    const sorted = [...versions].sort((a, b) => {
      const [x, y] = [a, b].map((v) => v.split('.').map(Number))
      return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]
    })
    expect(versions).toEqual(sorted)
  })

  it('粗體拆段', () => {
    expect(splitBold('新增**記分板**和**結算**')).toEqual(['新增', '記分板', '和', '結算', ''])
  })
})
