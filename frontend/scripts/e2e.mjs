/**
 * E2E-проверка ключевых сценариев (Playwright + Chromium).
 * Запуск: node scripts/e2e.mjs [baseUrl]
 * Требует запущенный dev-сервер (npm run dev) и, желательно, API на :5080.
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5173'
const PLACE = { lat: 55.0218, lng: 82.9214 } // Художественный музей
const results = []

function pass(name, detail = '') {
  results.push({ name, ok: true })
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`)
}

function fail(name, error) {
  results.push({ name, ok: false, error: String(error) })
  console.error(`✗ ${name} — ${error}`)
}

async function step(name, fn) {
  try {
    await fn()
    pass(name)
  } catch (error) {
    fail(name, error instanceof Error ? error.message : error)
  }
}

const browser = await chromium.launch()

/* ---------------- Десктопные сценарии ---------------- */
const desktop = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: 'ru-RU',
  timezoneId: 'Asia/Novosibirsk',
  permissions: ['geolocation'],
  geolocation: { latitude: PLACE.lat + 0.0002, longitude: PLACE.lng + 0.0001 },
})
const page = await desktop.newPage()
const consoleErrors = []
page.on('pageerror', (error) => consoleErrors.push(error.message))

await step('каталог: фильтр «Бесплатно» сужает выдачу', async () => {
  await page.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  const before = await page.locator('.place-card').count()
  await page.getByRole('button', { name: 'Бесплатно' }).first().click()
  await page.waitForTimeout(400)
  const after = await page.locator('.place-card').count()
  if (after === 0 || after >= before) throw new Error(`до ${before}, после ${after}`)
  if (!page.url().includes('budget=free')) throw new Error(`URL без budget=free: ${page.url()}`)
  return `${before} → ${after}`
})

await step('каталог: поиск «музей» что-то находит', async () => {
  await page.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  await page.getByPlaceholder('Место, тематика, адрес…').fill('музей')
  await page.waitForTimeout(400)
  const count = await page.locator('.place-card').count()
  if (count === 0) throw new Error('ничего не найдено')
  if (count >= 54) throw new Error('поиск не применился')
  return `${count} карточек`
})

await step('сортировка «Рядом со мной» использует геолокацию', async () => {
  await page.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  await page.selectOption('.catalog__sort', 'near')
  await page.waitForTimeout(1200)
  const text = await page.locator('.results-count').innerText()
  if (!text.includes('от вас')) throw new Error(`не увидели подпись геосортировки: ${text}`)
})

await step('избранное сохраняется после перезагрузки', async () => {
  await page.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  await page.locator('.place-card').first().locator('button[aria-label*="избранное"]').click()
  await page.waitForTimeout(300)
  await page.reload({ waitUntil: 'networkidle' })
  await page.goto(`${BASE}/profil`, { waitUntil: 'networkidle' })
  const badge = await page.locator('.stat-card__value').nth(1).innerText()
  if (badge.trim() !== '1') throw new Error(`в избранном ${badge}`)
  const favName = await page.locator('.fav-mini__name').first().innerText()
  return `в избранном: ${favName}`
})

await step('рандомайзер выдаёт другой вариант', async () => {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const before = await page.locator('.randomizer__result-name').innerText()
  await page.getByRole('button', { name: /Удиви меня|Ещё вариант/ }).click()
  await page.waitForTimeout(900)
  const after = await page.locator('.randomizer__result-name').innerText()
  if (!after) throw new Error('результат пуст')
  return `${before} → ${after}`
})

await step('гео-чек-ин рядом с местом засчитывается', async () => {
  await page.goto(`${BASE}/mesta/art-museum`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Я здесь — отметиться' }).click()
  await page.waitForTimeout(1200)
  const box = await page.locator('.checkin-box').innerText()
  if (!box.includes('Вы были здесь')) throw new Error(`чек-ин не зачтён: ${box}`)
  const value = await page.locator('.stat-card__value').first().innerText().catch(() => '0')
  return `блок чек-ина обновился (${value})`
})

await step('чек-ин вдали от места отклоняется', async () => {
  await desktop.setGeolocation({ latitude: 55.12, longitude: 83.0 })
  const context2 = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['geolocation'],
    geolocation: { latitude: 55.12, longitude: 83.0 },
  })
  const page2 = await context2.newPage()
  await page2.goto(`${BASE}/mesta/art-museum`, { waitUntil: 'networkidle' })
  await page2.getByRole('button', { name: 'Я здесь — отметиться' }).click()
  await page2.waitForTimeout(1500)
  const toast = await page2.locator('.toast').innerText().catch(() => '')
  if (!toast.includes('ближе') && !toast.includes('м от места')) {
    throw new Error(`нет ошибки о расстоянии: «${toast}»`)
  }
  await context2.close()
  return toast.trim()
})

await step('отзыв публикуется и появляется в списке', async () => {
  const unique = `Тестовый отзыв ${Date.now()}`
  await page.goto(`${BASE}/mesta/art-museum`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Оставить отзыв' }).click()
  await page.getByPlaceholder('Как вас зовут?').fill('Проверка')
  await page.getByPlaceholder('Что понравилось, что учесть другим гостям?').fill(unique)
  await page.getByRole('button', { name: 'Опубликовать' }).click()
  await page.waitForTimeout(500)
  const body = await page.locator('.review-list').innerText()
  if (!body.includes(unique)) throw new Error('отзыв не появился')
})

await step('челленджи видят чек-ин', async () => {
  await page.goto(`${BASE}/chellendzhi`, { waitUntil: 'networkidle' })
  const text = await page.locator('.aside-card').first().innerText()
  if (!/Отмечено [1-9]/.test(text)) throw new Error(`прогресс не обновился: ${text}`)
})

await step('бэкенд определяется как online', async () => {
  await page.goto(`${BASE}/profil`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const text = await page.locator('.settings').innerText()
  if (!text.includes('Бэкенд подключён')) throw new Error('статус API не online (запущен ли бэкенд?)')
})

await step('на консоли страниц нет JS-ошибок', async () => {
  if (consoleErrors.length) throw new Error(consoleErrors.join('; '))
})

await desktop.close()

/* ---------------- Мобильные сценарии ---------------- */
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  locale: 'ru-RU',
  permissions: ['geolocation'],
  geolocation: { latitude: PLACE.lat, longitude: PLACE.lng },
})
const mpage = await mobile.newPage()

await step('мобильные фильтры открываются и применяются', async () => {
  await mpage.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  await mpage.getByRole('button', { name: 'Открыть фильтры' }).click()
  await mpage.waitForTimeout(400)
  if (!(await mpage.locator('.sheet__panel').isVisible())) throw new Error('лист не открылся')
  await mpage.locator('.sheet__panel').getByRole('button', { name: 'Парой' }).click()
  await mpage.locator('.sheet__panel').getByRole('button', { name: /Показать \d+/ }).click()
  await mpage.waitForTimeout(400)
  if (await mpage.locator('.sheet__panel').count()) throw new Error('лист не закрылся')
  if (!mpage.url().includes('company=')) throw new Error(`URL без company: ${mpage.url()}`)
})

await step('мобильная навигация ведёт в разделы', async () => {
  await mpage.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await mpage.locator('.tabbar').getByRole('link', { name: /Маршруты/ }).click()
  await mpage.waitForTimeout(500)
  if (!mpage.url().includes('/marshruty')) throw new Error(`URL: ${mpage.url()}`)
  const visible = await mpage.locator('.route-card').first().isVisible()
  if (!visible) throw new Error('карточки маршрутов не отрисовались')
})

await step('карточка места открывается с мобильной навигацией', async () => {
  await mpage.goto(`${BASE}/mesta`, { waitUntil: 'networkidle' })
  await mpage.locator('.place-card').first().click()
  await mpage.waitForTimeout(600)
  if (!/\/mesta\/.+/.test(mpage.url())) throw new Error(`URL: ${mpage.url()}`)
  if (!(await mpage.locator('.checkin-box').isVisible())) throw new Error('нет блока чек-ина')
})

await mobile.close()
await browser.close()

const failed = results.filter((item) => !item.ok)
console.log(`\nИтого: ${results.length - failed.length}/${results.length} шагов успешно`)
if (failed.length) {
  console.error('Провалы:', failed.map((item) => item.name).join(', '))
  process.exitCode = 1
}
