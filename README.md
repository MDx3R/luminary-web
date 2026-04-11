# Luminary — Frontend

Веб-клиент Luminary на **Next.js** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**. UI — **Shadcn** (Base UI), состояние — **Zustand**, данные с бэкенда — **TanStack Query**, редактор — **Tiptap** (Markdown).

## Требования

- **Node.js** 20+ (как в `Dockerfile`)
- **pnpm** — включите Corepack: `corepack enable` (локально pnpm подтянется по версии из lockfile)

## Быстрый старт

1. Перейдите в каталог `frontend`.

2. Скопируйте переменные окружения и при необходимости отредактируйте URL API:

   ```powershell
   copy .env.example .env.local
   ```

   - `NEXT_PUBLIC_API_URL` — базовый URL бэкенда **доступный из браузера** (например `http://localhost:8000` в разработке).
   - `NEXT_PUBLIC_DEFAULT_MODEL_ID` — UUID модели по умолчанию для новых чатов (заглушка до выбора модели в UI).

3. Установите зависимости и запустите dev-сервер:

   ```powershell
   pnpm install
   pnpm dev
   ```

4. Откройте [http://localhost:3000](http://localhost:3000).

## Скрипты

| Команда       | Назначение                                        |
| ------------- | ------------------------------------------------- |
| `pnpm dev`    | Режим разработки (hot reload)                     |
| `pnpm build`  | Production-сборка                                 |
| `pnpm start`  | Запуск production после `build`                   |
| `pnpm lint`   | ESLint (`eslint-config-next`), без предупреждений |
| `pnpm format` | Prettier по проекту                               |

После существенных изменений имеет смысл прогнать `pnpm lint` и `pnpm build`.

## Структура каталогов

- `app/` — маршруты App Router (`/`, `/dashboard`, `/folder/[id]`, `/chat/[id]`, `/login`, `/register`, `/settings`).
- `components/` — UI и фичи (в т.ч. Shadcn-компоненты).
- `lib/` — утилиты, клиент API, хелперы.
- `store/` — Zustand-сторы.
- `types/` — общие типы TypeScript.
- `public/` — статика.

## Docker

В корне `frontend` есть **multi-stage** `Dockerfile`: сборка через `pnpm build` с `output: "standalone"` в `next.config.ts`, в runtime — `node server.js` на порту **3000**.

Сборка образа (из каталога `frontend`):

```powershell
docker build -t luminary-frontend .
```

Переменные `NEXT_PUBLIC_*` должны быть заданы на этапе **build**, если они вшиваются в клиентский бандл; для Docker убедитесь, что URL бэкенда корректен для браузера пользователя.
