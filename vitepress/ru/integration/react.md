# Интеграция с React

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/mobx-react';
```

Пакеты `mobx` и `mobx-react-lite` должны быть установлены.

Если используется `mobx-react` можно создать alias в бандлере или заменить
`observer` в адаптерах на взятый из `mobx-react`.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
```

Пакет `kr-observable` должен быть установлен.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).