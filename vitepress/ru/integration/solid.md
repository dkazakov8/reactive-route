# Интеграция с Solid.js

## Нативная реактивность Solid.js

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/solid';
```

Никаких дополнительных пакетов или конфигурации не требуется.

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

Пакет `mobx` должен быть установлен.

У Solid.js нет нативной интеграции с MobX. Поэтому соответствующий код должен быть включен в
entry file, например:

<!-- @include: @snippets/integration/mobx.md -->

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

Пакет `kr-observable` должен быть установлен.

Не забудьте включить интеграцию в entry file:

```ts
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

