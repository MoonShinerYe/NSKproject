/**
 * Smoke-скриншоты основных страниц.
 * Запуск: node scripts/screenshots.mjs [baseUrl]
 * Нужен Chrome: npx playwright install chromium
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5173'
const OUT = path.resolve('screenshots')

const PAGES = [
  { name: 'home', url: '/', full: true },
  { name: 'places', url: '/mesta' },
  { name: 'place', url: '/mesta/art-museum' },
  { name: 'collections', url: '/podborki' },
  { name: 'collection', url: '/podborki/nonbanal' },
  { name: 'routes', url: '/marshruty' },
  { name: 'route', url: '/marshruty/center-express' },
  { name: 'challenges', url: '/chellendzhi' },
  { name: 'profile', url: '/profil' },
]

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
]

const errors = []
const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    deviceScaleFactor: viewport.deviceScaleFactor,
    locale: 'ru-RU',
    timezoneId: 'Asia/Novosibirsk',
  })
  const page = await context.newPage()
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`[${viewport.name}] console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`[${viewport.name}] pageerror: ${error.message}`))

  for (const item of PAGES) {
    await page.goto(`${BASE}${item.url}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    const file = path.join(OUT, `${viewport.name}-${item.name}.png`)
    await page.screenshot({ path: file, fullPage: Boolean(item.full) })
    console.log('✓', file)
  }

  // Отдельные крупные блоки главной — для детального просмотра.
  if (viewport.name === 'mobile') {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    for (const [name, selector] of [
      ['home-quick', '.quick'],
      ['home-random', '.randomizer'],
      ['home-collections', '.collections-scroll'],
      ['home-map', '.map-card'],
      ['home-steps', '.steps'],
    ]) {
      const element = page.locator(selector).first()
      if (await element.count()) {
        await element.scrollIntoViewIfNeeded()
        await page.waitForTimeout(350)
        await element.screenshot({ path: path.join(OUT, `mobile-${name}.png`) })
        console.log('✓', `mobile-${name}`)
      }
    }
    await page.goto(`${BASE}/mesta/art-museum`, { waitUntil: 'networkidle' })
    for (const [name, selector] of [
      ['place-reviews', '.reviews'],
      ['place-aside', '.place-aside'],
    ]) {
      const element = page.locator(selector).first()
      if (await element.count()) {
        await element.scrollIntoViewIfNeeded()
        await page.waitForTimeout(350)
        await element.screenshot({ path: path.join(OUT, `mobile-${name}.png`) })
        console.log('✓', `mobile-${name}`)
      }
    }
  }

  await context.close()
}

await browser.close()

if (errors.length) {
  console.error('\nОшибки в консоли страниц:')
  for (const error of errors) console.error(' -', error)
  process.exitCode = 1
} else {
  console.log('\nКонсоль чистая, ошибок нет.')
}
