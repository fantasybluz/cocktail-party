import { shuffle } from '../lib/random.ts'

// 洗牌後輪流發到每一隊，人數差最多一個
export function splitTeams<T>(people: readonly T[], teamCount: number): T[][] {
  const teams: T[][] = Array.from({ length: teamCount }, () => [])
  shuffle(people).forEach((person, i) => teams[i % teamCount].push(person))
  return teams
}
