# Интеграция с Preact

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-preact';
```

Пакеты `mobx` и `mobx-preact` должны быть установлены.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
```

Пакет `kr-observable` должен быть установлен.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).
