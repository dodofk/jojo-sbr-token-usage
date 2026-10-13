import { expect, test } from 'claude-code/testing'

const BAND = { component: 'AbovePrompt', props: { hasSurvey: false, bodyColumns: 100 } } as const
const CASES = [
  { percent: 10, word: /Lesson 1/ },
  { percent: 30, word: /Lesson 2/ },
  { percent: 60, word: /Lesson 3/ },
  { percent: 80, word: /Lesson 4/ },
  { percent: 95, word: /Lesson 5/ },
  { percent: 100, word: /Lesson 5/ },
] as const

for (const { percent, word } of CASES) {
  test(`at ${percent}% the band reads ${word.source}`, async ($, on) => {
    on('session.usage', () => ({
      value: {
        startedAt: 0,
        rateLimits: [],
        context: { tokens: percent * 2_000, window: 200_000, percent },
      },
    }))
    on('session.start', (_$, e) => e)
    await $.session.start({ source: 'startup', cwd: '/tmp' })

    const band = await $.ui.mount({ plugin: 'jojo-sbr-token-usage', surface: 'terminal', ...BAND })
    expect(await band.find({ type: 'Text', text: word })).toBeDefined()
    expect(await band.find({ type: 'Text', text: new RegExp(`${percent}%$`) })).toBeDefined()
    await band.unmount()
  })
}
