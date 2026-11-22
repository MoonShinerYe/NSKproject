# Подробный гайд по проекту «Вокруг НСК»

Документ для того, кто продолжает проект сам: что где лежит, откуда берутся данные, как менять
иконки, стили, тексты, добавлять места и страницы, как всё проверять и деплоить.

Если что-то не сходится с кодом — ориентируйся на код: он здесь главный источник правды.

---

## 1. Как устроен проект

```
                 frontend/src/data/seed.json  ← ЕДИНЫЙ источник контента
                         │                    │
        импорт в бандл   │                    │  копируется при сборке (csproj)
                         ▼                    ▼
        React SPA (Vite)  ──── /api/* ───►  ASP.NET Core API (опционально)
        localStorage                              in-memory чек-ины и отзывы
                         │
                         ▼
              GitHub Pages (статика)  ·  браузер посетителя
```

- **Фронтенд** — React 19 + TypeScript + Vite. Один SPA, маршруты через React Router.
- **Данные** — статический JSON `frontend/src/data/seed.json`. Он попадает прямо в JS-бандл,
  поэтому сайт полностью работает без сервера и офлайн.
- **Бэкенд** — ASP.NET Core Minimal API (.NET 11). Нужен для «живой» проверки чек-инов на сервере,
  отзывов и API-фильтров. Без него сайт не ломается: фронт переходит в локальный режим.
- **Пользовательские данные** (избранное, чек-ины, отзывы, имя, демо-режим) — в `localStorage`.
- **PWA** — service worker кэширует оболочку и бандлы, чтобы сайт открывался офлайн.

---

## 2. Быстрый старт

Нужны Node.js 20+ и (по желанию) .NET SDK 11.

```bash
# сайт
cd ~/NSKproject/frontend
npm install          # уже сделано, но можно повторить
npm run dev          # http://localhost:5173, печатает и Network-адрес для телефона
```

```bash
# API (второй терминал)
cd ~/NSKproject/backend/Nsk.Api
dotnet run           # http://localhost:5080
```

Vite проксирует `/api` на `localhost:5080` (см. `frontend/vite.config.ts`). Если API не запущен,
в подвале сайта будет «локальный режим».

Полезные команды:

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Dev-сервер, доступен по Wi-Fi (`--host`) |
| `npm run build` | Проверка типов + продакшен-сборка в `frontend/dist` |
| `npm run preview` | Предпросмотр собранного сайта на `:4173` |
| `npm run typecheck` | Только TypeScript |
| `npm run lint` | oxlint (предупреждения допустимы) |
| `npm run validate:data` | Проверка `seed.json` |
| `npm run e2e` | 14 сценариев в браузере |
| `npm run screenshots` | Обновить скриншоты в `frontend/screenshots` |

---

## 3. Карта проекта

```
NSKproject/
├── README.md                     # витрина проекта, запуск, деплой
├── docs/
│   ├── GUIDE.md                  # этот файл
│   └── screenshots/              # картинки для README
├── netlify.toml                  # деплой на Netlify
├── vercel.json                   # деплой на Vercel
├── .github/workflows/
│   └── deploy-pages.yml          # автодеплой на GitHub Pages
├── frontend/
│   ├── index.html                # <head>: мета-теги, шрифты, точка входа
│   ├── vite.config.ts            # base, прокси /api, порты, allowedHosts
│   ├── public/
│   │   ├── favicon.svg           # иконка вкладки
│   │   ├── manifest.webmanifest  # PWA-манифест
│   │   ├── sw.js                 # service worker (офлайн)
│   │   └── icons/                # PWA-иконки: svg + png 192/512
│   ├── scripts/
│   │   ├── e2e.mjs               # браузерные тесты
│   │   ├── screenshots.mjs       # снимки страниц
│   │   └── validate-seed.mjs     # валидатор данных
│   └── src/
│       ├── main.tsx              # корень: Router (basename), Store, регистрация SW
│       ├── App.tsx               # все маршруты
│       ├── types.ts              # типы Place, Collection, Route, Challenge, Filters
│       ├── icons.tsx             # ВСЕ UI-иконки (SVG)
│       ├── config.ts             # название, соцсети, партнёры, радиус чек-ина
│       ├── data/
│       │   ├── seed.json         # ВСЕ места/подборки/маршруты/челленджи
│       │   └── index.ts          # чтение сида, хелперы (stats, relatedPlaces…)
│       ├── lib/
│       │   ├── filters.ts        # категории, опции фильтров, фильтрация/сортировка
│       │   ├── geo.ts            # haversine, форматирование, геолокация
│       │   ├── store.tsx         # localStorage-состояние и тосты
│       │   ├── api.ts            # клиент /api, deviceId
│       │   └── game.ts           # достижения, прогресс челленджей, промокоды
│       ├── components/
│       │   ├── Layout.tsx        # шапка, нижняя навигация, подвал, тосты
│       │   ├── Cover.tsx         # генеративные обложки (SVG)
│       │   ├── PlaceCard.tsx     # карточка места
│       │   ├── CollectionCard.tsx
│       │   ├── Randomizer.tsx    # рандомайзер с переворотом
│       │   ├── FiltersPanel.tsx  # группы фильтров (сайдбар и шторка)
│       │   ├── MapView.tsx       # Leaflet + метки + маршрут
│       │   ├── Rating.tsx        # звёзды, избранное
│       │   ├── SocialLinks.tsx
│       │   └── CitySkyline.tsx   # силуэт города в hero
│       ├── pages/                # Home, Places, PlaceDetail, Collections,
│       │                         # CollectionDetail, RoutesPage, RouteDetail,
│       │                         # Challenges, Profile, NotFound
│       └── styles/
│           ├── base.css          # токены, кнопки, карточки, шапка, навигация
│           └── pages.css         # hero, каталог, детальные страницы, профиль
└── backend/Nsk.Api/
    ├── Program.cs                # эндпоинты /api/*
    ├── Models.cs                 # C#-модели (зеркало seed)
    ├── Data/SeedRepository.cs    # загрузка сида, чек-ины, haversine
    ├── Nsk.Api.csproj            # net11.0 + копирование seed при сборке
    └── Properties/launchSettings.json
```

---

## 4. Данные о местах — самое важное

### 4.1 Откуда они взялись

- Названия и адреса — из твоего брифа (реальные новосибирские места) плюс несколько
  общеизвестных точек (Бугринский мост, Нарымский сквер, Стоквартирный дом и т.п.).
- Описания, советы, отзывы — сгенерированы для прототипа. **Это демо-данные, а не выгрузка
  реальных отзывов.**
- Координаты — приблизительные (точность ~100–300 м), кроме Академгородка и крематория, где
  координаты поправлены вручную.
- Поле `reviews[].source` со значением «Яндекс Карты» — просто подпись демо-источника.

**Важно юридически.** Скрапить отзывы и данные из Яндекс Карт или 2ГИС нельзя — это нарушает
их условия. Легальные варианты: официальный API (нужен ключ и тариф), партнёрская выгрузка или
собственные отзывы пользователей. Структура под замену уже готова — меняется только содержимое
`seed.json`.

### 4.2 Где лежит и как используется

| Где | Что происходит |
| --- | --- |
| `frontend/src/data/seed.json` | Единственный источник контента |
| `frontend/src/data/index.ts` | Импортирует JSON, добавляет отзывам id, строит `placeById`, считает статистику |
| `backend/Nsk.Api/Nsk.Api.csproj` | Копирует этот же JSON в сборку как `Data/seed.json` |
| `backend/Nsk.Api/Data/SeedRepository.cs` | Читает JSON при старте API в память |

Из этого следует:

- правишь **только** `frontend/src/data/seed.json`;
- бэкенд при следующем `dotnet run` подхватит изменения (сид читается при старте);
- фронтенд подхватит изменения при `npm run dev` (HMR) или новой сборке;
- после деплоя посетители получат новый контент при следующем онлайн-визите.

### 4.3 Анатомия места

Пример реальной записи (сокращён):

```json
{
  "id": "art-museum",
  "name": "Новосибирский художественный музей",
  "shortName": "Художественный музей",
  "category": "museum",
  "type": "художественный музей",
  "themes": ["архитектура", "история", "арт"],
  "mood": ["культурно", "атмосферно"],
  "company": ["один", "пара", "с друзьями"],
  "budget": "upto500",
  "priceText": "300–500 ₽",
  "duration": "1to3h",
  "durationText": "1–2 часа",
  "timeOfDay": ["день", "вечер"],
  "transport": "both",
  "address": "Красный проспект, 5",
  "lat": 55.0218,
  "lng": 82.9214,
  "hours": "вт–вс 11:00–19:00",
  "rating": 4.7,
  "reviewsCount": 1243,
  "uniqueness": 7,
  "popularity": 82,
  "short": "Главный художественный музей Сибири…",
  "description": "В коллекции — иконы, русский авангард…",
  "tips": "Берите билет на утренний сеанс в будни…",
  "bestTime": "Будни днём — почти пусто",
  "cover": { "pattern": "waves", "from": "#95baeb", "to": "#fff7e6" },
  "reviews": [
    {
      "author": "Ирина",
      "rating": 5,
      "date": "2025-11-03",
      "text": "Хорошая коллекция и спокойная атмосфера.",
      "source": "Яндекс Карты"
    }
  ]
}
```

| Поле | Зачем |
| --- | --- |
| `id` | Уникальный латинский slug. Из него получается URL `/mesta/art-museum`, на него ссылаются подборки и маршруты |
| `name` / `shortName` | Полное имя на странице места / короткое в карточках и на карте |
| `category` | Категория из списка ниже. Влияет на фильтр, подпись и эмодзи |
| `type` | Человекочитаемая подпись («бар», «смотровая») в hero карточки места |
| `themes` | 1–3 темы: архитектура, история, арт, природа, еда |
| `mood` | Настроение: поесть, культурно, активно, атмосферно |
| `company` | С кем подходит: один, пара, с друзьями, с детьми |
| `budget` | `free`, `upto500`, `500to1500`, `over1500` |
| `priceText` | Что видит пользователь: «Бесплатно», «300–500 ₽» |
| `duration` | `upto1h`, `1to3h`, `halfday` |
| `durationText` | «1–2 часа» для показа |
| `timeOfDay` | утро, день, вечер, ночь |
| `transport` | `walk`, `transport`, `both` |
| `address`, `lat`, `lng` | Адрес и координаты (для карты и чек-ина) |
| `hours` | Часы работы строкой |
| `rating`, `reviewsCount` | Показываются в карточке; **автоматически не пересчитываются** |
| `uniqueness` | 1–10, сортировка «Небанальное» |
| `popularity` | 0–100, сортировка «Популярное» и подборки на главной |
| `short` | Подводка на карточке (2 строки) |
| `description` | Основной текст на странице места |
| `tips` | Блок «Совет от местных» |
| `bestTime` | Факт «Когда лучше» |
| `cover` | Градиент + узор обложки (см. раздел 7) |
| `image` | Необязательное фото места: путь от корня сайта или URL |
| `reviews` | 1–3 демо-отзыва |

### 4.4 Справочники значений

Категории (и где менять их подписи/эмодзи — `frontend/src/lib/filters.ts`):

| `category` | Подпись | Эмодзи |
| --- | --- | --- |
| `museum` | Музей | 🏛️ |
| `cafe` | Кофейня | ☕ |
| `bar` | Бар | 🍷 |
| `park` | Парк | 🌳 |
| `viewpoint` | Смотровая | 🔭 |
| `art` | Арт-пространство | 🎨 |
| `sport` | Спорт | 🏒 |
| `theatre` | Театр | 🎭 |
| `zoo` | Зоопарк | 🦌 |
| `quest` | Квест | 🧭 |
| `memorial` | Легенда | 🕯️ |
| `food` | Еда | 🍔 |
| `nature` | Природа | 🌿 |

Правила фильтров (см. `frontend/src/lib/filters.ts`):

- бюджет, длительность и категория — точное совпадение;
- `transport: "both"` подходит и под «Пешком», и под «На транспорте»;
- компания, темы, время суток и настроение — пересечение массивов (достаточно одного общего
  значения).

### 4.5 Как добавить новое место

1. Открой `frontend/src/data/seed.json`, найди массив `places`.
2. Скопируй соседний объект целиком и поменяй поля. Придумай новый `id` (латиница, дефисы).
3. Проверь допустимые значения по таблицам выше — опечатка в `budget` не сломает сборку, но
   место просто выпадет из фильтра.
4. Добавь 1–3 отзыва с датой в формате `YYYY-MM-DD`.
5. Если место должно попасть в подборку/маршрут/челлендж — добавь его `id` в `placeIds` нужного
   объекта.
6. Запусти проверку:

   ```bash
   cd frontend
   npm run validate:data
   ```

7. Открой `npm run dev` и проверь `/mesta/<новый-id>`.

Чек-лист перед коммитом: `id` уникален → координаты в Новосибирске → нет опечаток в enum →
у всех подборок/маршрутов/челленджей существуют их `placeIds` → валидатор зелёный.

### 4.6 Изменить или удалить место

- Меняешь текст — просто правь строки.
- Меняешь `id` — обнови его во всех `placeIds` (валидатор покажет битые ссылки).
- Удаляешь место — сначала убери его из подборок, маршрутов и челленджей.
- Поменял координаты — проверь, что чек-ин всё ещё срабатывает у входа (радиус 200 м).

### 4.7 Подборки, маршруты, челленджи

Подборка (`collections[]`): `id`, `title`, `subtitle`, `description`, `placeIds` (3–6),
`duration`, `placesCount` (должен совпадать с длиной `placeIds`), `cover`, `accent`.

Маршрут (`routes[]`): `id`, `title`, `length` (`short`/`long`), `durationMin`, `distanceKm`,
`placeIds`, `description`, `cover`. Расстояние на странице считается по координатам — поле
`distanceKm` остаётся справочным.

Челлендж (`challenges[]`): `id`, `title`, `description`, `target`, `reward`, `partner`,
`placeIds`, `cover`, `difficulty`. Важно: `target` не больше числа мест, иначе челлендж
невозможно закрыть (валидатор предупредит).

### 4.8 Валидатор

`frontend/scripts/validate-seed.mjs` проверяет:

- обязательные поля и уникальность `id`;
- допустимые значения категорий, бюджетов, длительностей, тем, настроений, компаний, времени;
- координаты в границах Новосибирска, рейтинг/уникальность/популярность;
- HEX-цвета и паттерны обложек;
- даты и рейтинги отзывов;
- ссылки `placeIds` во всех подборках/маршрутах/челленджах;
- вместимость челленджей и `placesCount`.

Запуск: `npm run validate:data`. Ошибки — блокируют (exit code 1), предупреждения — просто текст.

### 4.9 Отзывы

- Демо-отзывы лежат в `places[].reviews`. Если не указать `id`, он сгенерируется автоматически
  в `frontend/src/data/index.ts`.
- Отзывы пользователей хранятся в `localStorage` и показываются первыми.
- Если API запущен, отзыв дополнительно уходит на сервер (`POST /api/places/{id}/reviews`) и
  живёт в памяти до перезапуска.
- Реальные отзывы: замени содержимое `reviews` (и убери подпись «Яндекс Карты», если данные не
  оттуда) или подключи официальный API источника.

### 4.10 Фото мест (поддержка уже встроена)

По умолчанию обложки рисуются SVG-градиентами (`src/components/Cover.tsx`) — это работает офлайн
и не требует лицензий. Но если у места указано поле `image`, карточка и hero показывают фото;
если файл не загрузился, автоматически возвращается генеративная обложка.

Как добавить фото:

1. Положи файл в `frontend/public/images/places/`, например `art-museum.jpg`
   (WebP/JPEG, 1200×800, до 200 КБ — карточки режут по `object-fit: cover`).
2. В `seed.json` у места добавь:
   `"image": "images/places/art-museum.jpg"` — путь от корня сайта. Абсолютный URL тоже можно.
   На GitHub Pages префикс `/NSKproject/` подставляется автоматически (`src/lib/media.ts`).
3. Проверь `npm run validate:data` — валидатор убедится, что файл существует.
4. `npm run dev` — фото появится в каталоге, рандомайзере и на странице места.

Эмодзи на обложке автоматически скрывается, когда есть фото. Места без `image` продолжают жить
на генеративных обложках, так что переводить весь каталог на фото не обязательно.

Бэкенд отдаёт `image` в API (поле добавлено в `Models.cs`), но для статического сайта это
необязательно. Про лицензии на фото — см. `frontend/public/images/places/README.md`.

### 4.11 Координаты

- Бери десятичные градусы (`55.0218, 82.9214`), не градусы-минуты.
- Удобно копировать из Яндекс Карт: правый клик по точке → «Что здесь?» → координаты.
- Радиус проверки — 200 м, задаётся в двух местах: `frontend/src/config.ts`
  (`SITE.checkinRadius`) и `backend/Nsk.Api/Data/SeedRepository.cs` (`Geo.RadiusMeters`).
  Меняй синхронно.

---

## 5. Иконки

В проекте три независимых слоя иконок — не перепутай.

### 5.1 UI-иконки (SVG)

Файл: **`frontend/src/icons.tsx`**. Внутри:

1. Тип `IconName` — объединение имён.
2. Объект `paths: Record<IconName, string>` — SVG-пути в системе 24×24.
3. Компонент `Icon` — рендерит `<svg>` с `stroke="currentColor"`, толщиной 1.7, скруглениями.

Использование в коде:

```tsx
import { Icon } from '../icons'

<Icon name="heart" size={18} />
<Icon name="star" size={14} style={{ fill: 'gold' }} />
```

Добавить свою иконку:

1. Добавь имя в `IconName`, например `'bike'`.
2. Добавь путь в `paths`:
   ```ts
   bike: 'M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M14 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M9 15l3-5 3 5 M12 10V7h3',
   ```
3. Используй `<Icon name="bike" />`.

Путь можно взять из Lucide/Feather (лицензия MIT), из Figma или нарисовать. Главное — рисовать
в viewBox 24×24 линиями (не заливкой), тогда иконка впишется в стиль. Цвет наследуется от текста
(`currentColor`), размер — проп `size`.

Иконки в проекте: `pin, heart, star, compass, shuffle, clock, wallet, users, walk, bus, coffee,
museum, park, camera, ticket, gift, check, chevron, search, filter, close, share, route, trophy,
user, sparkles, arrow, moon, sun, instagram, vk, telegram, youtube, map`.

Альтернатива: поставить `lucide-react` и использовать его иконки напрямую — но тогда стиль
толщины линий надо подгонять под текущий.

### 5.2 Эмодзи категорий

Файл: **`frontend/src/lib/filters.ts`**, объект `categoryMeta`. Каждая категория имеет
`label`, `emoji` и `icon` (строковое имя UI-иконки; сейчас в интерфейсе используется в основном
эмодзи).

Где видно эмодзи:

- карточка места (чип категории и крупный глиф на обложке) — `PlaceCard.tsx`;
- метки на карте — `MapView.tsx`;
- рандомайзер — `Randomizer.tsx`;
- чипы фильтров берут только `label`.

Меняешь эмодзи — меняется сразу везде. Помни, что эмодзи выглядят по-разному в Apple/Google/
Windows, а в некоторых шрифтах могут отсутствовать.

### 5.3 Фавикон и PWA-иконки

Файлы:

- `frontend/public/favicon.svg` — иконка вкладки;
- `frontend/public/icons/icon.svg`, `icon-192.png`, `icon-512.png` — PWA;
- `frontend/public/manifest.webmanifest` — какие файлы использовать;
- `frontend/index.html` — `<link rel="icon">`, `apple-touch-icon`, `theme-color`.

Порядок замены:

1. Нарисуй квадратную иконку (лучше 512×512, без мелких деталей).
2. Сохрани SVG в `public/favicon.svg` и `public/icons/icon.svg`.
3. Сгенерируй PNG 192 и 512. Например, Python + Pillow:

   ```python
   from PIL import Image
   img = Image.open('icon.png').convert('RGBA')
   img.resize((192, 192), Image.LANCZOS).save('public/icons/icon-192.png')
   img.resize((512, 512), Image.LANCZOS).save('public/icons/icon-512.png')
   ```

4. Если менял состав оболочки (например, добавил файл в `SHELL`), подними версию кэша в
   `public/sw.js`: `CACHE = 'vokrug-nsk-v3'`. Иначе у вернувшихся посетителей останется старый
   кэш.
5. Проверь `manifest.webmanifest`: пути относительные (`icons/...`, `start_url: "./"`), это важно
   для GitHub Pages.

### 5.4 Иконки соцсетей

`frontend/src/config.ts` → `SITE.socials`: `id`, `label`, `href`, `icon`. Значение `icon`
должно совпадать с именем из `icons.tsx` (`telegram`, `vk`, `instagram`, `youtube`). Сейчас
ссылки — заглушки на главные страницы соцсетей, замени `href` на свои. Добавляешь новую
соцсеть — добавь иконку в `icons.tsx` и запись в массив; рендер уже готов (`SocialLinks.tsx`).
Instagram-кнопка получает фирменный градиент через класс `.social-btn__icon--ig` в `base.css`.

---

## 6. Стили и дизайн

Два файла:

- **`frontend/src/styles/base.css`** — дизайн-токены, сброс, типографика, кнопки, чипсы, карточки,
  формы, шапка, нижняя навигация, подвал, тосты, общие утилиты.
- **`frontend/src/styles/pages.css`** — hero, быстрые фильтры, рандомайзер, карта, каталог,
  страница места, отзывы, маршруты, челленджи, профиль, шторка фильтров, мобильные доработки.

### 6.1 Палитра и токены

Все цвета — CSS-переменные в `:root` (`base.css`):

```css
--wine: #930400;      /* акценты, CTA, прогресс */
--milk: #fff7e6;      /* фон */
--heavenly: #95baeb;  /* вторичный акцент */
--ink: #241d1a;       /* основной текст */
```

Поменял `--wine` — поменялось везде: кнопки, ссылки, активные чипы, прогресс-бары, hero-солнце.
Радиусы (`--r-sm…--r-xl`), тени (`--shadow-*`), ширина контейнера (`--container`), высота шапки и
нижней навигации — тоже токены.

### 6.2 Шрифты

Подключены в `frontend/index.html` (Google Fonts): **Unbounded** — заголовки, **Golos Text** —
текст. Имена заданы в токенах `--font-display` и `--font-text` (`base.css`).

Чтобы поменять шрифт: замени ссылку в `index.html` и значения токенов. Для офлайна лучше
скачать `woff2` в `public/fonts` и подключить через `@font-face` — тогда шрифт не зависит от
Google.

### 6.3 Где править конкретный блок

| Что | Файл / класс |
| --- | --- |
| Цвета, кнопки, чипсы, карточки | `base.css` (`.btn`, `.chip`, `.card`) |
| Hero и параллакс | `pages.css` (`.hero*`), разметка — `pages/Home.tsx`, `CitySkyline.tsx` |
| Быстрые фильтры | `.quick*` в `pages.css` |
| Рандомайзер | `.randomizer*`, `.rnd-card*` |
| Карта | `.map-card*`, `components/MapView.tsx` |
| Каталог и фильтры | `.catalog*`, `.filters*`, `.places-grid`, `pages/Places.tsx` |
| Страница места | `.place-hero*`, `.place-facts`, `.reviews*` |
| Профиль | `.profile*`, `.achievement*`, `.settings*` |
| Шапка/нижнее меню | `.header*`, `.tabbar*` |

Брейкпоинты: `560px`, `620px`, `700px`, `900px`, `980px`, `1100px`. Основная логика — mobile-first,
десктоп добавляется через `@media (min-width: 900px)`.

### 6.4 Тёмная тема

Сейчас её нет (в ТЗ — опционально). Если делать: добавь `@media (prefers-color-scheme: dark)`
или класс `theme-dark` на `<html>` с переопределением токенов. Главное — сохранить `#930400` и
`#95baeb` как акценты и не потерять контраст текста (WCAG 2.1 AA).

---

## 7. Обложки (Cover)

`frontend/src/components/Cover.tsx`:

- `CoverArt` рисует SVG с градиентом `cover.from → cover.to` и одним из паттернов:
  `waves`, `grid`, `arcs`, `blobs`, `stripes`, `noise`.
- `Cover` — обёртка: арт + крупный эмодзи + чип категории + кнопка избранного.
- Для каждой карточки цвет и паттерн берутся из данных (`cover` в `seed.json`), поэтому
  разнообразие достигается без картинок.

Добавить новый паттерн: в `CoverArt` добавь `case 'myPattern'` с SVG-фигурами и расширь тип
`CoverPattern` в `src/types.ts`. Не забудь добавить значение в валидатор
(`scripts/validate-seed.mjs`, массив `PATTERNS`).

Параллакс на странице места — в `pages/PlaceDetail.tsx` (`artRef`, обработчик скролла), в hero
главной — в `pages/Home.tsx` (CSS-переменная `--p`).

---

## 8. Страницы и навигация

Маршруты — `frontend/src/App.tsx`:

```
/                 Home
/mesta            Places
/mesta/:id        PlaceDetail
/podborki         Collections
/podborki/:id     CollectionDetail
/marshruty        RoutesPage
/marshruty/:id    RouteDetail
/chellendzhi      Challenges
/profil           Profile
*                 NotFound
```

Навигация — `components/Layout.tsx`:

- `NAV` — массив пунктов для шапки и нижнего меню (5 пунктов).
- Нижнее меню — `.tabbar` в `base.css` с `grid-template-columns: repeat(5, 1fr)`. Добавляешь
  шестой раздел — поменяй на `repeat(6, 1fr)` и подбери иконку в тернарнике внутри `TabBar`.
- `ScrollToTop` прокручивает наверх при смене маршрута.
- `basename` для GitHub Pages задаётся в `main.tsx` из `import.meta.env.BASE_URL`.

Новая страница:

1. Создай `src/pages/MyPage.tsx`.
2. Добавь `<Route path="/moya" element={<MyPage />} />` в `App.tsx`.
3. Добавь пункт в `NAV` (если нужен в меню) и иконку в тернарник `TabBar`.

---

## 9. Состояние и localStorage

`frontend/src/lib/store.tsx` — React Context + `localStorage`.

Хранится:

```ts
{
  favorites: string[],                 // id мест
  checkins: { placeId, at, lat, lng, distance }[],
  reviews: Record<placeId, Review[]>,
  name: string,
  demoGeo: boolean
}
```

Ключ — `STORAGE_KEY` в `src/config.ts` (`vokrug-nsk:v1`). Если меняешь структуру состояния,
подними версию ключа, иначе старые данные могут сломать приложение.

API стора: `isFavorite`, `toggleFavorite`, `checkinFor`, `addCheckin`, `addReview`, `setName`,
`setDemoGeo`, `reset`, `notify`, `backend`, `setBackend`. Пользуйся через хук:

```tsx
const { favorites, toggleFavorite, notify } = useStore()
```

Сброс — кнопка в профиле («Очистить данные») или в DevTools: Application → Local Storage.

---

## 10. Гео-чек-ины

Цепочка:

1. Пользователь нажимает «Я здесь — отметиться» (`pages/PlaceDetail.tsx`) или «отметиться» в
   челлендже (`pages/Challenges.tsx`).
2. Если в профиле включён демо-режим — координаты подставляются рядом с местом.
3. Иначе `getPosition()` из `lib/geo.ts` запрашивает геолокацию браузера.
4. `distanceMeters()` считает расстояние по формуле гаверсинуса.
5. Если `distance <= SITE.checkinRadius` (200 м) — чек-ин сохраняется в `localStorage`, а при
   живом API уходит `POST /api/checkins`; сервер пересчитывает расстояние и тоже проверяет 200 м.
6. Иначе — тост «Вы в N м от места. Нужно быть ближе 200 м».

Требования:

- **HTTPS или localhost.** По `http://192.168.x.x` браузеры блокируют геолокацию. Для телефона
  используй туннель (`cloudflared`) или демо-режим.
- Разрешение пользователя. Если запрещено — покажется понятная ошибка.
- Точность GPS в помещении может быть 50–100 м; радиус 200 м это компенсирует, но у входа
  проверяй.

Демо-режим: Профиль → «Демо-режим геолокации». Полезен для показа на ноутбуке.

---

## 11. Бэкенд и API

Каталог: `backend/Nsk.Api`. Минимальный API без базы данных.

| Метод | Путь | Что делает |
| --- | --- | --- |
| GET | `/api/health` | Статус и счётчики |
| GET | `/api/places` | Список с фильтрами (`budget`, `company`, `duration`, `category`, `theme`, `timeOfDay`, `transport`, `mood`, `q`, `sort`) |
| GET | `/api/places/{id}` | Место |
| GET | `/api/places/{id}/reviews` | Отзывы (сид + добавленные) |
| POST | `/api/places/{id}/reviews` | Новый отзыв |
| GET | `/api/collections` | Подборки |
| GET | `/api/routes?length=short` | Маршруты |
| GET | `/api/challenges` | Челленджи |
| POST | `/api/checkins` | Чек-ин с проверкой расстояния |
| GET | `/api/checkins/{deviceId}` | История чек-инов устройства |

Устройство:

- `SeedRepository` читает `Data/seed.json` при старте, держит в памяти.
- `CheckinService` — `ConcurrentDictionary` по `deviceId`; данные теряются при перезапуске.
- Добавленные отзывы — тоже в памяти.
- CORS разрешён для `localhost:5173` (см. `Program.cs`).
- Порт 5080 задан в `launchSettings.json`; поменяешь — обнови прокси в `vite.config.ts` или
  задай `VITE_API_PROXY`.
- Если соберёшь фронт в `wwwroot`, API отдаст SPA и API с одного порта (`UseDefaultFiles` +
  `MapFallbackToFile`).

Запуск/сборка:

```bash
cd backend/Nsk.Api
dotnet run
dotnet build
```

Проект нацелен на `net11.0`. Если у тебя .NET 10 — поменяй `TargetFramework` в `Nsk.Api.csproj`
и проверь, что рантайм установлен.

---

## 12. PWA и офлайн

- `public/manifest.webmanifest` — имя, цвета, иконки, shortcuts. `display: "browser"` — сайт
  специально не устанавливается как отдельное приложение.
- `public/sw.js` — service worker:
  - при установке кэширует оболочку и хешированные бандлы, которые находит в `index.html`;
  - навигация — network-first, при офлайне отдаёт кэшированный `index.html`;
  - статика — cache-first;
  - версия кэша `vokrug-nsk-v2`; меняешь состав оболочки — поднимай версию.
- Регистрация — только в продакшене (`main.tsx`, `import.meta.env.PROD`), в dev её нет.
- Офлайн не работают: плитки карты (OpenStreetMap), Google Fonts, запросы к API. Всё остальное —
  каталог, фильтры, маршруты, избранное — работает.

Проверка офлайна:

```bash
npm run build
npm run preview
# открыть, дождаться загрузки, DevTools → Network → Offline → Reload
```

---

## 13. Деплой

### GitHub Pages (текущий)

Сайт: https://moonshinerye.github.io/NSKproject/

- Workflow `.github/workflows/deploy-pages.yml` запускается на push в `main` или `Test`.
- Собирает фронт с `GITHUB_PAGES=true` → `base = '/NSKproject/'`.
- Копирует `dist/index.html` в `dist/404.html` — чтобы глубокие ссылки работали.
- Публикует `frontend/dist` через `actions/deploy-pages`.

Как обновить: закоммитить и запушить в `Test` (или `main`). Через ~1 минуту изменения на сайте.
Статус — вкладка **Actions**. Вручную — **Run workflow**.

### Netlify / Vercel

В репозитории есть `netlify.toml` и `vercel.json` с SPA-редиректами. Импортируй репозиторий —
настройки подхватятся. Для Netlify без Git: `npm run build` и перетащить `frontend/dist` на
https://app.netlify.com/drop.

### Свой домен

Купи домен → в GitHub: **Settings → Pages → Custom domain** → добавь DNS-записи (A/AAAA или
CNAME на `moonshinerye.github.io`) → включи Enforce HTTPS. Для Netlify/Vercel — их инструкции,
там домен подключается в панели.

### API на хостинге

Статический хостинг API не запускает. Варианты: Render, Azure App Service, Fly.io, VPS. После
деплоя собери фронт с адресом API:

```bash
VITE_API_URL=https://api.example.com npm run build
```

И добавь домен фронта в CORS (`Program.cs`).

### Временный туннель

```bash
cd frontend && npm run build && npm run preview -- --port 4173
cloudflared tunnel --url http://127.0.0.1:4173
```

Даёт HTTPS-ссылку для телефонов (и геолокация работает). Живёт, пока запущен туннель.

---

## 14. Тесты и проверки

| Что | Команда | Требования |
| --- | --- | --- |
| Типы | `npm run typecheck` | — |
| Линтер | `npm run lint` | — |
| Данные | `npm run validate:data` | — |
| Сборка | `npm run build` | — |
| E2E | `npm run e2e` | dev-сервер + API |
| Скриншоты | `npm run screenshots` | dev-сервер, Chromium Playwright |

E2E проверяет 14 сценариев: фильтр «Бесплатно», поиск, сортировку по геолокации, сохранение
избранного после перезагрузки, рандомайзер, успешный чек-ин рядом с местом, отказ при расстоянии,
публикацию отзыва, прогресс челленджей, статус API, отсутствие JS-ошибок, мобильные фильтры и
навигацию.

Первый запуск Playwright (если браузер не скачан):

```bash
cd frontend
npx playwright install chromium
```

---

## 15. Git и ветки

- `Test` — рабочая ветка, отсюда деплоится сайт.
- `main` — по умолчанию, но в неё случайно попал коммит «Push» с `node_modules`, `bin/obj` и
  `.DS_Store` (~100 МБ истории). Сайт это не ломает.

Как почистить `main` (осознанно, перепишет историю ветки):

```bash
git checkout main
git reset --hard origin/Test      # main станет копией Test
git push --force-with-lease origin main
git checkout Test
```

Перед этим убедись, что в `main` нет ничего ценного (сейчас там только мусор). Сила `--force-with-lease`
безопаснее обычного `--force`: не затрёт чужие изменения, если они появились.

Обычный цикл:

```bash
cd ~/NSKproject
git add -A
git commit -m "feat: добавил место «...»"
git push origin Test
```

Посмотреть, что изменилось: `git status`, `git diff`, `git log --oneline -10`.

---

## 16. Рецепты частых правок

| Задача | Где менять |
| --- | --- |
| Добавить/изменить место | `frontend/src/data/seed.json`, затем `npm run validate:data` |
| Поменять название сайта в шапке | `frontend/src/components/Layout.tsx` (текст) и `config.ts` (`tagline`) |
| Поменять соцсети | `frontend/src/config.ts` → `SITE.socials` |
| Поменять радиус чек-ина | `config.ts` + `SeedRepository.cs` (`Geo.RadiusMeters`) |
| Поменять цвета | `frontend/src/styles/base.css`, блок `:root` |
| Поменять шрифт | `index.html` + токены `--font-display` / `--font-text` |
| Поменять иконку интерфейса | `frontend/src/icons.tsx` |
| Поменять эмодзи категории | `filters.ts` → `categoryMeta` |
| Поменять фавикон/PWA-иконку | `frontend/public/`, `manifest.webmanifest`, при необходимости `sw.js` |
| Добавить фото места | файл в `public/images/places/` + `image` в `seed.json` |
| Добавить фильтр | `types.ts` → `Filters`, `filters.ts` → опции и `filterPlaces`, `FiltersPanel.tsx` |
| Добавить страницу | `pages/`, `App.tsx`, при желании `Layout.tsx` → `NAV` |
| Поменять порядок блоков на главной | `pages/Home.tsx` |
| Сбросить прогресс | Профиль → «Очистить данные» |
| Обновить сайт | `git push origin Test` |

---

## 17. Подводные камни

1. **id — это ключ.** Переименовал место — обнови ссылки во всех подборках/маршрутах/челленджах.
2. **Enum-опечатки не ловятся TypeScript** (JSON приводится к типу принудительно). Спасает
   `npm run validate:data`.
3. **`transport: "both"`** участвует и в «Пешком», и в «На транспорте» — это заложено в
   `filterPlaces`.
4. **Бэкенд читает сид при старте** — после правки `seed.json` перезапусти `dotnet run`, иначе
   API будет отдавать старые данные.
5. **Service worker кэширует агрессивно.** Если поменял `sw.js`, манифест или состав оболочки —
   подними `CACHE` и пересобери. Данные мест обновляются сами (новый хеш JS).
6. **GitHub Pages и base.** Внутри публичного `manifest`/`sw` должны быть относительные пути,
   иначе на подпути `/NSKproject/` будут 404.
7. **localStorage** живёт в браузере. Сменил структуру — подними версию ключа.
8. **Геолокация только на HTTPS/localhost.** Для телефона — туннель или демо-режим.
9. **Карта и шрифты** в офлайне не грузятся — это ожидаемо.
10. **Отзывы** — демо. Перед публикацией либо замени, либо честно пометь.
11. **Фото:** путь в `image` — от корня сайта (`images/places/x.jpg`), не абсолютный `/images/...`; иначе на GitHub Pages будет 404.
12. **`main` засорён** — см. раздел 15.
12. **Не коммить `node_modules`, `dist`, `bin/obj`** — они в `.gitignore`; если попали, удали из
    индекса: `git rm -r --cached <путь>`.

---

## 18. Что дальше

1. **База данных** вместо JSON: PostgreSQL + EF Core, миграции, сид из `seed.json`.
2. **Авторизация** (анонимный токен устройства или телефон), перенос прогресса между устройствами.
3. **Деплой API** (Render/Azure) + `VITE_API_URL`, серверные чек-ины и отзывы для всех.
4. **Фото мест** и настоящие обложки.
5. **Свой домен** и QR-коды для отелей-партнёров.
6. **Админка** для редактирования мест без правки JSON.
7. **Модерация отзывов** и антифрод чек-инов.
8. **Тесты**: Vitest для фильтров/гео, xUnit для API.

---

## 19. Полезные команды

```bash
# разработка
cd ~/NSKproject/frontend && npm run dev
cd ~/NSKproject/backend/Nsk.Api && dotnet run

# проверки
npm run typecheck && npm run lint && npm run validate:data && npm run build

# e2e (нужны dev + API)
npm run e2e

# локально с телефона
ipconfig getifaddr en0        # узнать IP Mac
# открыть http://<IP>:5173

# деплой
git add -A && git commit -m "..." && git push origin Test

# если что-то сломалось в рабочей папке
git status
git restore .                 # отменить незакоммиченные правки
```
