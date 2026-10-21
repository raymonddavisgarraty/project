# Этап: стабилизация Game Page и Casino Page

Этот архив содержит только 6 изменённых файлов. Распакуйте содержимое архива в корень `seo-review-platform` с заменой соответствующих файлов, предварительно сохранив изменения в Git.

## Изменения
- `games.js`: сохраняется полный объект `rating`.
- `game-grid-card.njk`: для карточек используется `rating.overall`.
- `game.njk`: удалён преждевременный TOC, оглавление составляется по реально присутствующим секциям, отсутствующие секции скрываются.
- `casino.njk`: удалён преждевременный TOC.
- `table-of-contents.njk`: устранён повторяющийся `id=toc-title` между двумя экземплярами оглавления.
- `rating-breakdown.njk`: заголовок получает `id=rating-breakdown`, соответствующий TOC; предотвращается несовпадение якоря.

## Проверка в PowerShell
```powershell
git status --short
npm run build
npm run dev
```

Проверить `/en/games/sweet-bonanza/`, `/en/games/the-big-dog-house/`, `/en/casinos/royalspin-casino/`, `/en/games/`. После успешной проверки:
```powershell
git add src/_data/games.js src/_includes/components/game-grid-card/game-grid-card.njk src/_includes/components/table-of-contents/table-of-contents.njk src/_includes/components/rating-breakdown/rating-breakdown.njk src/en/games/game.njk src/en/casinos/casino.njk
git commit -m "fix: stabilize game ratings and detail page navigation"
```

Примечание: полноценную сборку в среде подготовки архива не удалось выполнить из-за недоступных зависимостей npm. Требуется локальная проверка.
