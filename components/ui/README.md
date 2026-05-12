# UI primitives (`components/ui`)

Стек: **Base UI React** + **Tailwind v4** (токены в `app/globals.css`) + стиль **base-nova** (shadcn).

## Когда что использовать

| Поверхность | Компонент | Назначение |
|-------------|-----------|------------|
| Модальное окно по центру | `Dialog` + `DialogContent` | Подтверждения, формы, фокус-ловушка, закрытие по Escape |
| Боковая панель | `Sheet` | Источники папки, панели без полного перекрытия рабочей области |
| Выпадающее меню действий | `DropdownMenu` | Списки команд, контекстное меню |
| Подсказка по hover/focus | `Tooltip` | Краткий текст; провайдер задаёт задержку по умолчанию |
| Якорный слой без списка команд | **Popover** (пока нет в репозитории) | Фильтры, простые flyout; не использовать `DropdownMenu` как замену popover |

Повторяющийся каркас модалок с формой: константа `appModalDialogContentClassName` из `dialog.tsx`.

## Поток ответа ассистента в чате

Общий разбор SSE (`start` / `delta` / `end` / `error`): [`lib/assistant-message-stream.ts`](../../lib/assistant-message-stream.ts) — используйте вместо дублирования цикла в UI.

## Popover

Отдельного `popover.tsx` пока нет; токены `--popover` используются поверхностью меню. При появлении первого кейса «якорь + контент, но не меню» — добавить примитив на `@base-ui/react` в том же стиле, что `Dialog` / `Menu`.

## Обратная связь (toast vs inline)

- **Серьёзные ошибки** (сеть, сохранение, сбой API): [`lib/feedback.ts`](../../lib/feedback.ts) — `notifyError` / `notifyErrorFromUnknown` → Sonner.
- **Мелкие успехи** (копирование, «добавлено в источники» у кнопки): только **inline** в компоненте; не вызывать `toast.success` для этого.
- **a11y:** не дублировать один и тот же текст и в toast, и в `aria-live` без необходимости.

Общий backdrop модалок: `appDialogOverlayClassName` в `dialog.tsx` (используется и в `sheet.tsx`).
