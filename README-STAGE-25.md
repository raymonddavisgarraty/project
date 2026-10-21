# Этап 25 — базовая международная архитектура

Изменения: `src/_data/locales.js`, `src/_data/markets.js`, `src/_data/site.js`, `src/_includes/layouts/base.njk`, `docs/internationalization.md`, `scripts/check-locales.mjs`, `package.json`.

Этот ZIP — **патч**, распаковать в корень проекта с заменой файлов. Он подготовлен на основе последнего присланного ZIP и не включает файлы предыдущего Этапа 24: тот этап уже установлен и успешно собран пользователем.

PowerShell:

```powershell
git status --short
npm run check:locales
npm run build
npm run dev
```

Проверить: `/en/`, `/en/games/`, `/en/games/sweet-bonanza/`, `/en/casinos/royalspin-casino/`. Никаких `/de/` или `/es/` на этом этапе быть не должно.

При успешной проверке:

```powershell
git add src/_data/locales.js src/_data/markets.js src/_data/site.js src/_includes/layouts/base.njk docs/internationalization.md scripts/check-locales.mjs package.json
git commit -m "feat: add international locale and market foundations"
```

Важно: `site.url` пока `https://example.com`; установить реальный домен перед запуском в продакшн.
