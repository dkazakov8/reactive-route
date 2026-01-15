# Интеграция с Preact

## MobX

Соответствующие импорты:

```typescript
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-preact';
```

Убедитесь, что пакеты `mobx` и `mobx-react-lite` установлены.

Если вы используете `mobx-react` вместо `mobx-react-lite`, вы можете создать псевдоним (alias) в своем сборщике или передать собственные адаптеры с похожей реализацией, но с `observer`, взятым из `mobx-react`.

Не забудьте обернуть ваши компоненты, которые читают наблюдаемые (observable) параметры роутера, в `observer` (если вы используете MobX, это, скорее всего, уже сделано).

## Observable

Соответствующие импорты:

```typescript
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
```

Убедитесь, что пакет `kr-observable` установлен.

Не забудьте обернуть ваши компоненты, которые читают наблюдаемые (observable) параметры роутера, в `observer` (если вы используете Observable, это, скорее всего, уже сделано).

